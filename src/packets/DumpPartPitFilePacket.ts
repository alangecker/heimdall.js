import { PitFilePacket, PitFileRequest } from "./PitFilePacket";

export class DumpPartPitFilePacket extends PitFilePacket {
    partIndex: number
    constructor(partIndex: number) {
        super(PitFileRequest.Part)
        this.partIndex = partIndex
    }

    Pack() {
        super.Pack()
        this.PackInteger(PitFilePacket.dataSize, this.partIndex);
    }
}