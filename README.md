# APK SHA-256 Verifier

Calculate a file's SHA-256 checksum locally in a web browser. The interface reads files in 4 MB chunks, displays calculation progress, and sends no file data to a server.

## What the tool returns

- Input: one APK or any other local file
- Output: one 64-character lowercase SHA-256 digest
- Comparison: optional 64-character expected digest with match, difference, or invalid-format result
- Processing: incremental 4 MB browser reads
- Network behavior: the Content Security Policy blocks outbound connections
- Account requirement: none

## Run the calculator locally

The interface uses JavaScript modules, so serve the repository through a local HTTP server:

```bash
python -m http.server 8080
```

Open `http://localhost:8080/` in a current browser.

## Run the automated tests

Node.js 18 or newer can run the published SHA-256 vectors and chunk-boundary cases:

```bash
npm test
```

The test suite compares this implementation with Node.js `crypto` for empty input, standard published vectors, Unicode bytes, binary bytes, and inputs that cross the 64-byte SHA-256 block boundary.

## How the checksum is calculated

`assets/sha256.js` implements incremental SHA-256. `assets/app.js` reads the selected file through `File.slice()`, updates the digest after each 4 MB chunk, and renders the final value as hexadecimal. An optional comparison removes spaces and colon separators before checking a complete 64-character expected value. The file input is read-only and remains inside the browser tab.

## What a checksum establishes

A matching SHA-256 value establishes that two files contain the same byte sequence. SHA-256 does not inspect an APK manifest, identify permissions, confirm a signer, execute code, reproduce device behavior, or provide a safety conclusion.

An APK file checksum and a signer-certificate fingerprint are different values. The file checksum digests the complete APK byte sequence; the certificate fingerprint digests certificate data associated with the APK signature.

The [APK checksum and permission guide](https://subwaysurfersmodgame.com/subway-surfers-mod-apk-safety/?utm_source=github&utm_medium=referral&utm_campaign=apk_sha256_verifier&utm_content=readme) explains how a checksum fits beside package identity, signer details, permissions, archive integrity, external scanning, and runtime testing.

## Repository files

- `index.html` — accessible GitHub Pages interface and explanation
- `assets/app.js` — file selection, chunk reading, progress, cancellation, and clipboard behavior
- `assets/compare.js` — expected-value normalization and match-state logic
- `assets/sha256.js` — incremental SHA-256 implementation
- `assets/styles.css` — responsive interface styles
- `tests/sha256.test.mjs` — deterministic automated tests
- `PRIVACY.md` — browser and hosting privacy scope
- `SECURITY.md` — responsible vulnerability-reporting instructions
- `LICENSE` — MIT license for original repository code
- `fonts/OFL.txt` — SIL Open Font License for the bundled Poppins files

## Browser support

The interface requires JavaScript modules, the File API, typed arrays, `File.slice()`, and `requestAnimationFrame()`. Current Chrome, Edge, Firefox, and Safari releases provide these browser features.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before sending a pull request. Changes to the hash implementation must include a deterministic test that fails before the correction and passes afterward.

## License

Original code and documentation use the [MIT License](LICENSE). Bundled Poppins font files use the [SIL Open Font License 1.1](fonts/OFL.txt).
