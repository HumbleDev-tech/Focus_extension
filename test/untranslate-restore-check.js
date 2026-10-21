#!/usr/bin/env node
/**
 * Libertad - Behavioral check for the Untranslate restore cycle.
 *
 * The parity suite verifies that the code *mentions* the right things. This
 * check verifies that it *behaves*: a title rewritten by the module must go
 * back to its localized text when the user turns the feature off, and a
 * feature that stays enabled must re-apply its content in the same tick.
 *
 * Runs on a minimal DOM mock (test/dom-mock.js): no browser engine and no
 * new dependency are involved.
 */

const path = require('path');
const { FakeDocument, FakeWindow } = require('./dom-mock.js');

const MODULE_PATH = path.join(__dirname, '../src/modules/untranslate.js');
const VIDEO_ID = 'dQw4w9WgXcQ';
const LOCALIZED_TITLE = 'Título localizado';
const ORIGINAL_TITLE = 'Original Title';
const LOCALIZED_DESCRIPTION = 'Descripción localizada';
const ORIGINAL_DESCRIPTION = 'Raw creator description';

const BASE_SETTINGS = {
  preset: 'balanced',
  lang: 'es',
  untranslateMaster: true,
  untranslateTitles: true,
  untranslateAudio: true,
  untranslateDescription: true,
  untranslateCaptions: true,
  untranslateChapters: true,
};

/**
 * Builds a watch page with a localized title and description, loads the
 * module against it and returns the handles the assertions need.
 */
function setupScenario() {
  const document = new FakeDocument();
  const window = new FakeWindow(document);

  const scope = document.createElement('ytd-watch-metadata');
  const titleEl = document.createElement('yt-formatted-string');
  titleEl.textContent = LOCALIZED_TITLE;
  scope.appendChild(titleEl);
  document.body.appendChild(scope);

  const descScope = document.createElement('div');
  const descEl = document.createElement('span');
  descEl.textContent = LOCALIZED_DESCRIPTION;
  descScope.appendChild(descEl);
  document.body.appendChild(descScope);

  document.title = `${LOCALIZED_TITLE} - YouTube`;

  // Fixtures map the selectors the module queries to the elements above.
  document.register('watch-metadata-view-model', [titleEl]);
  document.register('ytd-expandable-video-description-body-renderer', [descEl]);

  const module = installEnvironment(document, window);
  return { document, window, module, titleEl, descEl };
}

/**
 * A watch page whose title YouTube has not rendered yet: the h1 and the
 * yt-formatted-string inside it are both empty, and both match the watch
 * title selector.
 */
function setupEmptyTitleScenario() {
  const document = new FakeDocument();
  const window = new FakeWindow(document);

  const scope = document.createElement('ytd-watch-metadata');
  const h1 = document.createElement('h1');
  const inner = document.createElement('yt-formatted-string');
  h1.appendChild(inner);
  scope.appendChild(h1);
  document.body.appendChild(scope);

  document.title = `${LOCALIZED_TITLE} - YouTube`;

  // The h1 contains the yt-formatted-string: the selector matches both.
  document.register('ytd-watch-metadata h1', [h1, inner]);

  const module = installEnvironment(document, window);
  return { document, window, module, h1, inner };
}

/**
 * A watch page whose title lookup is still in flight: the module issued the
 * oEmbed request and the response has not arrived yet.
 */
function setupPendingLookupScenario() {
  const document = new FakeDocument();
  const window = new FakeWindow(document);

  const scope = document.createElement('ytd-watch-metadata');
  const titleEl = document.createElement('yt-formatted-string');
  titleEl.textContent = LOCALIZED_TITLE;
  scope.appendChild(titleEl);
  document.body.appendChild(scope);

  document.title = `${LOCALIZED_TITLE} - YouTube`;
  document.register('watch-metadata-view-model', [titleEl]);

  let resolveLookup = null;
  const fetchImpl = () =>
    new Promise((resolve) => {
      resolveLookup = resolve;
    });

  const module = installEnvironment(document, window, { fetch: fetchImpl });

  return {
    document,
    window,
    module,
    titleEl,
    resolveLookup: (title) =>
      resolveLookup({
        ok: true,
        json: async () => ({ title }),
      }),
  };
}

/** Lets every pending microtask and timer settle. */
function flushPendingTasks() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/** Loads the module against a prepared environment and returns it. */
function installEnvironment(document, window, options = {}) {
  globalThis.window = window;
  globalThis.document = document;
  globalThis.NodeFilter = { SHOW_TEXT: 4 };
  globalThis.chrome = { runtime: {} };
  globalThis.fetch =
    options.fetch || (() => Promise.reject(new Error('offline in tests')));

  const modules = {};
  globalThis.Libertad = {
    registerModule(name, definition) {
      modules[name] = definition;
    },
  };

  delete require.cache[require.resolve(MODULE_PATH)];
  require(MODULE_PATH);

  const module = modules.untranslate;
  module.init({ ...BASE_SETTINGS }, { hydrated: true });
  return module;
}

/** Delivers the metadata the main-world agent would post after a lookup. */
function deliverAgentMetadata(window) {
  window.dispatchEvent(
    new CustomEvent('libertad-agent-metadata', {
      detail: {
        videoId: VIDEO_ID,
        title: ORIGINAL_TITLE,
        description: ORIGINAL_DESCRIPTION,
      },
    }),
  );
}

