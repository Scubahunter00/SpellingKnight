// Generates the game's voice clips with Kokoro, a neural voice that runs locally.
//
//   cd tools/voice && npm install   (first time only)
//   npm run generate
//
// Run it again after changing words or sentences: new text gets a clip, clips no
// longer used are deleted, and existing ones are kept.
//
//   Redo one bad clip:   delete its .mp3 from audio/voice and run it again.
//   Fix a pronunciation: add it to RESPELL below, delete the clip, run it again.
//   Change the voice:    edit VOICE, then run with --force to redo every clip.
//   Try a few clips:     --limit 10
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { KokoroTTS } from 'kokoro-js';
import { Mp3Encoder } from '@breezystack/lamejs';

const VOICE = 'af_heart';
const SPEED = { word: 0.85, sentence: 0.9 };   // a little slower than normal, for young spellers
const KBPS = 48;

// Text the voice should read differently from how it's written, keyed by lowercase text.
// Kokoro also accepts explicit phonemes, e.g. 'bow': '[bow](/bˈO/)'.
const RESPELL = {};

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'audio', 'voice');
const MANIFEST = path.join(ROOT, 'voice-clips.js');

const args = process.argv.slice(2);
const force = args.includes('--force');
const limitAt = args.indexOf('--limit');
const limit = limitAt >= 0 ? Number(args[limitAt + 1]) : Infinity;

// Must match clipKey() in game.js.
const keyOf = text => text.trim().toLowerCase();

function loadClipList() {
  const window = {};
  const ctx = vm.createContext({ window });
  for (const f of ['words.js', 'words-grades.js', 'sentences.js']) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
  }
  const clips = new Map();
  for (const levels of Object.values(window.WORD_BANKS)) {
    for (const list of Object.values(levels)) {
      for (const [word, sentence] of list) {
        const w = keyOf(word);
        clips.set(w, { key: w, kind: 'word', file: `w-${w.replace(/[^a-z0-9]+/g, '_')}.mp3` });
        const s = keyOf(sentence);
        const hash = createHash('sha1').update(s).digest('hex').slice(0, 10);
        clips.set(s, { key: s, kind: 'sentence', text: sentence.trim(), file: `s-${hash}.mp3` });
      }
    }
  }
  return [...clips.values()];
}

// Cut the silence at both ends, keeping a little so playback doesn't clip the first sound,
// and bring every clip to the same peak so none is quieter than the others.
function tidy(samples, rate) {
  const floor = 0.008;
  let start = 0, end = samples.length;
  while (start < end && Math.abs(samples[start]) < floor) start++;
  while (end > start && Math.abs(samples[end - 1]) < floor) end--;
  const lead = Math.round(rate * 0.06), tail = Math.round(rate * 0.12);
  const body = samples.subarray(Math.max(0, start - lead), Math.min(samples.length, end + tail));
  const peak = body.reduce((m, x) => Math.max(m, Math.abs(x)), 0) || 1;
  const pcm = new Int16Array(body.length);
  for (let i = 0; i < body.length; i++) pcm[i] = Math.round((body[i] / peak) * 0.9 * 32767);
  return pcm;
}

function toMp3(pcm, rate) {
  const enc = new Mp3Encoder(1, rate, KBPS);
  const parts = [];
  for (let i = 0; i < pcm.length; i += 1152) {
    const out = enc.encodeBuffer(pcm.subarray(i, i + 1152));
    if (out.length) parts.push(Buffer.from(out));
  }
  const last = enc.flush();
  if (last.length) parts.push(Buffer.from(last));
  return Buffer.concat(parts);
}

const clips = loadClipList();
fs.mkdirSync(OUT, { recursive: true });

const todo = clips.filter(c => force || !fs.existsSync(path.join(OUT, c.file))).slice(0, limit);
console.log(`${clips.length} clips needed, ${todo.length} to generate`);

if (todo.length) {
  const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: 'fp32', device: 'cpu' });
  const began = Date.now();
  for (const [i, c] of todo.entries()) {
    // A full stop gives a single word the natural falling tone of a finished thought.
    const spoken = RESPELL[c.key] ?? (c.kind === 'word' ? `${c.key}.` : c.text);
    const audio = await tts.generate(spoken, { voice: VOICE, speed: SPEED[c.kind] });
    const mp3 = toMp3(tidy(audio.audio, audio.sampling_rate), audio.sampling_rate);
    fs.writeFileSync(path.join(OUT, c.file), mp3);
    if ((i + 1) % 25 === 0 || i + 1 === todo.length) {
      console.log(`${i + 1}/${todo.length}  ${Math.round((Date.now() - began) / 1000)}s`);
    }
  }
}

// Only list clips that exist, so anything missing falls back to the browser voice.
const ready = clips.filter(c => fs.existsSync(path.join(OUT, c.file)));
const wanted = new Set(clips.map(c => c.file));
let removed = 0;
for (const f of fs.readdirSync(OUT)) {
  if (limit === Infinity && !wanted.has(f)) { fs.rmSync(path.join(OUT, f)); removed++; }
}
const entries = ready
  .sort((a, b) => a.key.localeCompare(b.key))
  .map(c => `  ${JSON.stringify(c.key)}: ${JSON.stringify(c.file)}`);
fs.writeFileSync(MANIFEST,
  `// Generated by tools/voice/generate.mjs. Do not edit by hand.\n` +
  `// Spoken text (lowercase) -> clip in audio/voice.\n` +
  `window.VOICE_CLIPS = {\n${entries.join(',\n')}\n};\n`);
console.log(`Wrote voice-clips.js with ${ready.length} clips, removed ${removed} unused`);
