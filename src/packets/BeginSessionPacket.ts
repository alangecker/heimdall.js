import { SessionSetupPacket, SessionSetupRequest } from "./SessionSetupPacket";

export class BeginSessionPacket extends SessionSetupPacket {
    constructor() {
        super(SessionSetupRequest.BeginSession)
    }
}
