import { ResponsePacket, ResponseType } from "./ResponsePacket.js";

export class PitFileResponse extends ResponsePacket {
    fileSize: number = -1
    constructor() {
        super(ResponseType.PitFile)
    }

    Unpack() {
        if (!super.Unpack()) {
            return false;
        }
        this.fileSize = this.UnpackInteger(ResponsePacket.dataSize);

        return true;

    }
}