import { OutboundPacket } from "./OutboundPacket";

export class SendFilePartPacket extends OutboundPacket {
    constructor(data: ArrayBuffer) {
        super(data.byteLength);
        this.data = new Uint8Array(data)
    }

    Pack() {}
}
