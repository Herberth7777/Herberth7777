/**
 * Code-native monitor animation for the 1672 × 941 studio illustration.
 * Return an SVG fragment, then composite the character above this fragment.
 * The 16-second clock is shared with Cloud's typing / drink / typing sequence.
 */
const LOOP_SECONDS = 16;
const PYTHON = "def build():\n    return 'ready'";
const DART = "Widget build(context) {\n  return Card(\n    child: Text('Ready'),\n  );\n}";
const clamp = value => Math.max(0, Math.min(1, value));
const ease = value => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};
const xml = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
}[character]));

function highlighted(line) {
  // This also handles an unfinished quoted string while it is being typed.
  return (line.match(/'[^']*'?|\b(?:def|return|Widget|Card|Text|build|context)\b|[^'\w]+|\w+/g) || [])
    .map(token => {
      let color = '#d6e7f6';
      if (token.startsWith("'")) color = '#62efb4';
      else if (/^(def|Widget)$/.test(token)) color = '#4fc6ff';
      else if (token === 'return') color = '#df96ed';
      else if (/^(build|Card|Text)$/.test(token)) color = '#f0d474';
      else if (token === 'context') color = '#a3cdf5';
      return `<tspan fill="${color}">${xml(token)}</tspan>`;
    }).join('');
}

function typedLength(t, language) {
  if (language === 'python') {
    // A small pause after the function signature reads as intentional typing.
    if (t < 1.15) return Math.floor(PYTHON.indexOf('\n') * clamp(t / 1.15));
    if (t < 1.45) return PYTHON.indexOf('\n');
    return Math.floor(PYTHON.indexOf('\n') + (PYTHON.length - PYTHON.indexOf('\n')) * clamp((t - 1.45) / 1.8));
  }
  return Math.floor(DART.length * clamp((t - 10) / 4.5));
}

/**
 * @param {number} seconds Position in seconds; any finite value wraps at 16 s.
 * @returns {string} SVG markup without an outer <svg> element.
 */
