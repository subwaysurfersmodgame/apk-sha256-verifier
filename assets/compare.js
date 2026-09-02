export function normalizeExpectedHash(value) {
  return value.replace(/[\s:]/g, '').toLowerCase();
}

export function compareExpectedHash(calculated, input) {
  const expected = normalizeExpectedHash(input);
  if (!expected) return { status: 'empty', expected };
  if (!/^[a-f0-9]{64}$/.test(expected)) return { status: 'invalid', expected };
  return { status: calculated === expected ? 'match' : 'different', expected };
}
