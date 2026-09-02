import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
if (!match) throw new Error('JSON-LD block not found');
console.log(`sha256-${createHash('sha256').update(match[1]).digest('base64')}`);
