export class Packet {
    size: number
    data: Uint8Array
    constructor(size: number) {
        this.size = size;
        this.data = new Uint8Array(size);
    }
    Buffer() {
        return this.data.buffer.slice(this.data.byteOffset, this.data.byteLength + this.data.byteOffset)
    }
}
