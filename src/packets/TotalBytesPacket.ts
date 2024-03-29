import { SessionSetupPacket, SessionSetupRequest } from "./SessionSetupPacket.js";

export class TotalBytesPacket extends SessionSetupPacket {
    totalBytes: number
    constructor(totalBytes: number) {
        super(SessionSetupRequest.TotalBytes)
        this.totalBytes = totalBytes
    }
    Pack() {
        super.Pack()
        this.PackInteger(this.dataSize, this.totalBytes);
        this.PackInteger(this.dataSize, this.totalBytes >> 32);
    }
}