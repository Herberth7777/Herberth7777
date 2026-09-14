/**
 * Registered pixel-art acting, live code and lighting on a locked studio plate.
 * Requirements: Node.js, sharp, ffmpeg on PATH.
 * Run from the repository root: node scripts/render_studio_animation.cjs
 * The original PNG is also the reduced-motion fallback; never overwrite it.
 */
const fs = require('node:fs/promises');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const sharp = require('sharp');
const { liveCode } = require('./studio-live-code.cjs');
const { lightSequence } = require('./studio-light-sequence.cjs');
const poseMetadata = require('../assets/studio-poses/frames.json');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist/studio-animation');
const source = path.join(root, 'assets/cloud-ps1-studio.png');
const destination = path.join(root, 'assets/cloud-ps1-studio.gif');
const width = 1672;
const height = 941;
const fps = 10;
const frames = 160;
const wave = (t, phase = 0, cycles = 1) => (1 + Math.sin(t * Math.PI * 2 * cycles + phase)) / 2;

function poseAt(seconds) {
  const t = ((seconds % 16) + 16) % 16;
  if (t < 3.4) return 'type';
  if (t < 4.2) return 'look';
  if (t < 4.4) return 'type';
  if (t < 5.2) return 'grasp';
  if (t < 5.8) return 'lift';
  if (t < 7.8) return 'sip';
  if (t < 8.6) return 'lift';
  if (t < 9.4) return 'grasp';
  return 'type';
}

function visibleScreen(pose, seconds) {
  // The drink and hand pass in front of the emulator. This per-pose mask keeps
  // animated UI behind them; it does not bake a fixed glove into every frame.
  const silhouette = pose === 'lift'
    ? 'M976 416H1010V449L1027 479 1000 511H953V469L963 446H973Z'
    : pose === 'sip'
      ? 'M986 359H1078V426L1027 454 1000 525H943V480L960 439 978 414V387Z'
      : '';
  return `<defs><mask id="studio-visible-screen" maskUnits="userSpaceOnUse" x="0" y="0" width="1672" height="941"><rect width="1672" height="941" fill="white"/><path d="${silhouette}" fill="black"/></mask></defs><g mask="url(#studio-visible-screen)">${liveCode(seconds)}</g>`;
}

function crtBoot(frame) {
  // One quiet startup in each 16-second acting loop; the CRT bezel stays fixed.
  frame /= 2;
  const fade = (start, enter, leave, end) => {
    const amount = Math.max(0, Math.min(1, (frame - start) / (enter - start), (end - frame) / (end - leave)));
    return (amount * amount * (3 - 2 * amount)).toFixed(3);
  };
  const sony = fade(3, 9, 19, 25);
  const playstation = fade(27, 35, 64, 74);
  const scan = 390 + Math.round((frame % 40) / 40 * 118);
  const scanOpacity = (0.035 * Math.max(Number(sony), Number(playstation))).toFixed(3);
  return `
    <defs>
      <clipPath id="crt-screen"><path d="M169 386 H317 L324 393 V503 L317 512 H170 L163 505 V393 Z"/></clipPath>
      <clipPath id="ps-left"><path d="M15.862 131.018C.243 126.619-2.357 117.454 4.763 112.174c6.58-4.875 17.769-8.545 17.769-8.545l46.241-16.442v18.745l-33.276 11.909c-5.878 2.109-6.782 5.095-2.006 6.66 4.781 1.565 13.434 1.12 19.321-.994l15.961-5.792v16.77c-1.012.18-2.141.36-3.184.536-15.966 2.608-32.97 1.52-49.727-4.003Z"/></clipPath>
    </defs>
    <g clip-path="url(#crt-screen)">
      <rect x="163" y="386" width="162" height="127" fill="#050913"/>
      <g opacity="${sony}">
        <!-- Amber folded-diamond homage to the first Sony boot screen. -->
        <g transform="translate(220 397)">
          <path d="M23 0 46 23 23 46 0 23Z" fill="#df861d"/>
          <path d="M23 0 46 23 23 19 8 26 0 23Z" fill="#ffc351"/>
          <path d="M8 26 23 19 46 23 23 27 10 34Z" fill="#050913"/>
          <path d="M10 34 23 27 39 30 23 46Z" fill="#ed9c28"/>
          <path d="M23 27 39 30 23 34 10 34Z" fill="#ffce63"/>
        </g>
        <g fill="#dedbe5" text-anchor="middle" font-family="monospace">
          <text x="243" y="460" font-size="10" letter-spacing="2">SONY</text>
          <text x="243" y="472" font-size="5.5" letter-spacing="1">COMPUTER</text>
          <text x="243" y="481" font-size="5.5" letter-spacing="1">ENTERTAINMENT</text>
        </g>
      </g>
      <g opacity="${playstation}">
        <!-- P/S silhouette adapted from the public PlayStation vector mark:
             https://commons.wikimedia.org/wiki/File:PlayStation_logo.svg -->
        <g transform="translate(213 402) scale(.30)">
          <path d="M197.239 117.962c-3.868 4.88-13.344 8.36-13.344 8.36l-70.491 25.32V132.97l51.877-18.484c5.887-2.109 6.791-5.091 2.006-6.656-4.776-1.57-13.425-1.12-19.316.998l-34.567 12.175v-19.379l1.993-.675s9.988-3.535 24.033-5.091c14.046-1.547 31.243.212 44.744 5.33 15.215 4.807 16.928 11.895 13.065 16.774Z" fill="#168dbe"/>
          <g clip-path="url(#ps-left)">
            <rect x="0" y="85" width="72" height="55" fill="#edc642"/>
            <path d="M0 120 72 125V142H0Z" fill="#28ad81"/>
          </g>
          <path d="M120.115 86.166V38.413c0-5.608-1.035-10.771-6.296-12.233-4.03-1.291-6.531 2.451-6.531 8.055v119.584l-32.25-10.236V1c13.712 2.545 33.689 8.563 44.429 12.183 27.312 9.377 36.572 21.048 36.572 47.344 0 25.63-15.821 35.344-35.924 25.639Z" fill="#eb4856"/>
        </g>
        <text x="243" y="469" fill="#ebe9ec" text-anchor="middle" font-family="sans-serif" font-size="13">PlayStation</text>
      </g>
      <rect x="163" y="${scan}" width="162" height="2" fill="#8fe2ff" opacity="${scanOpacity}"/>
    </g>`;
}

