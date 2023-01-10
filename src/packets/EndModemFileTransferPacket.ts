import { EndFileTransferDestination, EndFileTransferPacket } from "./EndFileTransferPacket.js";


export class EndModemFileTransferPacket extends EndFileTransferPacket {
    endOfFile: number
    constructor(sequenceByteCount: number, unknown1: number, chipIdentifier: number, endOfFile: boolean) {
        super(EndFileTransferDestination.Modem, sequenceByteCount, unknown1, chipIdentifier)
        this.endOfFile = endOfFile ? 1 : 0
    }
    Pack() {
        super.Pack()
        this.PackInteger(EndFileTransferPacket.dataSize, this.endOfFile);
    }
}