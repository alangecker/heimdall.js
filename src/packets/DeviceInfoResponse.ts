import { ResponsePacket, ResponseType } from "./ResponsePacket.js";

export class DeviceInfoResponse extends ResponsePacket {
    fileSize: number = -1
    constructor() {
        super(ResponseType.DeviceInfo)
    }

    Unpack() {
        if (!super.Unpack()) {
            return false;
        }
        this.fileSize = this.UnpackInteger(ResponsePacket.dataSize);

        return true;

    }
}