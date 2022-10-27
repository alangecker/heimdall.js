import { InboundPacket } from "./InboundPacket";

export class ReceiveFilePartPacket extends InboundPacket {
    static dataSize = 500
    constructor() {
        super(ReceiveFilePartPacket.dataSize);
    }

    Unpack() {
        return true;
    }
}