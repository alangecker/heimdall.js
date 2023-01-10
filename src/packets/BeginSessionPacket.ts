import { SessionSetupPacket, SessionSetupRequest } from "./SessionSetupPacket.js";

export class BeginSessionPacket extends SessionSetupPacket {
    constructor() {
        super(SessionSetupRequest.BeginSession)
    }
}
