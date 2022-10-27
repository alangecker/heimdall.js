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
