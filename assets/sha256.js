const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
]);

const INITIAL_STATE = new Uint32Array([
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
]);

const rotateRight = (value, amount) => (value >>> amount) | (value << (32 - amount));

export class Sha256 {
  constructor() {
    this.state = new Uint32Array(INITIAL_STATE);
    this.buffer = new Uint8Array(64);
    this.bufferLength = 0;
    this.bytesHashed = 0;
    this.words = new Uint32Array(64);
    this.finished = false;
  }

  update(input) {
    if (this.finished) throw new Error('Digest already calculated');
    const data = input instanceof Uint8Array ? input : new Uint8Array(input);
    this.bytesHashed += data.length;
    let position = 0;

    if (this.bufferLength > 0) {
      const required = 64 - this.bufferLength;
      const copied = Math.min(required, data.length);
      this.buffer.set(data.subarray(0, copied), this.bufferLength);
      this.bufferLength += copied;
      position += copied;
      if (this.bufferLength === 64) {
        this.processBlock(this.buffer, 0);
        this.bufferLength = 0;
      }
    }

    while (position + 64 <= data.length) {
      this.processBlock(data, position);
      position += 64;
    }

    if (position < data.length) {
      this.buffer.set(data.subarray(position), 0);
      this.bufferLength = data.length - position;
    }
    return this;
  }

  processBlock(data, offset) {
    const w = this.words;
    for (let i = 0; i < 16; i += 1) {
      const j = offset + i * 4;
      w[i] = ((data[j] << 24) | (data[j + 1] << 16) | (data[j + 2] << 8) | data[j + 3]) >>> 0;
    }
    for (let i = 16; i < 64; i += 1) {
      const s0 = rotateRight(w[i - 15], 7) ^ rotateRight(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotateRight(w[i - 2], 17) ^ rotateRight(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let [a, b, c, d, e, f, g, h] = this.state;
    for (let i = 0; i < 64; i += 1) {
      const sigma1 = rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25);
      const choice = (e & f) ^ (~e & g);
      const temp1 = (h + sigma1 + choice + K[i] + w[i]) >>> 0;
      const sigma0 = rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22);
      const majority = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (sigma0 + majority) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    this.state[0] = (this.state[0] + a) >>> 0;
    this.state[1] = (this.state[1] + b) >>> 0;
    this.state[2] = (this.state[2] + c) >>> 0;
    this.state[3] = (this.state[3] + d) >>> 0;
    this.state[4] = (this.state[4] + e) >>> 0;
    this.state[5] = (this.state[5] + f) >>> 0;
    this.state[6] = (this.state[6] + g) >>> 0;
    this.state[7] = (this.state[7] + h) >>> 0;
  }

  digest() {
    if (!this.finished) {
      const finalBlock = this.buffer;
      let length = this.bufferLength;
      finalBlock[length] = 0x80;
      length += 1;

      if (length > 56) {
        finalBlock.fill(0, length, 64);
        this.processBlock(finalBlock, 0);
        length = 0;
      }
      finalBlock.fill(0, length, 56);

      const bitLengthHigh = Math.floor(this.bytesHashed / 0x20000000) >>> 0;
      const bitLengthLow = (this.bytesHashed << 3) >>> 0;
      finalBlock[56] = bitLengthHigh >>> 24;
      finalBlock[57] = bitLengthHigh >>> 16;
      finalBlock[58] = bitLengthHigh >>> 8;
      finalBlock[59] = bitLengthHigh;
      finalBlock[60] = bitLengthLow >>> 24;
      finalBlock[61] = bitLengthLow >>> 16;
      finalBlock[62] = bitLengthLow >>> 8;
      finalBlock[63] = bitLengthLow;
      this.processBlock(finalBlock, 0);
      this.finished = true;
    }

    const output = new Uint8Array(32);
    this.state.forEach((word, i) => {
      output[i * 4] = word >>> 24;
      output[i * 4 + 1] = word >>> 16;
      output[i * 4 + 2] = word >>> 8;
      output[i * 4 + 3] = word;
    });
    return output;
  }

  digestHex() {
    return Array.from(this.digest(), byte => byte.toString(16).padStart(2, '0')).join('');
  }
}
