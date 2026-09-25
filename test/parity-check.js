#!/usr/bin/env node
/**
 * Libertad Extension - Automated Pre-Flight Parity Audit
 * Validates 100% key parity across Constants, Popup HTML, Popup JS, Styles Engine, and i18n Dictionaries.
 */

const fs = require('fs');
const path = require('path');
const { ALL_TOGGLE_KEYS, TOGGLE_KEYS, POWER_MODULE_KEYS, DEFAULT_SETTINGS } = require('../constants.js');
const { LIBERTAD_I18N } = require('../i18n.js');

let failures = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`[FAIL] ${message}`);
    failures++;
  } else {
    console.log(`[PASS] ${message}`);
  }
}

console.log('=== RUNNING LIBERTAD PRE-FLIGHT PARITY CHECK ===\n');

// 1. Check Toggle Keys definitions
assert(Array.isArray(ALL_TOGGLE_KEYS) && ALL_TOGGLE_KEYS.length === 48,
  `ALL_TOGGLE_KEYS count is 48 (got ${ALL_TOGGLE_KEYS.length})`);

// 2. Read Popup HTML and JS
const popupHtml = fs.readFileSync(path.join(__dirname, '../popup.html'), 'utf8');
const popupJs = fs.readFileSync(path.join(__dirname, '../popup.js'), 'utf8');
const stylesJs = fs.readFileSync(path.join(__dirname, '../src/modules/styles.js'), 'utf8');

// 3. Verify every toggle key is mapped in popup.js toggles object
for (const key of ALL_TOGGLE_KEYS) {
  assert(popupJs.includes(`${key}: document.getElementById`),
    `Key '${key}' is mapped in popup.js toggles`);
}

// 4. Verify all toggle HTML IDs exist in popup.html
const toggleRegex = /(\w+):\s*document\.getElementById\(['"]([^'"]+)['"]\)/g;
let match;
while ((match = toggleRegex.exec(popupJs)) !== null) {
  const [, key, id] = match;
  assert(popupHtml.includes(`id="${id}"`),
    `DOM ID '${id}' for key '${key}' exists in popup.html`);
}

// 5. Verify every UI cleaner toggle is handled in styles.js
for (const key of TOGGLE_KEYS) {
  if (key === 'redirectHomeToSubscriptions') continue; // Handled in subscriptions.js
  assert(stylesJs.includes(`settings.${key}`),
    `Focus toggle '${key}' is implemented in styles.js`);
}

// 6. Verify i18n parity across all supported locales (EN, ES, PT)
const enKeys = Object.keys(LIBERTAD_I18N.en || {});
const esKeys = Object.keys(LIBERTAD_I18N.es || {});
const ptKeys = Object.keys(LIBERTAD_I18N.pt || {});

assert(enKeys.length > 0, `English locale loaded with ${enKeys.length} keys`);
assert(esKeys.length === enKeys.length, `Spanish locale parity: ${esKeys.length}/${enKeys.length}`);
assert(ptKeys.length === enKeys.length, `Portuguese locale parity: ${ptKeys.length}/${enKeys.length}`);

const missingEs = enKeys.filter(k => !esKeys.includes(k));
assert(missingEs.length === 0, `Missing keys in Spanish: ${missingEs.join(', ') || 'None'}`);

const missingPt = enKeys.filter(k => !ptKeys.includes(k));
assert(missingPt.length === 0, `Missing keys in Portuguese: ${missingPt.join(', ') || 'None'}`);

// 7. Verify all data-i18n keys in popup.html exist in dictionary
const htmlI18nRegex = /data-i18n=["']([^"']+)["']/g;
let m;
const htmlKeys = new Set();
while ((m = htmlI18nRegex.exec(popupHtml)) !== null) {
  htmlKeys.add(m[1]);
}
for (const k of htmlKeys) {
  assert(Boolean(LIBERTAD_I18N.en[k]), `popup.html data-i18n key '${k}' exists in dictionary`);
}

// 8. Verify no debug console.log statements exist in production modules
const agentJs = fs.readFileSync(path.join(__dirname, '../src/injected/agent.js'), 'utf8');
const sponsorsJs = fs.readFileSync(path.join(__dirname, '../src/modules/sponsors.js'), 'utf8');

assert(!agentJs.includes('console.log('), 'agent.js has zero debug console.log statements');
assert(!sponsorsJs.includes('console.log('), 'sponsors.js has zero debug console.log statements');

// 9. Verify preset default is balanced and no legacy basic fallbacks exist
assert(DEFAULT_SETTINGS.preset === 'balanced', 'DEFAULT_SETTINGS.preset is canonically balanced');
const backgroundJs = fs.readFileSync(path.join(__dirname, '../background.js'), 'utf8');
const contentJs = fs.readFileSync(path.join(__dirname, '../content.js'), 'utf8');
assert(!popupJs.includes("|| 'basic'"), 'popup.js has zero legacy basic fallbacks');
assert(!backgroundJs.includes("|| 'basic'"), 'background.js has zero legacy basic fallbacks');
assert(!contentJs.includes("preset: 'basic'"), 'content.js has zero legacy basic fallbacks');

// 10. Verify CHANGELOG has no broken redirectHomeSubscriptions key
const changelogMd = fs.readFileSync(path.join(__dirname, '../CHANGELOG.md'), 'utf8');
assert(!changelogMd.includes('`redirectHomeSubscriptions`'), 'CHANGELOG.md uses canonical redirectHomeToSubscriptions key');

// 11. Verify 100% parity between manifest.json content scripts and background.js dynamic injection
const manifestJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../manifest.json'), 'utf8'));
const manifestContentScripts = manifestJson.content_scripts?.find((cs) =>
  cs.matches?.some((m) => m.includes('youtube.com')) && cs.world !== 'MAIN'
)?.js || [];

const bgMatch = backgroundJs.match(/const contentScriptFiles = \[\s*([\s\S]*?)\s*\];/);
const bgScripts = bgMatch
  ? bgMatch[1]
      .split('\n')
      .map((s) => s.replace(/['",]/g, '').trim())
      .filter(Boolean)
  : [];

assert(
  manifestContentScripts.length > 0 &&
  manifestContentScripts.length === bgScripts.length &&
  manifestContentScripts.every((script, idx) => script === bgScripts[idx]),
  `manifest.json content_scripts and background.js contentScriptFiles match 1:1 (${manifestContentScripts.length} scripts)`
);

console.log(`\n=== PARITY AUDIT COMPLETE: ${failures} FAILURES ===`);
if (failures > 0) {
  process.exit(1);
} else {
  console.log('[ALL PRE-FLIGHT PARITY CHECKS PASSED: 100% OPERATIONAL]\n');
}

