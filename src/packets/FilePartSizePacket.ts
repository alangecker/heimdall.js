import { SessionSetupPacket, SessionSetupRequest } from "./SessionSetupPacket.js";

export class FilePartSizePacket extends SessionSetupPacket {
    filePartSize: number
    constructor(filePartSize: number) {
        super(SessionSetupRequest.FilePartSize)
        this.filePartSize = filePartSize
    }
    Pack() {
        super.Pack()
        this.PackInteger(this.dataSize, this.filePartSize);
    }
}