import { Sha256 } from './sha256.js';
import { compareExpectedHash } from './compare.js';

const CHUNK_SIZE = 4 * 1024 * 1024;
const dropZone = document.querySelector('#drop-zone');
const fileInput = document.querySelector('#apk-file');
const chooseButton = document.querySelector('#choose-file');
const calculateButton = document.querySelector('#calculate');
const cancelButton = document.querySelector('#cancel');
const fileSummary = document.querySelector('#file-summary');
const progressWrap = document.querySelector('#progress-wrap');
const progressBar = document.querySelector('#progress-bar');
const progressText = document.querySelector('#progress-text');
const result = document.querySelector('#result');
const hashOutput = document.querySelector('#hash-output');
const expectedHash = document.querySelector('#expected-hash');
const comparison = document.querySelector('#comparison');
const copyButton = document.querySelector('#copy-hash');
const status = document.querySelector('#status');

let selectedFile = null;
let cancelled = false;

const formatBytes = bytes => {
  if (bytes === 0) return '0 bytes';
  const units = ['bytes', 'KB', 'MB', 'GB', 'TB'];
  const unit = Math.min(Math.floor(Math.log(bytes) / Math.log(1000)), units.length - 1);
  const value = unit === 0 ? bytes : bytes / (1000 ** unit);
  return `${unit === 0 ? value : value.toFixed(2)} ${units[unit]}`;
};

function setFile(file) {
  selectedFile = file || null;
  result.hidden = true;
  status.textContent = '';
  progressWrap.hidden = true;
  if (!selectedFile) {
    fileSummary.textContent = 'No file selected';
    calculateButton.disabled = true;
    return;
  }
  fileSummary.textContent = `${selectedFile.name} · ${formatBytes(selectedFile.size)}`;
  calculateButton.disabled = false;
}

function compareHash(calculated) {
  const check = compareExpectedHash(calculated, expectedHash.value);
  comparison.hidden = true;
  comparison.className = 'comparison';
  if (check.status === 'empty') return;
  if (check.status === 'invalid') {
    comparison.textContent = 'Expected value invalid: enter 64 hexadecimal characters.';
    comparison.classList.add('is-invalid');
    comparison.hidden = false;
    return;
  }
  const matches = check.status === 'match';
  comparison.textContent = matches
    ? 'Match: the calculated SHA-256 equals the expected value.'
    : 'Different: the calculated SHA-256 does not equal the expected value.';
  comparison.classList.add(matches ? 'is-match' : 'is-different');
  comparison.hidden = false;
}

async function calculateHash() {
  if (!selectedFile) return;
  cancelled = false;
  calculateButton.disabled = true;
  cancelButton.hidden = false;
  progressWrap.hidden = false;
  result.hidden = true;
  status.textContent = 'Reading the file in 4 MB chunks…';
  const sha256 = new Sha256();
  let offset = 0;

  try {
    while (offset < selectedFile.size) {
      if (cancelled) throw new DOMException('Calculation cancelled', 'AbortError');
      const slice = selectedFile.slice(offset, Math.min(offset + CHUNK_SIZE, selectedFile.size));
      sha256.update(new Uint8Array(await slice.arrayBuffer()));
      offset += slice.size;
      const percent = selectedFile.size === 0 ? 100 : Math.round((offset / selectedFile.size) * 100);
      progressBar.value = percent;
      progressText.textContent = `${percent}%`;
      await new Promise(resolve => window.requestAnimationFrame(resolve));
    }

    progressBar.value = 100;
    progressText.textContent = '100%';
    hashOutput.textContent = sha256.digestHex();
    compareHash(hashOutput.textContent);
    result.hidden = false;
    status.textContent = 'SHA-256 calculation complete.';
  } catch (error) {
    status.textContent = error.name === 'AbortError'
      ? 'Calculation cancelled. The selected file was not changed.'
      : 'The browser could not finish reading this file.';
  } finally {
    calculateButton.disabled = false;
    cancelButton.hidden = true;
  }
}

chooseButton.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', event => setFile(event.target.files[0]));
calculateButton.addEventListener('click', calculateHash);
cancelButton.addEventListener('click', () => { cancelled = true; });

copyButton.addEventListener('click', async () => {
  await navigator.clipboard.writeText(hashOutput.textContent);
  copyButton.textContent = 'Copied';
  window.setTimeout(() => { copyButton.textContent = 'Copy hash'; }, 1600);
});

expectedHash.addEventListener('input', () => {
  if (!result.hidden) compareHash(hashOutput.textContent);
});

['dragenter', 'dragover'].forEach(type => {
  dropZone.addEventListener(type, event => {
    event.preventDefault();
    dropZone.classList.add('is-dragging');
  });
});

['dragleave', 'drop'].forEach(type => {
  dropZone.addEventListener(type, event => {
    event.preventDefault();
    dropZone.classList.remove('is-dragging');
  });
});

dropZone.addEventListener('drop', event => setFile(event.dataTransfer.files[0]));
setFile(null);
