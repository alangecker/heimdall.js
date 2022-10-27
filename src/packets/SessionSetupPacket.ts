import { ControlPacket, ControlType } from "./ControlPacket";

export enum SessionSetupRequest {
    BeginSession = 0,
    DeviceType = 1, // ?
    TotalBytes = 2,
    //EnableSomeSortOfFlag = 3,
    FilePartSize = 5,
    EnableTFlash = 8
}
export class SessionSetupPacket extends ControlPacket {
    request: number
    constructor(request: SessionSetupRequest) {
        super(ControlType.Session);
        this.request = request;
        this.dataSize = ControlPacket.dataSize + 4;
    }

    Pack() {
        super.Pack();

        this.PackInteger(ControlPacket.dataSize, this.request);
    }
}
