// import type { USBDevice } from 'usb';
import {
    BeginSessionPacket,
    FilePartSizePacket,
    ResponsePacket, ResponseType,
    SessionSetupResponse,
    EnableTFlashPacket,
    TotalBytesPacket,
    PitFilePacket, PitFileRequest,
    PitFileResponse,
    ReceiveFilePartPacket,
    DumpPartPitFilePacket,
    InboundPacket,
    EndModemFileTransferPacket,
    EndFileTransferDestination,
    FileTransferPacket, FileTransferRequest,
    FlashPartFileTransferPacket,
    SendFilePartPacket,
    OutboundPacket,
    SendFilePartResponse,
    EndPhoneFileTransferPacket,
    EndSessionPacket,
    EndSessionRequest,
    DeviceInfoResponse,
    DeviceInfoCommand,
    DeviceInfoPacket
} from './packets/index.js'
import { calculateBatches, concatUint8Array, parseDeviceInfo, promiseWithTimeout } from './utils.js'
import { BinaryType, DeviceType, unpackPit } from './libpit.js'

const USB_CLASS_CDC_DATA = 0x0a;


type BinaryData = Uint8Array

enum kEmptyTransfer {
    None = 0,
    Before = 1,
    After = 1 << 1,
    BeforeAndAfter = Before | After
}

export class OdinDevice {
    device: USBDevice
    protocolInitalized: boolean
    private endpointIn: USBEndpoint
    private endpointOut: USBEndpoint

    private fileTransferSequenceMaxLength = 800;
	private fileTransferPacketSize = 131072;

    constructor(device: USBDevice) {
        this.device = device
        this.protocolInitalized = false
    }

    protocolVersion: number = 0
    modelName: string = ''

    

    private async initalizeProtocol() {
        const probePacket = new TextEncoder().encode("ODIN");
        await this.device.transferOut(this.endpointOut.endpointNumber, probePacket);

        const respPacket = await this.device.transferIn(this.endpointIn.endpointNumber, 4);
        const response = new TextDecoder().decode(respPacket.data);
        if (response !== "LOKE") {
            throw new Error(`Unexpected Response\nExpected: "LOKE"\nReceived: "${response}"`)
        }
        this.protocolInitalized = true;
    }

    async setEndpoints(endpointIn: USBEndpoint, endpointOut: USBEndpoint) {
        this.endpointIn = endpointIn
        this.endpointOut = endpointOut
    }

    async initialise() {
        await this.device.open();
        // Opportunistically reset to fix issues on some platforms
        try {
            await this.device.reset();
        } catch (error) {
            /* Failed = doesn't support reset */
        }
        // await this.device.selectConfiguration(1);
        let interfaceIndex = -1
        let altSettingIndex = -1
        const configuration = this.device.configuration
        if(!configuration) {
            throw new Error('Failed to retrieve config descriptor')
        }
        for(let i =0; i<configuration.interfaces.length; i++) {
            const inf = configuration.interfaces[i]
            for(let j=0; j<inf.alternates.length; j++) {
                if(interfaceIndex < 0 && inf.alternates[j].endpoints.length == 2
                    && inf.alternates[j].interfaceClass == USB_CLASS_CDC_DATA) {
                        interfaceIndex = i;
                        altSettingIndex = j;
                        for(let endpoint of inf.alternates[j].endpoints) {
                            if(endpoint.direction == 'in') this.endpointIn = endpoint
                            else this.endpointOut = endpoint
                        }
                    }
            }
        }

        if(interfaceIndex < 0) {
            throw new Error("Failed to find correct interface configuration\n");
        }

        await this.device.claimInterface(interfaceIndex);
        await this.device.selectAlternateInterface(interfaceIndex, altSettingIndex);
        await this.initalizeProtocol()
    }

    async sendPacket(packet: OutboundPacket, flags: kEmptyTransfer = kEmptyTransfer.After) {
        packet.Pack()

        const res = await this.device.transferOut(this.endpointOut.endpointNumber, packet.Buffer());
        if(res.status != "ok") {
            throw new Error(`error while sending ${packet.constructor.name}`)
        }

        if (flags & kEmptyTransfer.After && this.protocolVersion >= 3) {
            await promiseWithTimeout(this.device.transferOut(this.endpointOut.endpointNumber, new Uint8Array([])), 100).catch(() => {})
        }
    }
    
