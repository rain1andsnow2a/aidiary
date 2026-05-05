// 浏览器麦克风音频处理 util：降采样到 16kHz、PCM16 编码、打包 WAV
// 复用方：RichTextEditor 实时听写、VoiceChatModal 一段录音

export function downsampleBuffer(
  buffer: Float32Array,
  inputSampleRate: number,
  outputSampleRate: number,
): Float32Array {
  if (outputSampleRate >= inputSampleRate) return buffer
  const sampleRateRatio = inputSampleRate / outputSampleRate
  const newLength = Math.round(buffer.length / sampleRateRatio)
  const result = new Float32Array(newLength)
  let offsetResult = 0
  let offsetBuffer = 0
  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio)
    let accum = 0
    let count = 0
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i]
      count++
    }
    result[offsetResult] = count > 0 ? accum / count : 0
    offsetResult++
    offsetBuffer = nextOffsetBuffer
  }
  return result
}

export function encodePcm16(samples: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(samples.length * 2)
  const view = new DataView(buffer)
  let offset = 0
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
  }
  return buffer
}

// 把若干段 PCM16 拼成完整 WAV blob（讯飞要求 16kHz/mono/16bit）
export function pcmChunksToWav(chunks: ArrayBuffer[], sampleRate = 16000): Blob {
  const totalLen = chunks.reduce((n, c) => n + c.byteLength, 0)
  const wav = new ArrayBuffer(44 + totalLen)
  const view = new DataView(wav)

  // RIFF header
  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + totalLen, true)
  writeString(view, 8, 'WAVE')

  // fmt chunk
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true)        // PCM chunk size
  view.setUint16(20, 1, true)         // PCM format
  view.setUint16(22, 1, true)         // mono
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)  // byte rate
  view.setUint16(32, 2, true)         // block align
  view.setUint16(34, 16, true)        // bits per sample

  // data chunk
  writeString(view, 36, 'data')
  view.setUint32(40, totalLen, true)

  let offset = 44
  for (const chunk of chunks) {
    new Uint8Array(wav, offset, chunk.byteLength).set(new Uint8Array(chunk))
    offset += chunk.byteLength
  }

  return new Blob([wav], { type: 'audio/wav' })
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
}
