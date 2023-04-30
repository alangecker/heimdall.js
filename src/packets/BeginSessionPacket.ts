import { SessionSetupPacket, SessionSetupRequest } from "./SessionSetupPacket.js";

export class BeginSessionPacket extends SessionSetupPacket {
    static dataSize = SessionSetupPacket.dataSize + 4
    constructor() {
        super(SessionSetupRequest.BeginSession)
    }
    Pack() {
        super.Pack();

        /* Odin protocol version */
        this.PackInteger(SessionSetupPacket.dataSize + 4, 0x4);
    }
}
