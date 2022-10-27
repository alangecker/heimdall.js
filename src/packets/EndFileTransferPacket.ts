import { FileTransferPacket, FileTransferRequest } from "./FileTransferPacket";

export enum EndFileTransferDestination {
    Phone	= 0x00,
    Modem	= 0x01
}

export class EndFileTransferPacket extends FileTransferPacket {
    static dataSize: number = FileTransferPacket.dataSize + 16
    constructor(
        readonly destination: EndFileTransferDestination, // PDA / Modem
        readonly sequenceByteCount: number,
        readonly unknown1: number, // EFS?
        readonly deviceType: number
    ) {
        super(FileTransferRequest.End)
    }

    Pack() {
        super.Pack()
        this.PackInteger(FileTransferPacket.dataSize, this.destination);
        this.PackInteger(FileTransferPacket.dataSize + 4, this.sequenceByteCount);
        this.PackInteger(FileTransferPacket.dataSize + 8, this.unknown1);
        this.PackInteger(FileTransferPacket.dataSize + 12, this.deviceType);
    }

}