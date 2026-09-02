# Security Policy

## Report a vulnerability

Send vulnerability details to contact@subwaysurfersmodgame.com before opening a public issue when disclosure would expose visitors to harm.

Include:

- the affected file and function;
- the browser and operating system used;
- exact reproduction steps;
- the observed result;
- the expected result; and
- a minimal proof of concept that contains no private APK or personal data.

## Security boundaries

The calculator reads a local file and returns a SHA-256 digest. The calculator does not parse, install, execute, upload, or classify the selected file. A checksum match confirms byte equality against a reference checksum; it does not establish file safety.
