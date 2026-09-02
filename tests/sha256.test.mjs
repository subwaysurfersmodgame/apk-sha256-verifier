import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { Sha256 } from '../assets/sha256.js';
import { compareExpectedHash, normalizeExpectedHash } from '../assets/compare.js';

const digestWithImplementation = (bytes, chunkSize = bytes.length || 1) => {
  const hash = new Sha256();
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    hash.update(bytes.subarray(offset, Math.min(offset + chunkSize, bytes.length)));
  }
  return hash.digestHex();
};

const digestWithNode = bytes => createHash('sha256').update(bytes).digest('hex');

test('matches published empty-input vector', () => {
  assert.equal(digestWithImplementation(new Uint8Array()), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
});

test('matches published abc vector', () => {
  const bytes = new TextEncoder().encode('abc');
  assert.equal(digestWithImplementation(bytes), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});

test('matches published long-message vector', () => {
  const bytes = new TextEncoder().encode('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq');
  assert.equal(digestWithImplementation(bytes), '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1');
});

test('matches Node crypto across SHA-256 padding boundaries', () => {
  for (const length of [1, 55, 56, 63, 64, 65, 127, 128, 129, 1024, 4097]) {
    const bytes = Uint8Array.from({ length }, (_, index) => (index * 37 + 11) & 0xff);
    assert.equal(digestWithImplementation(bytes, 17), digestWithNode(bytes), `length ${length}`);
  }
});

test('matches Node crypto for Unicode UTF-8 bytes', () => {
  const bytes = new TextEncoder().encode('APK checksum — स्थानीय bytes — ملف');
  assert.equal(digestWithImplementation(bytes, 5), digestWithNode(bytes));
});

test('returns the same digest for different update chunk sizes', () => {
  const bytes = Uint8Array.from({ length: 20000 }, (_, index) => (index * 13) & 0xff);
  const expected = digestWithNode(bytes);
  for (const chunkSize of [1, 3, 64, 65, 4096, 20000]) {
    assert.equal(digestWithImplementation(bytes, chunkSize), expected, `chunk ${chunkSize}`);
  }
});

test('normalizes uppercase, spaces, and colon separators', () => {
  const separated = 'BA:78 16BF 8F01 CFEA 4141 40DE 5DAE 2223 B003 61A3 9617 7A9C B410 FF61 F200 15AD';
  assert.equal(normalizeExpectedHash(separated), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});

test('returns match, different, invalid, and empty comparison states', () => {
  const calculated = 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad';
  assert.equal(compareExpectedHash(calculated, calculated).status, 'match');
  assert.equal(compareExpectedHash(calculated, '0'.repeat(64)).status, 'different');
  assert.equal(compareExpectedHash(calculated, 'not-a-hash').status, 'invalid');
  assert.equal(compareExpectedHash(calculated, '').status, 'empty');
});
