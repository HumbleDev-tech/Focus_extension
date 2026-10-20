#!/usr/bin/env node
/**
 * Libertad Extension - Automated Pre-Flight Parity Audit
 * Validates 100% key parity across Constants, Popup HTML, Popup JS, Styles Engine, and i18n Dictionaries.
 */

const fs = require('fs');
const path = require('path');
const {
  ALL_TOGGLE_KEYS,
  TOGGLE_KEYS,
  POWER_MODULE_KEYS,
  DEFAULT_SETTINGS,
  INTERNAL_STORAGE_KEYS,
  stripInternalKeys,
} = require('../constants.js');
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
assert(Array.isArray(ALL_TOGGLE_KEYS) && ALL_TOGGLE_KEYS.length === 50,
  `ALL_TOGGLE_KEYS count is 50 (got ${ALL_TOGGLE_KEYS.length})`);

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

// 12. Verify main world agent script parity
const manifestMainScript = manifestJson.content_scripts?.find((cs) =>
  cs.matches?.some((m) => m.includes('youtube.com')) && cs.world === 'MAIN'
)?.js?.[0];
assert(
  manifestMainScript === 'src/injected/agent.js' &&
  backgroundJs.includes("files: ['src/injected/agent.js']") &&
  backgroundJs.includes("world: 'MAIN'"),
  'agent.js main-world parity verified between manifest.json and background.js'
);

// 13. Verify bootstrap hydration guards (no irreversible actions with default settings)
const utilsJs = fs.readFileSync(path.join(__dirname, '../src/core/utils.js'), 'utf8');
const shortsJs = fs.readFileSync(path.join(__dirname, '../src/modules/shorts.js'), 'utf8');
const subscriptionsJs = fs.readFileSync(path.join(__dirname, '../src/modules/subscriptions.js'), 'utf8');
const dislikesJs = fs.readFileSync(path.join(__dirname, '../src/modules/dislikes.js'), 'utf8');
const untranslateJs = fs.readFileSync(path.join(__dirname, '../src/modules/untranslate.js'), 'utf8');

assert(
  utilsJs.includes('function broadcastInit(settings, ctx)') &&
    utilsJs.includes('settings, ctx'),
  'utils.js broadcastInit forwards the hydration context to modules'
);
assert(
  contentJs.includes('hydrated: false') &&
    contentJs.includes('hydrated: true') &&
    contentJs.includes('settingsHydrated'),
  'content.js marks bootstrap init as pre-hydration and re-inits as hydrated'
);
for (const [label, source] of [
  ['shorts.js', shortsJs],
  ['subscriptions.js', subscriptionsJs],
  ['sponsors.js', sponsorsJs],
  ['dislikes.js', dislikesJs],
  ['untranslate.js', untranslateJs],
]) {
  assert(
    source.includes('init(settings, ctx)') && source.includes('moduleHydrated'),
    `${label} consumes the hydration context before acting`
  );
}

// 13b. Verify the untranslate hydration guard actually lives inside init() and
// covers the network-backed title lookup, not just a stray file-wide mention.
const untranslateInitStart = untranslateJs.indexOf('init(settings, ctx)');
const untranslateInitEnd = untranslateJs.indexOf(
  'onNavigate',
  untranslateInitStart,
);
const untranslateInitBlock = untranslateJs.slice(
  untranslateInitStart,
  untranslateInitEnd === -1 ? undefined : untranslateInitEnd,
);
assert(
  untranslateInitStart !== -1 &&
    untranslateInitBlock.includes('moduleHydrated') &&
    untranslateInitBlock.includes('if (!moduleHydrated)'),
  'untranslate.js gates its pre-hydration init() body with an early return'
);
assert(
  untranslateJs.includes('moduleHydrated &&'),
  'untranslate.js gates agent metadata application behind the hydration flag'
);

