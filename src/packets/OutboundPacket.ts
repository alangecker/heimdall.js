import { Packet } from "./Packet";

export class OutboundPacket extends Packet {
    constructor(size: number) {
        super(size);
    }

    PackInteger(offset: number, value: number) {
        this.data[offset] = value & 0x000000FF;
        this.data[offset + 1] = (value & 0x0000FF00) >> 8;
        this.data[offset + 2] = (value & 0x00FF0000) >> 16;
        this.data[offset + 3] = (value & 0xFF000000) >> 24;
    }
    Pack() {

    }
}