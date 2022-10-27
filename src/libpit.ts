
function UnpackInteger(data: Uint8Array, offset: number) {
    return data[offset] | (data[offset + 1] << 8) |
        (data[offset + 2] << 16) | (data[offset + 3] << 24);
}

function UnpackShort(data: Uint8Array, offset: number) {
    return data[offset] | (data[offset + 1] << 8);
}
const textDecoder = new TextDecoder()
function UnpackString(data: Uint8Array, offset: number) {
    if(data[offset] == 0x00) return ''

    let end = data.length
    for(let i=offset;i++;i<data.length) {
        if(data[i] == 0x00) {
            end = i
            break
        }
    }
    const out = data.slice(offset, end)
    return textDecoder.decode(out)
}

enum PitDataConsts {
    FileIdentifier = 0x12349876,
    HeaderDataSize = 28,
    PaddedSizeMultiplicand = 4096,
}

enum PitEntryConsts {
    DataSize = 132,
    PartitionNameMaxLength = 32,
    FlashFilenameMaxLength = 32,
    FotaFilenameMaxLength = 32,
}

export enum BinaryType {
    ApplicationProcessor = 0,
    CommunicationProcessor = 1
}

enum DeviceType {
    OneNand = 0,
    File = 1, // FAT
    MMC = 2,
    All = 3 // ?
}
enum Attribute {
    Write = 1,
    STL = 1 << 1/*,
    BML = 1 << 2*/ // ???
}
enum UpdateAttribute {
    Fota = 1,
    Secure = 1 << 1
}

export interface PitEntry {

    binaryType: number
    deviceType: number
    identifier: number
    attributes: number
    updateAttributes: number

    blockSizeOrOffset: number
    blockCount: number

    fileOffset: number // Obsolete
    fileSize: number // Obsolete

    partitionName: string
    flashFilename: string // USB flash filename
    fotaFilename: string // Firmware over the air
}

interface Pit {
    unknown1?: number
    unknown2?: number
    unknown3?: number
    unknown4?: number
    unknown5?: number
    unknown6?: number
    unknown7?: number
    unknown8?: number
    entries: PitEntry[]
}

export function unpackPit(buf: Buffer|ArrayBuffer) {
    const data = new Uint8Array(buf)
    if (UnpackInteger(data, 0) != PitDataConsts.FileIdentifier) throw new Error("pit doesn't start with magic header")
    
    const entryCount = UnpackInteger(data, 4)

// entries.resize(entryCount);

    const unknown1 = UnpackInteger(data, 8);
    const unknown2 = UnpackInteger(data, 12);
    const unknown3 = UnpackShort(data, 16);
    const unknown4 = UnpackShort(data, 18);
    const unknown5 = UnpackShort(data, 20);
    const unknown6 = UnpackShort(data, 22);
    const unknown7 = UnpackShort(data, 24);
    const unknown8 = UnpackShort(data, 26);

// unsigned int integerValue;
// unsigned int entryOffset;
    let entryOffset = 0

    const entries: PitEntry[] = []
    for(let i=0;i < entryCount; i++) {
        entryOffset = PitDataConsts.HeaderDataSize + i * PitEntryConsts.DataSize

        const entry: PitEntry = {
            binaryType: UnpackInteger(data, entryOffset),
            deviceType: UnpackInteger(data, entryOffset + 4),
            identifier: UnpackInteger(data, entryOffset + 8),
            attributes: UnpackInteger(data, entryOffset + 12),
            updateAttributes: UnpackInteger(data, entryOffset + 16),
            blockSizeOrOffset: UnpackInteger(data, entryOffset + 20),
            blockCount: UnpackInteger(data, entryOffset + 24),
            fileOffset: UnpackInteger(data, entryOffset + 28),
            fileSize: UnpackInteger(data, entryOffset + 32),
            partitionName: UnpackString(data, entryOffset + 36),
            flashFilename: UnpackString(data, entryOffset + 36 + PitEntryConsts.PartitionNameMaxLength),
            fotaFilename:  UnpackString(data, entryOffset + 36 + PitEntryConsts.PartitionNameMaxLength + PitEntryConsts.FlashFilenameMaxLength),

        }
        entries.push(entry)
    }
    const pit: Pit = {
        unknown1,
        unknown2,
        unknown3,
        unknown4,
        unknown5,
        unknown6,
        unknown7,
        unknown8,
        entries
    }
    return pit
}