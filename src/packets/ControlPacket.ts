import { OutboundPacket } from "./OutboundPacket";

export enum ControlType {
    Session = 0x64,
    PitFile = 0x65,
    FileTransfer = 0x66,
    EndSession = 0x67,
    DeviceInfo = 0x69
}
export class ControlPacket extends OutboundPacket {
    controlType: ControlType
    dataSize: number
    static dataSize = 4
    constructor(controlType: ControlType) {
        super(1024);
        this.controlType = controlType;
        this.dataSize = 4;
    }

    Pack() {
        this.PackInteger(0, this.controlType);
    }
}
