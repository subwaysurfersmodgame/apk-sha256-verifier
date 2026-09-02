# Contributing

## Before opening a change

1. Open an issue that states the reproducible problem or accessibility improvement.
2. Keep the change limited to one purpose.
3. Add or update deterministic tests for changes to `assets/sha256.js`.
4. Run `npm test`.
5. Test the interface at 360 px and 1440 px viewport widths.

## Pull-request requirements

- Preserve local file processing and `connect-src 'none'`.
- Do not add analytics, advertising, upload endpoints, trackers, APK files, or externally hosted scripts.
- Do not add safety verdicts, scan results, performance statistics, or browser-support claims without reproducible evidence.
- Keep all controls keyboard accessible and retain visible focus styles.
- Explain technical terms at first use.

## Commit messages

Use a short action statement, such as `Fix hash padding at 64-byte boundary` or `Improve keyboard focus on file picker`.
