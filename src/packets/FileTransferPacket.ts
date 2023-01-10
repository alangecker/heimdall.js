import { ControlPacket, ControlType } from "./ControlPacket.js";

export enum FileTransferRequest {
    Flash		= 0x00,
    Dump		= 0x01,
    Part		= 0x02,
    End			= 0x03
}
export class FileTransferPacket extends ControlPacket {
    request: number
    static dataSize = ControlPacket.dataSize + 4
    constructor(request: FileTransferRequest) {
        super(ControlType.FileTransfer);
        this.request = request;
    }
    Pack() {
        super.Pack();
        this.PackInteger(ControlPacket.dataSize, this.request);
    }
}
