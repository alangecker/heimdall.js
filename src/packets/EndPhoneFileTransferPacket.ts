import { EndFileTransferDestination, EndFileTransferPacket } from "./EndFileTransferPacket";


export class EndPhoneFileTransferPacket extends EndFileTransferPacket {
    endOfFile: number
    fileIdentifier: number
    constructor(
        sequenceByteCount: number,
        unknown1: number,
        chipIdentifier: number,
        fileIdentifier: number,
        endOfFile: boolean
    ) {
        super(EndFileTransferDestination.Phone, sequenceByteCount, unknown1, chipIdentifier)
        this.endOfFile = endOfFile ? 1 : 0
        this.fileIdentifier = fileIdentifier
    }
    Pack() {
        super.Pack()
        this.PackInteger(EndFileTransferPacket.dataSize, this.fileIdentifier);
        this.PackInteger(EndFileTransferPacket.dataSize + 4, this.endOfFile);
    }
}

