import { describe, it, expect } from 'vitest'
import { float32ArrayToBuffer, bufferToFloat32Array } from '../embeddings'

describe('embedding conversion utilities', () => {
  it('float32ArrayToBuffer converts number array to ArrayBuffer', () => {
    const input = [0.1, 0.2, 0.3]
    const buffer = float32ArrayToBuffer(input)
    expect(buffer).toBeInstanceOf(ArrayBuffer)
    expect(buffer.byteLength).toBe(12) // 3 floats * 4 bytes
  })

  it('bufferToFloat32Array converts ArrayBuffer back to number array', () => {
    const input = [0.1, 0.2, 0.3]
    const buffer = float32ArrayToBuffer(input)
    const output = bufferToFloat32Array(buffer)
    expect(output.length).toBe(3)
    expect(output[0]).toBeCloseTo(0.1)
    expect(output[1]).toBeCloseTo(0.2)
    expect(output[2]).toBeCloseTo(0.3)
  })

  it('round-trip preserves values exactly', () => {
    const input = [1.0, -1.0, 0.0, 0.5, -0.5]
    const buffer = float32ArrayToBuffer(input)
    const output = bufferToFloat32Array(buffer)
    expect(output.length).toBe(input.length)
    for (let i = 0; i < input.length; i++) {
      expect(output[i]).toBeCloseTo(input[i])
    }
  })

  it('handles Uint8Array input in bufferToFloat32Array', () => {
    const input = [0.1, 0.2, 0.3]
    const buffer = float32ArrayToBuffer(input)
    const uint8 = new Uint8Array(buffer)
    const output = bufferToFloat32Array(uint8)
    expect(output.length).toBe(3)
    expect(output[0]).toBeCloseTo(0.1)
    expect(output[1]).toBeCloseTo(0.2)
    expect(output[2]).toBeCloseTo(0.3)
  })

  it('handles empty array', () => {
    const buffer = float32ArrayToBuffer([])
    expect(buffer.byteLength).toBe(0)
    const output = bufferToFloat32Array(buffer)
    expect(output).toEqual([])
  })

  it('handles high-dimensional vectors (384d for MiniLM)', () => {
    const input = Array.from({ length: 384 }, (_, i) => i / 384)
    const buffer = float32ArrayToBuffer(input)
    expect(buffer.byteLength).toBe(384 * 4)
    const output = bufferToFloat32Array(buffer)
    expect(output.length).toBe(384)
    for (let i = 0; i < 384; i++) {
      expect(output[i]).toBeCloseTo(input[i])
    }
  })
})
