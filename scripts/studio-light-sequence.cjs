/**
 * Original-scene lighting overlays, in the 1672 × 941 illustration coordinates.
 * Returns SVG children (not an outer <svg>); render after the scene/pose layer.
 *
 * The triangle loses contact twice while Cloud is typing, which motivates his
 * glance. The loss travels left to right; the four tubes then restart in the
 * same order. No flash repeats faster than twice a second; the scene itself
 * never flashes. A slow 16-second eye pulse makes Aku Aku quietly watchful.
 */
'use strict';

const DURATION_SECONDS = 16;
const clamp = value => Math.max(0, Math.min(1, value));
const ease = value => { const x = clamp(value); return x * x * (3 - 2 * x); };
const number = value => value.toFixed(3);

function interpolate(time, points) {
  for (let index = 1; index < points.length; index++) {
    const [end, to] = points[index];
    if (time <= end) {
      const [start, from] = points[index - 1];
      return from + (to - from) * ease((time - start) / (end - start));
    }
  }
  return points[points.length - 1][1];
}

function lightState(seconds) {
  if (!Number.isFinite(seconds)) throw new TypeError('seconds must be finite');
  const t = ((seconds % DURATION_SECONDS) + DURATION_SECONDS) % DURATION_SECONDS;
  const baseline = 0.87 + 0.06 * Math.sin(t * Math.PI / 8);
  const tube = (offAt, onAt) => baseline * interpolate(t, [
    [0, 1], [offAt, 1], [offAt + 0.18, 0.035],
    [onAt, 0.035], [onAt + 0.24, 1], [16, 1],
  ]);
  const triangle = baseline * interpolate(t, [
    [0, 1], [2.65, 1], [2.84, 0.04], [3.02, 0.04],
    [3.16, 0.84], [3.34, 0.84], [3.53, 0.035],
    [3.70, 0.035], [3.89, 0.54], [4.05, 0.035],
    [5.08, 0.035], [5.36, 1], [16, 1],
  ]);
  return {
    time: t,
    triangle,
    circle: tube(4.06, 5.44),
    cross: tube(4.42, 5.80),
    square: tube(4.78, 6.16),
    eyes: 0.52 + 0.40 * (1 - Math.cos(t * Math.PI / 4)) / 2,
  };
}

// Filled silhouettes include their dark hollow centers via the even-odd rule.
// The source is a pixel illustration: these shapes retain square/mitered ends.
const BUTTONS = [
  {
    key: 'triangle', color: '#67ffe5',
    path: 'M112 70 H121 L157 137 V145 H75 V136 Z M115 90 91 133 H140 Z',
  },
  {
    key: 'circle', color: '#ff5588',
    path: 'M190 74 H218 L234 89 241 103 V125 L230 141 216 150 H189 L174 138 168 124 V100 L177 84 Z M192 86 181 97 V125 L193 137 H214 L229 124 V101 L215 86 Z',
  },
  {
    key: 'cross', color: '#559bff',
    path: 'M258 80 H264 L285 102 308 82 H316 V92 L296 113 318 138 V149 H309 L285 125 261 150 H254 V140 L276 114 254 89 V82 Z',
  },
  {
    key: 'square', color: '#d148ff',
    path: 'M337 85 H397 V153 H337 Z M349 97 V141 H385 V97 Z',
  },
];

function buttonLight(button, intensity) {
  const darkness = clamp(1 - intensity);
  const glow = clamp((intensity - 0.28) / 0.72);
  return `<g fill-rule="evenodd">
    <path d="${button.path}" fill="#030614" stroke="#030614" stroke-width="12"
      opacity="${number(darkness * 0.98)}" filter="url(#studio-light-darken)"/>
    <path d="${button.path}" fill="#071023" opacity="${number(darkness * 0.97)}"/>
    <path d="${button.path}" fill="${button.color}"
      opacity="${number(glow * 0.34)}" filter="url(#studio-light-glow)"/>
    <path d="${button.path}" fill="${button.color}" opacity="${number(glow * 0.12)}"/>
  </g>`;
}

function akuEyes(intensity) {
  // Exact eye apertures; neither eyebrows nor the wooden mask are repainted.
  const aperture = 'M427 248 H436 V256 H429 V259 H427 Z M443 248 H451 V257 H445 V259 H443 Z';
  return `<g>
    <path d="${aperture}" fill="#42ffd2" opacity="${number(intensity * 0.72)}"
      filter="url(#studio-eye-glow)"/>
    <path d="${aperture}" fill="#70ffe2" opacity="${number(intensity * 0.75)}"/>
    <path d="M430 251 H434 V255 H430 Z M446 251 H450 V255 H446 Z"
      fill="#ecfff2" opacity="${number(intensity * 0.87)}"/>
    <path d="M431 250 H433 V256 H431 Z M445 252 H451 V254 H445 Z"
      fill="#ffffff" opacity="${number(intensity * 0.24)}"/>
  </g>`;
}

function lightSequence(seconds) {
  const state = lightState(seconds);
  return `<defs>
    <filter id="studio-light-darken" x="-45%" y="-45%" width="190%" height="190%">
      <feGaussianBlur stdDeviation="4"/>
    </filter>
    <filter id="studio-light-glow" x="-45%" y="-45%" width="190%" height="190%">
      <feGaussianBlur stdDeviation="3.2"/>
    </filter>
    <filter id="studio-eye-glow" x="-120%" y="-120%" width="340%" height="340%">
      <feGaussianBlur stdDeviation="3"/>
    </filter>
  </defs>
  <g id="studio-light-sequence" shape-rendering="crispEdges">
    ${BUTTONS.map(button => buttonLight(button, state[button.key])).join('')}
    ${akuEyes(state.eyes)}
  </g>`;
}

module.exports = { lightSequence, lightState, DURATION_SECONDS };

if (require.main === module) {
  const assert = require('node:assert/strict');
  assert.equal(lightSequence(0), lightSequence(16), 'The loop must be seamless');
  assert.equal(lightSequence(-1), lightSequence(15), 'Negative time must wrap');
  for (let frame = 0; frame < 160; frame++) {
    const state = lightState(frame / 10);
    for (const key of ['triangle', 'circle', 'cross', 'square', 'eyes']) {
      assert.ok(state[key] >= 0 && state[key] <= 1, `${key} outside opacity range`);
    }
  }
  assert.ok(lightState(2.9).triangle < 0.1, 'Triangle first fault');
  assert.ok(lightState(3.6).triangle < 0.1, 'Triangle second fault');
  assert.ok(lightState(4.7).circle < 0.1 && lightState(4.7).square > 0.7, 'Fault travels left to right');
  assert.ok(lightState(5.4).triangle > 0.7 && lightState(5.4).circle < 0.1, 'Triangle restarts first');
  assert.ok(lightState(6.5).square > 0.7, 'All tubes return');
  console.log('Lighting sequence: 160 frames, bounds/timeline/seam checks passed.');
}
