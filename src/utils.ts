import { UnpackInteger, UnpackString } from "./libpit.js"

export function concatUint8Array (views: Uint8Array[]) {
    let length = 0
    for (const v of views) {
        length += v.byteLength
    }        
    const buf = new Uint8Array(length)
    let offset = 0
    for (const v of views) {
        const uint8view = new Uint8Array(v.buffer, v.byteOffset, v.byteLength)
        buf.set(uint8view, offset)
        offset += uint8view.byteLength
    }
    
    return buf
}


interface Batch {
    chunksCount: number
    isLast: boolean
    effectiveSize: number
    chunkSize: number

    size: number
    chunks: Chunk[]
}
interface Chunk {
    index: number
    start: number
    end: number
}

export function calculateBatches(bytes: number, chunkSize: number, chunksPerBatch: number) {
    const batches: Batch[] = []
    const batchSize =  chunkSize * chunksPerBatch
    let bytesLeft = bytes;

    while(bytesLeft > 0) {

        const size = bytesLeft <= batchSize ? bytesLeft : batchSize
        const isLast = size < batchSize

        const chunksCount = Math.floor(size % chunkSize == 0 ? size/chunkSize : size/chunkSize+1)

        const firstBatchByteIndex = bytes-bytesLeft
        let chunks: Chunk[] = []
        for(let i=0;i<chunksCount;i++) {

            const thisChunkSize = i == chunksCount-1 && size % chunkSize ? (size % chunkSize) : chunkSize
            chunks.push({
                index: i,
                start: firstBatchByteIndex + i*chunkSize,
                end: firstBatchByteIndex + i*chunkSize + thisChunkSize - 1
            })
        }

        bytesLeft -= size
        const batch: Batch = {
            effectiveSize: size,
            isLast: isLast,
            chunkSize: chunkSize,
            chunksCount: chunksCount,

            size: chunksCount * chunkSize,
            chunks: chunks
        }
        batches.push(batch)
    }
    return batches
}


export class TimeoutError extends Error {
    constructor() {
        super('Promise timed out')
    }
}
export async function promiseWithTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
    let timer: NodeJS.Timeout|number;
    return await Promise.race([
        promise.then((res) => {
            clearTimeout(timer)
            return res
        }),
        new Promise( (_,reject) => {
            timer = setTimeout(() => {
                reject(new TimeoutError)
            }, timeout)
        }) as any
    ])
}


export enum DeviceInfoType {
    MODEL_NAME = 0x00,   // Model's Name
    SERIAL = 0x01,       // Serial Code
    OMCSALESCODE = 0x02, // Region Code
    CARRIERID = 0x03,    // Carrier ID
}
export function parseDeviceInfo(data: Uint8Array) {
    const magic = UnpackInteger(data, 0)
    if(magic !== 0x12345678) {
        throw new Error('Expected 0x12345678 magic number, got 0x'+magic.toString(16))
    }
    const count = UnpackInteger(data, 4)

    const res = {
        modelName: '',
        serial: '',
    }
    for(let i=0;i<count;i++) {
        const type = UnpackInteger(data, 8 + i*12)
        const offset = UnpackInteger(data, 12 + i*12)
        const size = UnpackInteger(data, 16 + i*12)
        const devInfoData = data.slice(offset, offset+size)
        const str = UnpackString(devInfoData, 8)

        switch(type) {
            case DeviceInfoType.MODEL_NAME:
                res.modelName = str
                break
            case DeviceInfoType.SERIAL:
                res.serial = str
                break
        }
    }

    return res
}
