import { FileTransferPacket, FileTransferRequest } from "./FileTransferPacket";
export class FlashPartFileTransferPacket extends FileTransferPacket {
    constructor(
        readonly sequenceByteCount: number,
    ) {
        super(FileTransferRequest.Part)
    }

    Pack() {
        super.Pack()
        this.PackInteger(FileTransferPacket.dataSize, this.sequenceByteCount);
    }

}