// 14. Verify untranslate writes text in place instead of wiping live nodes
const textWipeTargets = [
  'node.textContent = clean',
  'expandedSpan.textContent =',
  'snippetSpan.textContent =',
  'titleEl.textContent =',
];
assert(
  textWipeTargets.every((needle) => !untranslateJs.includes(needle)),
  'untranslate.js never wipes live YouTube nodes via textContent assignments'
);
assert(
  (untranslateJs.match(/setTitleText\(/g) || []).length >= 7,
  'untranslate.js routes title, description, and chapter writes through setTitleText'
);

// 15. Verify autoplay suppression is reversible and ownership-tracked
assert(
  agentJs.includes('hydrated: false') &&
    agentJs.includes('restoreAutonavIfOurs') &&
    agentJs.includes('setAutonav(true)'),
  'agent.js gates enforcement on hydration and restores autoplay it suppressed'
);
assert(
  stylesJs.includes('libertadAutonavOurs'),
  'styles.js records autoplay suppression ownership'
);

// 16. Verify welcome preset application never persists internal UI keys
const welcomeJs = fs.readFileSync(path.join(__dirname, '../welcome.js'), 'utf8');
assert(
  welcomeJs.includes('extractToggles(PRESET_MAP[presetName])') &&
    !welcomeJs.includes('...PRESET_MAP[presetName]'),
  'welcome.js applies presets through extractToggles (no descKey leak)'
);
assert(
  backgroundJs.includes("remove(['descKey'])"),
  'background.js purges legacy descKey keys from storage'
);

// 17. Verify over-cap profiles are archived instead of silently destroyed
assert(
  popupJs.includes('profiles_orphaned'),
  'popup.js archives over-cap profiles instead of deleting them'
);

// 18. Verify the destroy() contract: every module releases what it created and
// the orchestrator actually triggers the teardown.
const zenJs = fs.readFileSync(
  path.join(__dirname, '../src/modules/zen.js'),
  'utf8',
);

assert(
  utilsJs.includes('installTeardownHook') &&
    utilsJs.includes("addEventListener('pagehide'") &&
    utilsJs.includes('broadcastDestroy()'),
  'utils.js installs a page teardown hook that triggers broadcastDestroy()'
);
assert(
  utilsJs.includes('event?.persisted'),
  'utils.js teardown hook skips bfcache snapshots so restored pages stay functional'
);

for (const [label, source, markers] of [
  [
    'shorts.js',
    shortsJs,
    [
      "removeEventListener('click', interceptHandler",
      "removeEventListener('auxclick', interceptHandler",
      'isInterceptorBound = false',
    ],
  ],
  [
    'subscriptions.js',
    subscriptionsJs,
    [
      "removeEventListener('click', interceptHandler",
      "removeEventListener('auxclick', interceptHandler",
      'isInterceptorBound = false',
    ],
  ],
  [
    'sponsors.js',
    sponsorsJs,
    [
      'unbindVideoSponsorListener()',
      "removeEventListener('timeupdate'",
      'delete element.dataset.libertadSponsorBound',
    ],
  ],
  [
    'styles.js',
    stylesJs,
    [
      'styleEl.remove()',
      'clearTimeout(chatResizeTimer)',
      'clearTimeout(playerResizeTimer)',
      'restoreAutoplayIfSuppressed()',
      'restoreLiveChatElements()',
    ],
  ],
  [
    'untranslate.js',
    untranslateJs,
    ['clearTimeout(untranslateDebounceTimer)', 'feedIntersectionObserver = null'],
  ],
  [
    'zen.js',
    zenJs,
    ["removeEventListener('DOMContentLoaded', domReadyHandler)"],
  ],
]) {
  assert(
    markers.every((m) => source.includes(m)),
    `${label} destroy() releases the resources it created`
  );
}

// 19. Verify the post-update re-initialization path: a re-injected bundle must
// tear down the stale instance before the fresh one takes over.
assert(
  utilsJs.includes('previousBroadcastDestroy') &&
    utilsJs.includes('destroyPreviousInstance'),
  'utils.js exposes the previous instance teardown hook for re-injection'
);
assert(
  contentJs.includes('window.__LIBERTAD_CONTENT_TEARDOWN') &&
    contentJs.includes('teardownContent') &&
    contentJs.includes('observer.disconnect()') &&
    contentJs.includes('chrome.storage.onChanged.removeListener'),
  'content.js releases its observer and listeners when a newer instance takes over'
);
assert(
  agentJs.includes('window.__LIBERTAD_AGENT_TEARDOWN') &&
    agentJs.includes('function teardownAgent()') &&
    agentJs.includes('delete boundPlayer.__libertadEventsBound') &&
    agentJs.includes('delete boundVideo.__libertadEventsBound'),
  'agent.js releases its window listeners and player bindings on re-injection'
);
assert(
  (agentJs.match(/markAutonavOwnership\(\)/g) || []).length >= 3,
  'agent.js claims autoplay ownership in every branch that suppresses it'
);

// 20. Verify internal UI keys never leak into the settings payload or sync
assert(
  contentJs.includes('stripInternalKeys(saved)') &&
    contentJs.includes('INTERNAL_STORAGE_KEYS.includes(key)'),
  'content.js filters internal UI keys out of the settings and change events'
);
assert(
  backgroundJs.includes('...stripInternalKeys(saved)') &&
    backgroundJs.includes('chrome.storage.sync.remove(INTERNAL_STORAGE_KEYS)'),
  'background.js never syncs internal UI keys to chrome.storage.sync'
);
assert(
  popupJs.includes('...stripInternalKeys(saved)') &&
    popupJs.includes('stripInternalKeys(state)'),
  'popup.js keeps internal UI keys out of the state and the saved payload'
);

// 20b. Behavioral check: the filter removes internal keys and keeps settings
const simulatedStored = {
  preset: 'balanced',
  profiles: { p1: { preset: 'custom' } },
  profiles_orphaned: { p9: { name: 'archived' } },
  libertad_paused_snapshot: { preset: 'off' },
  hasSeenWelcome: true,
};
const cleanedStored = stripInternalKeys(simulatedStored);
assert(
  INTERNAL_STORAGE_KEYS.every((k) => !(k in cleanedStored)) &&
    cleanedStored.preset === 'balanced' &&
    cleanedStored.profiles.p1.preset === 'custom' &&
    'profiles_orphaned' in simulatedStored,
  'stripInternalKeys() drops internal UI keys, keeps settings, and never mutates the source'
);

// 21. Verify the re-injection audit fixes: no redeclaration abort, live
// teardown target, and no orphaned listeners.
const constantsJs = fs.readFileSync(
  path.join(__dirname, '../constants.js'),
  'utf8',
);
assert(
  constantsJs.includes('(function () {') &&
    constantsJs.trimEnd().endsWith('})();'),
  'constants.js is IIFE-wrapped so a re-injection cannot abort it with a redeclaration SyntaxError'
);
assert(
  utilsJs.includes('const destroy = globalThis.Libertad?.broadcastDestroy;') &&
    utilsJs.includes("if (typeof destroy === 'function') destroy();"),
  'utils.js teardown hook resolves the live broadcastDestroy instead of a captured closure'
);
assert(
  welcomeJs.includes('stripInternalKeys(saved)'),
  'welcome.js never writes internal UI keys back to storage or sync'
);
assert(
  untranslateJs.includes('onAgentMetadata') &&
    untranslateJs.includes(
      "window.removeEventListener('libertad-agent-metadata', onAgentMetadata)",
    ),
  'untranslate.js detaches its agent metadata listener on destroy()'
);
assert(
  untranslateJs.includes('let moduleHydrated = false;'),
  'untranslate.js starts un-hydrated so a premature agent broadcast cannot reach the DOM'
);
assert(
  (zenJs.match(/removeEventListener\('DOMContentLoaded', domReadyHandler\)/g) || [])
    .length >= 2,
  'zen.js detaches the pending DOMContentLoaded listener on re-init and on destroy'
);

// 22. Verify the behaviour fixes: the invariants that the grep based checks
// above cannot prove on their own.
const moduleSources = {
  'styles.js': stylesJs,
  'zen.js': zenJs,
  'shorts.js': shortsJs,
  'subscriptions.js': subscriptionsJs,
  'dislikes.js': dislikesJs,
  'sponsors.js': sponsorsJs,
  'untranslate.js': untranslateJs,
};

// 22a. The chat trigger must keep the chat replay signal and drop only the
// generic carousels, which exist on nearly every watch page.
const chatTriggerMatch = stylesJs.match(
  /hasChatTriggers[\s\S]*?'([^']*target-id\*="live-chat"[^']*)'/,
);
assert(
  chatTriggerMatch !== null &&
    chatTriggerMatch[1].includes('#teaser-carousel') &&
    !chatTriggerMatch[1].includes('yt-text-carousel-item-view-model') &&
    !chatTriggerMatch[1].includes('.ytTextCarouselItemViewModelHost'),
  'styles.js chat detection keeps the chat replay trigger and drops the generic carousels'
);

// 22b. The stylesheet cache key must not depend on theme, scale or language:
// none of them shapes the CSS, so including them forced a full rebuild.
assert(
  !stylesJs.includes('settings.theme') &&
    !stylesJs.includes('settings.scale') &&
    !stylesJs.includes('settings.lang'),
  'styles.js stylesheet cache no longer depends on theme, scale or language'
);

// 22c. cleanWatchPlay must have a single owner: two owners ran the same
// document-wide scan twice per navigation.
const applyStylesBody = stylesJs.match(
  /function applyStyles\(settings\) \{[\s\S]*?\n  \}/,
);
assert(
  applyStylesBody !== null &&
    !applyStylesBody[0].includes('cleanWatchPlay('),
  'styles.js cleanWatchPlay has a single owner (the watchPlay module)'
);

assert(
  stylesJs.includes('data-libertad-watchplay-checked') &&
    stylesJs.includes('playerResizeFollowupTimer') &&
    stylesJs.includes('clearTimeout(playerResizeFollowupTimer)') &&
    stylesJs.includes('[data-libertad-clicked="true"]'),
  'styles.js memoizes the Watch & Play scan and releases every timer and marker it creates'
);

// 22d. The untranslate module must capture the localized text and restore it.
assert(
  untranslateJs.includes('function captureOriginalText(') &&
    untranslateJs.includes('function restoreOriginalTexts(') &&
    untranslateJs.includes('restoreOriginalTexts();'),
  'untranslate.js captures the localized text and restores it when disabled'
);

// The title must be written once per tree and never with a text node of its
// own: YouTube renders the title right after, and both end up on screen.
assert(
  untranslateJs.includes('if (textNodes.length === 0) {') &&
    !untranslateJs.includes(
      'el.appendChild(el.ownerDocument.createTextNode(text))',
    ) &&
    untranslateJs.includes('node.contains(other)'),
  'untranslate.js writes the title once per tree and never creates its own text node'
);

assert(
  untranslateJs.includes('controller.abort()') &&
    untranslateJs.includes('MAX_TITLE_FETCH_TRIES') &&
    untranslateJs.includes('delete node.dataset.libertadPendingId;'),
  'untranslate.js bounds the title lookup and retries a failed one'
);

// 22e. The sponsors module must validate the third party payload and probe
// the ad state once per tick.
assert(
  sponsorsJs.includes("typeof s.category === 'string'") &&
    sponsorsJs.includes('function getCategoryEntry('),
  'sponsors.js validates the category coming from the SponsorBlock payload'
);
const onTimeUpdateBlock = sponsorsJs.match(
  /const onTimeUpdate = \(\) => \{[\s\S]*?\n      \};/,
);
assert(
  onTimeUpdateBlock !== null &&
    (onTimeUpdateBlock[0].match(/isAdPlaying\(\)/g) || []).length === 1,
  'sponsors.js probes the ad state once per timeupdate tick'
);

// 22f. The popup must never mirror internal UI keys to sync and must keep
// the reset confirmation armed.
assert(
  popupJs.includes('chrome.storage.sync.set(stripInternalKeys(localSaved)') &&
    popupJs.includes("resetBtn.classList.contains('is-confirm-stage')") &&
    popupJs.includes('const patch = stripInternalKeys(partialPatch);'),
  'popup.js keeps internal keys out of sync and preserves the reset confirmation'
);

// 22g. The welcome page must clear the active profile so the chosen preset
// is not overwritten when the popup opens.
assert(
  welcomeJs.includes('activeProfile: null'),
  'welcome.js clears the active profile so the chosen preset wins'
);

// 22h. The agent must track the deferred enforcement routine.
assert(
  agentJs.includes('pendingRoutineTimer') &&
    agentJs.includes('scheduleEnforcementRoutine(100)') &&
    agentJs.includes('scheduleEnforcementRoutine(150)'),
  'agent.js tracks the deferred enforcement routine and cancels it on teardown'
);

// 22i. The service worker must validate the API payload before caching it.
assert(
  backgroundJs.includes("typeof data.dislikes !== 'number'"),
  'background.js validates the API payload before caching it'
);

// 22j. No module may expose its internals globally any more.
const deadExportsByModule = {
  'styles.js': [
    'buildStylesheet',
    'cleanLiveChat',
    'cleanExplore',
    'cleanAutoplay',
    'cleanSidebar',
    'cleanWatchPlay',
    'resetStylesNavigation',
  ],
  'zen.js': ['updateZenBanner'],
  'shorts.js': [
    'setupShortsLinkInterceptor',
    'redirectShortsIfActive',
    'cleanShortsChips',
  ],
  'subscriptions.js': [
    'redirectHomeToSubscriptions',
    'setupSubscriptionsLinkInterceptor',
  ],
  'dislikes.js': [
    'findDislikeButton',
    'injectDislikeBadge',
    'removeDislikeBadge',
    'resetDislikesNavigation',
    'pollForDislikeButton',
    'updateDislikeCount',
  ],
  'sponsors.js': [
    'getActiveVideoId',
    'checkVideoSponsors',
    'bindVideoSponsorListener',
    'updateSponsorSegments',
    'renderSponsorProgressBar',
    'resetSponsorNavigation',
    'getMainPlayerProgressBar',
    'hasActiveSponsorContainer',
    'getCurrentSponsorSegments',
    'getCurrentSponsorVideoId',
  ],
  'untranslate.js': [
    'updateWatchTitle',
    'untranslateFeed',
    'debouncedUntranslateFeed',
    'resetUntranslateNavigation',
    'enforceOriginalAudioTrack',
    'neutralizeAutoTranslatedCaptions',
    'restoreOriginalDescription',
    'restoreOriginalChapters',
  ],
};
for (const [file, names] of Object.entries(deadExportsByModule)) {
  const leaked = names.filter((name) =>
    moduleSources[file].includes(`globalThis.Libertad.${name} =`),
  );
  assert(
    leaked.length === 0,
    `${file} exposes none of its ${names.length} internal helpers globally`,
  );
}

// 23. Behavioral check: the Untranslate restore cycle, simulated on a DOM
// mock. This is the only assertion in the suite that proves the behaviour
// instead of proving the presence of a line of code.
const { runUntranslateRestoreCheck } = require('./untranslate-restore-check.js');
runUntranslateRestoreCheck(assert);

console.log(`\n=== PARITY AUDIT COMPLETE: ${failures} FAILURES ===`);
if (failures > 0) {
  process.exit(1);
} else {
  console.log('[ALL PRE-FLIGHT PARITY CHECKS PASSED: 100% OPERATIONAL]\n');
}

