import { SessionSetupPacket, SessionSetupRequest } from "./SessionSetupPacket";

export class EnableTFlashPacket extends SessionSetupPacket {
    constructor() {
        super(SessionSetupRequest.EnableTFlash)
    }
}



