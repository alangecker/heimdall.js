import { InboundPacket } from "./InboundPacket.js";

export enum ResponseType {
    SendFilePart = 0x00,
    SessionSetup = 0x64,
    PitFile = 0x65,
    FileTransfer = 0x66,
    EndSession = 0x67,
    DeviceInfo = 0x69
}
export class ResponsePacket extends InboundPacket {
    responseType: ResponseType
    static dataSize = 4
    constructor(responseType: ResponseType) {
        super();
        this.responseType = responseType
    }

    Unpack() {
        var recievedResponseType = this.UnpackInteger(0);
        if (recievedResponseType != this.responseType) {
            this.responseType = recievedResponseType;
            return false;
        }
        return true;
    }
}