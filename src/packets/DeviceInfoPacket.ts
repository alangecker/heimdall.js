import { ControlPacket, ControlType } from "./ControlPacket.js";

export enum DeviceInfoCommand {
    Start = 0x0,
    DumpBlock = 0x1,
    End = 0x2
}
export class DeviceInfoPacket extends ControlPacket {
    request: number
    constructor(request: DeviceInfoCommand) {
        super(ControlType.DeviceInfo);
        this.request = request;
        this.dataSize = ControlPacket.dataSize + 4;
    }

    Pack() {
        super.Pack();
        this.PackInteger(ControlPacket.dataSize, this.request);
    }
}
