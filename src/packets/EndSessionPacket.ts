import { ControlPacket, ControlType } from "./ControlPacket.js";

export enum EndSessionRequest {
    EndSession = 0x0,
    RebootDevice = 0x1,
    Shutdown = 0x3
}
export class EndSessionPacket extends ControlPacket {
    request: EndSessionRequest
    constructor(request: EndSessionRequest) {
        super(ControlType.EndSession);
        this.request = request;

    }

    Pack() {
        super.Pack();
        this.PackInteger(this.dataSize, this.request);
    }
}