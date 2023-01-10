import { SessionSetupPacket, SessionSetupRequest } from "./SessionSetupPacket.js";

export class EnableTFlashPacket extends SessionSetupPacket {
    constructor() {
        super(SessionSetupRequest.EnableTFlash)
    }
}