function liveCode(seconds) {
  if (!Number.isFinite(seconds)) throw new TypeError('liveCode(seconds) requires a finite number.');
  const t = ((seconds % LOOP_SECONDS) + LOOP_SECONDS) % LOOP_SECONDS;
  const reset = t >= 15.7;
  const language = t < 10 || reset ? 'python' : 'dart';
  const source = language === 'python' ? PYTHON : DART;
  const amount = reset ? 0 : typedLength(t, language);
  const visible = source.slice(0, amount);
  const lines = visible.split('\n');
  const typing = reset || t < 3.25 || (t >= 10 && t < 14.5);
  // A quiet text dissolve clears the file for the next lap, not a screen flash.
  const opacity = language === 'dart' && t >= 15.15 ? 1 - ease((t - 15.15) / .55) : 1;
  const fontSize = language === 'python' ? 13.2 : 10.9;
  const characterWidth = fontSize * .602;
  const lineHeight = 15;
  const lineX = 727;
  const lineY = 367;
  const caretLine = lines.length - 1;
  const caretX = lineX + lines[caretLine].length * characterWidth;
  const caretY = lineY + caretLine * lineHeight - fontSize + 1;
  const code = lines.map((line, index) => `<text x="${lineX}" y="${lineY + index * lineHeight}" font-size="${fontSize}" xml:space="preserve">${highlighted(line)}</text>`).join('');
  const numbers = Array.from({ length: language === 'python' ? 3 : 5 }, (_, index) => `<text x="701" y="${lineY + index * lineHeight}" font-size="10" text-anchor="middle" fill="#638096">${index + 1}</text>`).join('');
  const terminal = language === 'python'
    ? (amount < PYTHON.length ? '> python main.py' : ">>> build()  'ready'")
    : (amount < DART.length ? '> flutter run' : '> hot reload  1 widget');

  // Emulator updates correspond to complete Dart expressions, then settle.
  const dartProgress = language === 'dart' ? amount / DART.length : 0;
  const appReady = dartProgress >= .82;
  const dartActive = language === 'dart' && t < 15.15;
  const phoneOpacity = reset ? 1 : opacity;
  const phoneLabel = dartActive ? (appReady ? 'Ready' : 'Building') : 'Flutter';
  const progressWidth = dartActive ? Math.round(37 * dartProgress) : 0;
  const headerY = 372;
  const appCards = dartProgress >= .45
    ? `<rect x="932" y="414" width="47" height="16" rx="3" fill="#f0f8ff"/>
       <rect x="936" y="418" width="8" height="8" rx="2" fill="#48b8f7"/>
       <rect x="948" y="419" width="24" height="2" fill="#7bafcf"/>
       <rect x="948" y="423" width="18" height="2" fill="#a6c7dd"/>`
    : '';
  const readyCard = appReady
    ? `<rect x="932" y="434" width="47" height="16" rx="3" fill="#d9f7ec"/>
       <path d="m936 442 3 3 5-7" fill="none" stroke="#17936e" stroke-width="1.7"/>
       <text x="948" y="444" font-size="6.4" fill="#1d6b5c">Ready</text>`
    : '';

  return `
    <defs>
      <clipPath id="studio-code-editor"><rect x="690" y="350" width="211" height="88"/></clipPath>
      <clipPath id="studio-code-terminal"><rect x="692" y="440" width="208" height="26"/></clipPath>
      <!-- Full glass, excluding the notch and frame. Character occlusion is per-pose. -->
      <clipPath id="studio-code-phone"><path d="M931 361H941L944 366H968L972 361H983Q990 361 990 368V455Q990 461 984 461H931Q926 461 926 455V367Q926 361 931 361Z"/></clipPath>
    </defs>
    <g font-family="DejaVu Sans Mono, Menlo, monospace" text-rendering="geometricPrecision">
      <!-- Only replace the active document tab; retain the macOS traffic lights. -->
      <path d="M723 350V335Q723 331 728 331H791Q796 331 796 335V350Z" fill="#1b344f"/>
      <text x="733" y="344" font-size="10.8" fill="#dcecff">${language === 'python' ? 'main.py' : 'main.dart'}</text>
      <g clip-path="url(#studio-code-editor)">
        <rect x="690" y="350" width="211" height="88" fill="#081222"/>
        <rect x="690" y="350" width="25" height="88" fill="#0a1728"/>
        <path d="M715 350V438" fill="none" stroke="#203850" stroke-width="1"/>
        <g opacity="${opacity.toFixed(3)}">${numbers}${code}</g>
        ${typing ? `<rect x="${caretX.toFixed(1)}" y="${caretY.toFixed(1)}" width="1.6" height="${fontSize + 2}" fill="#8de7ff"/>` : ''}
      </g>
      <g clip-path="url(#studio-code-terminal)">
        <rect x="692" y="440" width="208" height="26" fill="#091526"/>
        <text x="698" y="456" font-size="9.1" fill="${language === 'dart' && amount === DART.length ? '#6de3b9' : '#c9ddeb'}" opacity="${opacity.toFixed(3)}">${reset ? '&gt; python main.py' : xml(terminal)}</text>
      </g>
      <g clip-path="url(#studio-code-phone)">
        <rect x="926" y="361" width="64" height="102" fill="#c2ecff"/>
        <rect x="926" y="${headerY}" width="64" height="31" fill="#d9f4ff"/>
        <!-- Compact Flutter chevrons remain identifiable at profile width. -->
        <path d="m958 375-13 13 4 4 17-17Z" fill="#3bcaff"/>
        <path d="m958 388-9 9 4 4 9-9Z" fill="#32b9ee"/>
        <path d="m953 393 9 9h-8l-5-5Z" fill="#176db4"/>
        <g opacity="${phoneOpacity.toFixed(3)}">
          <text x="955" y="410" font-size="6.2" text-anchor="middle" fill="#155b85">${phoneLabel}</text>
          ${appCards}${readyCard}
          ${dartActive && !appReady ? `<rect x="936" y="439" width="37" height="3" rx="1" fill="#8fd3ed"/><rect x="936" y="439" width="${progressWidth}" height="3" rx="1" fill="#268dcc"/>` : ''}
          ${!dartActive ? '<rect x="936" y="420" width="37" height="2" fill="#99cee4"/><rect x="941" y="426" width="27" height="2" fill="#abd9eb"/>' : ''}
        </g>
        <rect x="945" y="456" width="21" height="2" rx="1" fill="#517f99"/>
      </g>
    </g>`;
}

module.exports = { liveCode, LOOP_SECONDS };

if (require.main === module) {
  const assert = require('node:assert/strict');
  assert.equal(liveCode(0), liveCode(16), 'The 16-second clock must wrap exactly.');
  assert.equal(liveCode(15.9), liveCode(0), 'The final hold must match the first frame, including its caret.');
  for (let frame = 34; frame <= 99; frame++) {
    assert.equal(liveCode(frame / 10), liveCode(3.4), `The monitor must pause while Cloud drinks (frame ${frame}).`);
  }
  console.log('liveCode: loop seam and all 66 paused frames verified.');
}
