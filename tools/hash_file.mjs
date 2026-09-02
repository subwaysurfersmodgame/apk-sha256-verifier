import { createReadStream } from 'node:fs';
import { Sha256 } from '../assets/sha256.js';

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node tools/hash_file.mjs <file>');
  process.exit(1);
}

const sha256 = new Sha256();
for await (const chunk of createReadStream(filePath, { highWaterMark: 4 * 1024 * 1024 })) {
  sha256.update(chunk);
}
console.log(sha256.digestHex());