function overlay(frame, pose = poseAt(frame / fps)) {
  const t = frame / frames;
  const parts = [];
  const rect = (x, y, w, h, color, opacity = 1) => parts.push(
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}" opacity="${opacity.toFixed(3)}"/>`
  );
  parts.push(visibleScreen(pose, frame / fps));

  // Classic startup homage stays entirely inside the PlayStation CRT glass.
  parts.push(crtBoot(frame));

  parts.push(lightSequence(frame / fps));

  // Pixel highlights on the PC light strip and the rotating fan rim.
  rect(636, 680, 3, 133, '#72e7ff', 0.10 + wave(t, 1, 2) * 0.40);
  const fanPixels = [[598,735],[611,738],[621,746],[625,759],[621,773],[611,784],[596,785],[584,778],[577,765],[581,750]];
  fanPixels.forEach(([x,y], index) => rect(x, y, 3, 4, '#55baff', 0.10 + wave(t, -index * Math.PI / 5, 4) * 0.42));

  // Activity lights: short, repeatable bursts; no distracting strobe.
  rect(684, 724, 5, 2, '#81ddff', frame % 20 < 6 ? 0.75 : 0.05);
  rect(566, 799, 3, 3, '#6affba', frame % 40 < 8 ? 0.68 : 0.10);

  // Quiet city-window activity, confined to the far-right background.
  [[1571,369],[1598,426],[1650,414],[1555,258]].forEach(([x,y], i) => {
    rect(x, y, 3, 4, i % 2 ? '#dbabff' : '#ffd695', wave(t, i * 1.7) * 0.30);
  });

  // A few rising embers from the existing Red XIII tail flame.
  for (let i = 0; i < 3; i++) {
    const age = ((frame + i * 13) % 40) / 40;
    const x = 382 + Math.round(Math.sin(age * 4 + i) * 7);
    const y = 881 - Math.round(age * 43);
    rect(x, y, 3, 3, '#ffc675', Math.sin(age * Math.PI) * 0.68);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges">${parts.join('')}</svg>`;
}

async function main() {
  await fs.mkdir(output, { recursive: true });
  const metadata = await sharp(source).metadata();
  if (metadata.width !== width || metadata.height !== height) throw new Error('Unexpected source dimensions; recalibrate the light coordinates.');
  const poses = Object.fromEntries(await Promise.all(poseMetadata.poses.map(async name => [name,
    await fs.readFile(path.join(root, `assets/studio-poses/${name}.png`)),
  ])));
  const { left, top } = poseMetadata.patch;
  for (let frame = 0; frame < frames; frame++) {
    const pose = poseAt(frame / fps);
    const typing = frame < 33 || (frame >= 100 && frame < 145);
    const sprite = pose === 'type' && typing && [1, 2].includes(frame % 6) ? 'type-press' : pose;
    await sharp(source)
      .composite([
        { input: poses[sprite], left, top },
        { input: Buffer.from(overlay(frame, pose)) },
      ])
      .png()
      .toFile(path.join(output, `frame-${String(frame).padStart(3, '0')}.png`));
  }
  // One stable global palette avoids frame-to-frame color shimmer. Differential
  // GIF encoding keeps most of the still illustration out of subsequent frames.
  const result = spawnSync('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-framerate', String(fps), '-i', path.join(output, 'frame-%03d.png'),
    '-filter_complex', '[0:v]split[a][b];[a]palettegen=max_colors=256:stats_mode=full[p];[b][p]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle',
    '-loop', '0', '-gifflags', '+transdiff', destination,
  ], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || 'ffmpeg did not complete');
  const stats = await fs.stat(destination);
  console.log(JSON.stringify({ destination, width, height, frames, fps, seconds: frames / fps, bytes: stats.size }, null, 2));
}
module.exports = { poseAt, overlay, frames, fps };
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
