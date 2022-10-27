import { ControlPacket, ControlType } from "./ControlPacket";

export enum PitFileRequest {
    Flash			= 0x00,
    Dump			= 0x01,
    Part			= 0x02,
    EndTransfer		= 0x03
}
export class PitFilePacket extends ControlPacket {
    request: PitFileRequest
    static dataSize = ControlPacket.dataSize + 4
    constructor(request: PitFileRequest) {
        super(ControlType.PitFile);
        this.request = request;

    }

    Pack() {
        super.Pack();
        this.PackInteger(ControlPacket.dataSize, this.request);
    }
}