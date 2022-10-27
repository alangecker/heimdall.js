import { Packet } from "./Packet";

export class InboundPacket extends Packet {
    constructor(size = 8) {
        super(size);
        // this.responseType = responseType;
    }

    UnpackInteger(offset: number) {
        var value = this.data[offset] | (this.data[offset + 1] << 8) |
            (this.data[offset + 2] << 16) | (this.data[offset + 3] << 24);
        return value;
    }
    Unpack() {
        return true
    }
}
