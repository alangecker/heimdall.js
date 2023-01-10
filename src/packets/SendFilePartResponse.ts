import { ResponsePacket, ResponseType } from "./ResponsePacket.js";

export class SendFilePartResponse extends ResponsePacket {
    partIndex: number = -1
    constructor() {
        super(ResponseType.SendFilePart)
    }

    Unpack() {
        if (!super.Unpack()) {
            return false;
        }
        this.partIndex = this.UnpackInteger(ResponsePacket.dataSize);

        return true;

    }
}