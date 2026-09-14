/** Run after rendering: node scripts/verify_studio_animation.cjs */
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
const { poseAt, overlay, frames, fps } = require('./render_studio_animation.cjs');
const { liveCode } = require('./studio-live-code.cjs');
const { lightSequence, lightState } = require('./studio-light-sequence.cjs');
const poseData = require('../assets/studio-poses/frames.json');
const root = path.resolve(__dirname, '..');

(async () => {
  assert.equal(frames / fps, 16);
  assert.equal(overlay(0), overlay(frames), 'Every layer must wrap on the same clock');
  assert.equal(liveCode(15.9), liveCode(0), 'Code returns to its initial state');
  assert.equal(lightSequence(16), lightSequence(0));
  for (let f = 34; f < 100; f++) assert.equal(liveCode(f / fps), liveCode(3.4), 'Typing pauses during the drink');
  assert.deepEqual([0, 3.8, 4.7, 5.5, 6.8, 8.2, 9, 11, 16].map(poseAt),
    ['type', 'look', 'grasp', 'lift', 'sip', 'lift', 'grasp', 'type', 'type']);
  assert(lightState(2.9).triangle < .1);
  assert(lightState(4.7).circle < .1 && lightState(4.7).square > .7);
  for (const pose of poseData.poses) {
    const metadata = await sharp(path.join(root, `assets/studio-poses/${pose}.png`)).metadata();
    assert.equal(metadata.width, poseData.patch.width);
    assert.equal(metadata.height, poseData.patch.height);
    assert(metadata.hasAlpha, `${pose}: preserve transparent registration mask`);
  }
  const gif = await sharp(path.join(root, 'assets/cloud-ps1-studio.gif'), { animated: true }).metadata();
  assert.equal(gif.width, 1672);
  assert.equal(gif.pageHeight, 941);
  assert.equal(gif.pages, frames);
  assert.equal(gif.loop, 0);
  assert.equal(gif.delay.reduce((a, b) => a + b, 0), 16000);
  const readme = await fs.readFile(path.join(root, 'README.md'), 'utf8');
  assert(readme.indexOf('cloud-ps1-studio.gif') > readme.indexOf('// verified.toolchain'));
  assert(readme.indexOf('cloud-ps1-studio.gif') < readme.indexOf('// engineering.depth'));
  assert(readme.includes('media="(prefers-reduced-motion: reduce)" srcset="./assets/cloud-ps1-studio.png"'));
  console.log('PASS: acting sequence, one shared 16s clock, paused typing, light order, registered sprites, GIF loop and reduced-motion fallback.');
})().catch(error => { console.error(error); process.exitCode = 1; });