    async receivePacket<T extends InboundPacket>(packet: T, flags: kEmptyTransfer = kEmptyTransfer.None): Promise<T> {
        if (flags & kEmptyTransfer.Before) {
            await this.device.transferIn(this.endpointIn.endpointNumber, 0)
        }
        let responsePacket = await this.device.transferIn(this.endpointIn.endpointNumber, packet.size);
        if(!responsePacket.data) throw new Error(`responsePacket is missing data attribute. (status=${responsePacket.status}`)
        packet.data = new Uint8Array(responsePacket.data.buffer);
        if(!packet.Unpack()) {
            console.log(packet.data)
            throw new Error(`Error while parsing ${packet.constructor.name}`)
        }
        return packet;
    }

    async beginSession() {
        // console.log('Beginning session...')
        await this.sendPacket(new BeginSessionPacket());
        const resp = await this.receivePacket(new SessionSetupResponse());
        this.protocolVersion = resp.protocolVersion
        const deviceDefaultPacketSize = resp.result

        if (deviceDefaultPacketSize != 0) // 0 means changing the packet size is not supported.
        {
            // console.log('changing file size')
            this.fileTransferPacketSize = 1048576; // 1 MiB
            this.fileTransferSequenceMaxLength = 30

            await this.sendPacket(new FilePartSizePacket(this.fileTransferPacketSize))

            const resp = await this.receivePacket(new SessionSetupResponse());
            if (resp.result != 0) {
                throw new Error(`Unexpected file part size response!\nExpected: 0\nReceived: ${resp.result}\n`);
            }
        }
        if(this.protocolVersion >= 3) {
            const deviceInfo = await this.getDeviceInfo()
            this.modelName = deviceInfo.modelName
        }
    }
    async endSession() {
        // console.log("Ending session...");

        await this.sendPacket(new EndSessionPacket(EndSessionRequest.EndSession))
        await this.receivePacket(new ResponsePacket(ResponseType.EndSession))
    }
    async reboot() {
        // console.log("Rebooting device...\n");
        await this.sendPacket(new EndSessionPacket(EndSessionRequest.RebootDevice))
        await this.receivePacket(new ResponsePacket(ResponseType.EndSession))
    }
    async shutdown() {
        // console.log("shutdown device (if possible)...\n");
        await this.sendPacket(new EndSessionPacket(EndSessionRequest.Shutdown))
    }

    async enableTFlash() {

        await this.sendPacket(new EnableTFlashPacket())
        const resp = await this.receivePacket(new SessionSetupResponse());
        if (resp.result !== 0){
            throw new Error(`Unexpected T-Flash response!\nExpected: 0\nReceived: ${resp.result}\n`);
        }
    }