async function runUntranslateRestoreCheck(assert) {
  // Scenario 1: the user turns the titles off.
  {
    const { document, window, module, titleEl } = setupScenario();

    deliverAgentMetadata(window);

    assert(
      titleEl.textContent === ORIGINAL_TITLE,
      'untranslate rewrites the watch title with the original one',
    );
    assert(
      titleEl.dataset.libertadOrigText === LOCALIZED_TITLE,
      'untranslate captures the localized text before overwriting it',
    );

    module.onSettingsChange(
      { ...BASE_SETTINGS, untranslateTitles: false },
      { untranslateTitles: { newValue: false } },
    );

    assert(
      titleEl.textContent === LOCALIZED_TITLE,
      'disabling the titles restores the localized text',
    );
    assert(
      titleEl.dataset.libertadOrigText === undefined,
      'disabling the titles clears the captured text',
    );
    assert(
      titleEl.dataset.libertadApplied === undefined,
      'disabling the titles clears the applied marker',
    );
    assert(
      document.title === `${LOCALIZED_TITLE} - YouTube`,
      'disabling the titles restores the document title',
    );
  }

  // Scenario 2: only the description is turned off, the titles stay on.
  {
    const { window, module, titleEl, descEl } = setupScenario();

    deliverAgentMetadata(window);

    assert(
      descEl.textContent === ORIGINAL_DESCRIPTION,
      'untranslate rewrites the description with the original one',
    );

    module.onSettingsChange(
      { ...BASE_SETTINGS, untranslateDescription: false },
      { untranslateDescription: { newValue: false } },
    );

    assert(
      descEl.textContent === LOCALIZED_DESCRIPTION,
      'disabling the description restores the localized text',
    );
    assert(
      titleEl.textContent === ORIGINAL_TITLE,
      'disabling the description keeps the title translated',
    );
    assert(
      titleEl.dataset.libertadOrigText === LOCALIZED_TITLE,
      'the captured title text survives a partial disable',
    );
  }

  // Scenario 3: YouTube has not rendered the title yet. Writing the title
  // anyway duplicated it: the module created a text node in the h1 and
  // YouTube rendered its own one right after.
  {
    const { module, window, h1, inner } = setupEmptyTitleScenario();

    deliverAgentMetadata(window);

    assert(
      h1.textContent === '',
      'untranslate does not write into a title YouTube has not rendered yet',
    );
    assert(
      h1.childNodes.filter((node) => node.nodeType === 3).length === 0,
      'untranslate never injects a text node of its own into the title',
    );

    // YouTube finally renders the localized title.
    inner.textContent = LOCALIZED_TITLE;

    module.onDomMutation({ ...BASE_SETTINGS });

    assert(
      h1.textContent === ORIGINAL_TITLE,
      'the title is translated once, not twice, after YouTube renders it',
    );
    assert(
      inner.dataset.libertadOrigText === LOCALIZED_TITLE,
      'the localized text is captured when the title finally shows up',
    );
  }

  // Scenario 4: the title lookup resolves after the user turned the titles
  // off. The stale response must not re-apply the original title.
  {
    const { module, titleEl, resolveLookup } = setupPendingLookupScenario();

    module.onSettingsChange(
      { ...BASE_SETTINGS, untranslateTitles: false },
      { untranslateTitles: { newValue: false } },
    );

    resolveLookup(ORIGINAL_TITLE);
    await flushPendingTasks();

    assert(
      titleEl.textContent === LOCALIZED_TITLE,
      'a stale title lookup does not re-apply the original title',
    );
  }

  // Scenario 5: the same lookup, but the suite stays enabled. The original
  // title must reach the screen, so the guard cannot be a blanket refusal.
  {
    const { module, titleEl, resolveLookup } = setupPendingLookupScenario();

    resolveLookup(ORIGINAL_TITLE);
    await flushPendingTasks();

    assert(
      titleEl.textContent === ORIGINAL_TITLE,
      'a title lookup that resolves while the suite is on applies the original title',
    );
    assert(
      titleEl.dataset.libertadOrigText === LOCALIZED_TITLE,
      'the late lookup still captures the localized text before overwriting it',
    );
  }

  // Scenario 6: YouTube re-renders the title between the capture and the
  // restore, leaving the node without a text node. The captured localized
  // text must survive: a restore that cannot write must not throw it away.
  {
    const { window, module, titleEl } = setupScenario();

    deliverAgentMetadata(window);

    // YouTube replaces the content of the title node: it is now empty.
    titleEl.textContent = '';

    module.onSettingsChange(
      { ...BASE_SETTINGS, untranslateTitles: false },
      { untranslateTitles: { newValue: false } },
    );

    assert(
      titleEl.dataset.libertadOrigText === LOCALIZED_TITLE,
      'the captured text survives a restore that could not write',
    );

    // YouTube renders the localized title again: the next restore succeeds.
    titleEl.textContent = LOCALIZED_TITLE;

    module.onSettingsChange(
      { ...BASE_SETTINGS, untranslateTitles: false },
      { untranslateTitles: { newValue: false } },
    );

    assert(
      titleEl.textContent === LOCALIZED_TITLE,
      'a later restore puts the localized title back',
    );
    assert(
      titleEl.dataset.libertadOrigText === undefined,
      'the captured text is cleared once the restore succeeds',
    );
  }
}

module.exports = { runUntranslateRestoreCheck };

if (require.main === module) {
  let failures = 0;
  const assert = (condition, message) => {
    if (!condition) {
      console.error(`[FAIL] ${message}`);
      failures++;
    } else {
      console.log(`[PASS] ${message}`);
    }
  };
  runUntranslateRestoreCheck(assert)
    .then(() => {
      console.log(
        `\n=== UNTRANSLATE RESTORE CHECK COMPLETE: ${failures} FAILURES ===`,
      );
      process.exit(failures > 0 ? 1 : 0);
    })
    .catch((err) => {
      console.error('[FAIL] the behavioural check threw:', err);
      process.exit(1);
    });
}
