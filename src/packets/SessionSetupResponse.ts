import { ResponsePacket, ResponseType } from "./ResponsePacket.js";

export class SessionSetupResponse extends ResponsePacket {
    result: number|null = null
    protocolVersion: number|null = null
    constructor() {
        super(ResponseType.SessionSetup)
    }

    Unpack() {
        if (!super.Unpack()) {
            return false;
        }
        this.result = this.UnpackInteger(ResponsePacket.dataSize);
        this.protocolVersion = this.result >> 16
        return true;

    }
}