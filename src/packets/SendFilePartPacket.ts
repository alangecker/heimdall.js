import { OutboundPacket } from "./OutboundPacket.js";

export class SendFilePartPacket extends OutboundPacket {
    constructor(data: Uint8Array) {
        super(data.byteLength);
        this.data = data
    }

    Pack() {}
}