    async flash(partitionFiles: {[name: string]: BinaryData}) {
        let totalBytes = 0;
        for(let buf of Object.values(partitionFiles)) {
            totalBytes += buf.byteLength
        }

        await this.sendPacket(new TotalBytesPacket(totalBytes))
        const resp = await this.receivePacket(new SessionSetupResponse());
        if (resp.result !== 0){
            throw new Error(`Unexpected session total bytes response!\nExpected: 0\nReceived: ${resp.result}\n`);
        }

        const pit = unpackPit(await this.receivePitFile())
        for(let name in partitionFiles) {
            const pitEntry = pit.entries.find(e => e.partitionName == name)
            if(!pitEntry) throw new Error(`Partition ${name} specified, but could not be found in phone's partition table`)
            const file = partitionFiles[name]
            // console.log(`Uploading ${pitEntry.partitionName}...`)

            const blockSize = pitEntry.deviceType == DeviceType.UFS ? 4096 : 512
            const partitionSize = pitEntry.blockCount * blockSize
            if(partitionSize > 0 && file.byteLength > partitionSize) {
                throw new Error(`${name} partition is too small for given file. (image size: ${file.byteLength}, partiton size: ${partitionSize})`)
            }
            
            if(pitEntry.binaryType === BinaryType.CommunicationProcessor) { // Modem
                await this.sendFile(file, EndFileTransferDestination.Modem, pitEntry.deviceType)
    
            } else {
                await this.sendFile(file, EndFileTransferDestination.Phone, pitEntry.deviceType, pitEntry.identifier)
            }
            // console.log(`${pitEntry.partitionName} upload successful\n`)
        }
    }
    private async sendFile(file: BinaryData, destination: number, deviceType: number, fileIdentifier: number = 0xFFFFFFFF) {
        await this.sendPacket(new FileTransferPacket(FileTransferRequest.Flash))
        await this.receivePacket(new ResponsePacket(ResponseType.FileTransfer))


        const batches = calculateBatches(file.byteLength, this.fileTransferPacketSize, this.fileTransferSequenceMaxLength)

        for(let batch of batches) {
            await this.sendPacket(new FlashPartFileTransferPacket(batch.size))
            await this.receivePacket(new ResponsePacket(ResponseType.FileTransfer))

            for(let chunk of batch.chunks) {
                // NOTE: This empty transfer thing is entirely ridiculous, but sadly it seems to be required.
                const sendEmptyTransferFlags = (chunk.index == 0) ? kEmptyTransfer.None : kEmptyTransfer.Before;

                // Send
                let part: Uint8Array = new Uint8Array(file.slice(chunk.start, chunk.end+1))
                if(part.byteLength < this.fileTransferPacketSize) {
                    // it is expected that every chunk has the same length
                    const chunk = part
                    part = new Uint8Array(this.fileTransferPacketSize)
                    part.set(chunk)
                }
                await this.sendPacket(new SendFilePartPacket(part), sendEmptyTransferFlags)

    
                // Response
                const resp = await this.receivePacket(new SendFilePartResponse())
                const receivedPartIndex = resp.partIndex

                if (receivedPartIndex != chunk.index) {
                    throw new Error(`Expected file part index: ${chunk.index} Received: ${receivedPartIndex}\n`);
                }                
            }
            
            if(destination == EndFileTransferDestination.Phone) {
                await this.sendPacket(new EndPhoneFileTransferPacket(batch.effectiveSize, 0, deviceType, fileIdentifier, batch.isLast), kEmptyTransfer.BeforeAndAfter)
            } else { // destination == EndFileTransferPacket::kDestinationModem
                await this.sendPacket(new EndModemFileTransferPacket(batch.effectiveSize, 0, deviceType, batch.isLast), kEmptyTransfer.BeforeAndAfter)
            }
            await this.receivePacket(new ResponsePacket(ResponseType.FileTransfer))
        }
    }

    async receivePitFile() {
        // console.log("Downloading device's PIT file...\n");

        await this.sendPacket(new PitFilePacket(PitFileRequest.Dump))
        const resp = await this.receivePacket(new PitFileResponse())

        const transferCount = Math.ceil(resp.fileSize / ReceiveFilePartPacket.dataSize)

        const bufs: Uint8Array[] = []

        for(let i=0;i<transferCount;i++) {
            await this.sendPacket(new DumpPartPitFilePacket(i))
            const resp = await this.receivePacket(new ReceiveFilePartPacket(), kEmptyTransfer.None)
            // console.log('got response')
            bufs.push(new Uint8Array(resp.Buffer()))
        }

        // some devices require an emptytransfer here
        // native usb can just send a empty packet without expecting an ack, but with WebUSB
        // it hangs here if we send an packet which is not expected, so we need to define the
        // set of devices required it
        const REQUIRES_ZERO_PACKET = [
            'SM-G900F'
        ]
        
        if(REQUIRES_ZERO_PACKET.includes(this.modelName)) {
            // console.log(`receive zero-length packet due to protocol ${this.protocolVersion} >= 3`)
            await this.device.transferIn(this.endpointIn.endpointNumber, 0)
        } else {
            // console.log('no zero-length packet')
        }
    
        await this.sendPacket(new PitFilePacket(PitFileRequest.EndTransfer))        
        await this.receivePacket(new PitFileResponse())

        // console.log("PIT file download successful.");
        return concatUint8Array(bufs)
    }

    async getDeviceInfo() {
        await this.sendPacket(new DeviceInfoPacket(DeviceInfoCommand.Start))
        const resp = await this.receivePacket(new DeviceInfoResponse())

        const bufs: Uint8Array[] = []
        for (var i = 0; i < Math.floor(resp.fileSize / 500); i++) {

            await this.sendPacket(new DeviceInfoPacket(DeviceInfoCommand.DumpBlock))
            const resp = await this.receivePacket(new ReceiveFilePartPacket(), kEmptyTransfer.None)
            bufs.push(resp.data)
        }

        await this.sendPacket(new DeviceInfoPacket(DeviceInfoCommand.End))
        await this.receivePacket(new DeviceInfoResponse())

        const data = concatUint8Array(bufs)
        return parseDeviceInfo(data)
    }
}