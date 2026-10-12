/*! Oldschool v0.2.0 · MIT · https://github.com/Zyvox/oldschool-no */
(function () {
'use strict';
var __factories = {}, __cache = {};
function __define(id, factory) { __factories[id] = factory; }
function __require(id) {
  if (__cache[id]) return __cache[id];
  var exports = (__cache[id] = {});
  __factories[id](__require, exports);
  return exports;
}
__define("core.js", function (__require, __exports) {
/**
 * Oldschool — core helpers shared by all behaviors.
 * Everything here is tiny and dependency-free.
 */

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

let counter = 0;
function uid(prefix = 'os') {
  counter += 1;
  return `${prefix}-${counter}-${Math.random().toString(36).slice(2, 7)}`;
}

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** localStorage that never throws (private mode, blocked storage, SSR). */
const store = {
  get(key, fallback = null) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
};

/* ---------------------------------------------------------------------------
 * Strings. Chosen from <html lang>; override per element with data attributes
 * where a component documents it.
 * ------------------------------------------------------------------------ */

const STRINGS = {
  en: {
    copied: 'Copied to the clipboard',
    linkCopied: 'Link copied',
    copyFailed: 'Could not copy',
  },
  nb: {
    copied: 'Kopiert',
    linkCopied: 'Lenken er kopiert',
    copyFailed: 'Kunne ikke kopiere',
  },
};

function t(key, vars = {}) {
  const lang = (document.documentElement.lang || 'en').toLowerCase().slice(0, 2);
  const dict = STRINGS[['nb', 'nn', 'no'].includes(lang) ? 'nb' : lang] ?? STRINGS.en;
  const text = dict[key] ?? STRINGS.en[key] ?? key;
  return text.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? ''));
}

/* ---------------------------------------------------------------------------
 * Icons. The sprite location is read from <html data-os-icons="…">, or
 * inferred from the first sprite reference already in the page.
 * ------------------------------------------------------------------------ */

let spriteUrl;
function iconHref(name) {
  if (spriteUrl === undefined) {
    const configured = document.documentElement.dataset.osIcons;
    const existing = document.querySelector('use[href*="#os-"]')?.getAttribute('href');
    spriteUrl = configured ?? (existing ? existing.split('#')[0] : 'icons.svg');
  }
  return `${spriteUrl}#os-${name}`;
}

function icon(name, className = '') {
  return `<svg class="os-icon ${className}" aria-hidden="true" focusable="false"><use href="${iconHref(name)}"></use></svg>`;
}

/* ---------------------------------------------------------------------------
 * Behavior registry: every behavior declares a selector and an init
 * function. init() runs once per element (tracked in a WeakSet).
 * ------------------------------------------------------------------------ */

const registry = [];
const initialised = new WeakMap();

function register(name, selector, setup) {
  registry.push({ name, selector, setup });
}

function initAll(root = document) {
  for (const { name, selector, setup } of registry) {
    const scope = root.nodeType === 1 && root.matches(selector) ? [root, ...$$(selector, root)] : $$(selector, root);
    for (const el of scope) {
      let done = initialised.get(el);
      if (!done) {
        done = new Set();
        initialised.set(el, done);
      }
      if (done.has(name)) continue;
      done.add(name);
      try {
        setup(el);
      } catch (error) {
        console.error(`[oldschool] ${name} failed`, el, error);
      }
    }
  }
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.append(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    area.remove();
    return ok;
  }
}
  __exports.$ = $;
  __exports.$$ = $$;
  __exports.uid = uid;
  __exports.reducedMotion = reducedMotion;
  __exports.store = store;
  __exports.t = t;
  __exports.iconHref = iconHref;
  __exports.icon = icon;
  __exports.register = register;
  __exports.initAll = initAll;
  __exports.copyText = copyText;
});

__define("tabs.js", function (__require, __exports) {
/**
 * Tabs — WAI-ARIA tabs with automatic activation, arrow keys, Home/End.
 * Markup: see src/css/components/tabs.css.
 */
const { $, $$, uid } = __require("core.js");
function initTabs(root) {
  const list = $('.os-tabs__list', root);
  if (!list) return;
  const tabs = $$('[role="tab"]', list);
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));
  if (!tabs.length || panels.some((p) => !p)) return;

  tabs.forEach((tab, i) => {
    tab.id ||= uid('tab');
    tab.type = 'button';
    panels[i].setAttribute('role', 'tabpanel');
    panels[i].setAttribute('aria-labelledby', tab.id);
    panels[i].tabIndex = 0;
  });

  function select(i, focus = false) {
    tabs.forEach((tab, j) => {
      const selected = j === i;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[j].hidden = !selected;
    });
    if (focus) tabs[i].focus();
    root.dispatchEvent(new CustomEvent('os:tabchange', { detail: { index: i, tab: tabs[i] } }));
  }

  list.addEventListener('click', (event) => {
    const tab = event.target.closest('[role="tab"]');
    if (tab) select(tabs.indexOf(tab));
  });

  list.addEventListener('keydown', (event) => {
    const current = tabs.indexOf(document.activeElement);
    if (current < 0) return;
    const keys = { ArrowRight: current + 1, ArrowLeft: current - 1, Home: 0, End: tabs.length - 1 };
    if (!(event.key in keys)) return;
    event.preventDefault();
    select((keys[event.key] + tabs.length) % tabs.length, true);
  });

  const initial = tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true');
  select(Math.max(0, initial));
  root.dataset.ready = '';
}
  __exports.initTabs = initTabs;
});

__define("toast.js", function (__require, __exports) {
/**
 * Toasts — the yellow "Lagret!" note at the top of the window, in a polite
 * live region.
 *
 *   Oldschool.toast('Arrangementet er lagret');
 */
let region = null;

function ensureRegion() {
  if (region?.isConnected) return region;
  region = document.createElement('div');
  region.className = 'os-toaster';
  region.setAttribute('role', 'status');
  region.setAttribute('aria-live', 'polite');
  document.body.append(region);
  return region;
}

function toast(message, { duration = 3200 } = {}) {
  const host = ensureRegion();
  const el = document.createElement('div');
  el.className = 'os-toast';
  el.textContent = message;
  host.append(el);

  const remove = () => el.remove();
  window.setTimeout(() => {
    el.dataset.state = 'hidden';
    el.addEventListener('transitionend', remove, { once: true });
    window.setTimeout(remove, 500);
  }, duration);
  return el;
}
  __exports.toast = toast;
});

__define("actions.js", function (__require, __exports) {
/**
 * Small declarative actions. All progressive: without JS the markup still
 * makes sense (links stay links, toggles stay buttons).
 *
 *   data-os-toggle                aria-pressed on/off. Optional:
 *     data-os-label-pressed="…"   label while pressed (swaps .os-action__label / .os-button__label text)
 *     data-os-toast-pressed="…"   toast when turned on; data-os-toast-released="…" when turned off
 *     data-os-persist="key"       remember the state in localStorage
 *   data-os-share                 native share sheet, or copy the page link
 *   data-os-copy="text"           copy text (or the element's text) to the clipboard;
 *                                 data-os-copy="#id" copies the text of that element
 *   data-os-print                 print the page
 *   data-os-dialog="id"           open <dialog id="…"> with showModal()
 */
const { $, $$, store, t, copyText } = __require("core.js");
const { toast } = __require("toast.js");
const PERSIST_KEY = 'os-toggles';

function initToggle(button) {
  const labelEl = $('.os-action__label, .os-button__label', button) ?? null;
  const labels = {
    off: labelEl?.textContent ?? button.getAttribute('aria-label'),
    on: button.dataset.osLabelPressed,
  };
  const persistKey = button.dataset.osPersist;

  const render = (pressed) => {
    button.setAttribute('aria-pressed', String(pressed));
    if (!labels.on) return;
    const text = pressed ? labels.on : labels.off;
    if (labelEl) labelEl.textContent = text;
    else button.setAttribute('aria-label', text);
  };

  if (persistKey) {
    const saved = store.get(PERSIST_KEY, {});
    if (persistKey in saved) render(Boolean(saved[persistKey]));
  }

  button.addEventListener('click', () => {
    const pressed = button.getAttribute('aria-pressed') !== 'true';
    render(pressed);
    if (persistKey) store.set(PERSIST_KEY, { ...store.get(PERSIST_KEY, {}), [persistKey]: pressed });
    const message = pressed ? button.dataset.osToastPressed : button.dataset.osToastReleased;
    if (message) toast(message);
  });
}

function initShare(button) {
  button.addEventListener('click', async () => {
    const data = { title: document.title, url: button.dataset.osShare || window.location.href };
    if (navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch (error) {
        if (error?.name === 'AbortError') return;
      }
    }
    const ok = await copyText(data.url);
    toast(ok ? t('linkCopied') : t('copyFailed'));
  });
}

function initCopy(button) {
  button.addEventListener('click', async () => {
    const value = button.dataset.osCopy;
    const source = value?.startsWith('#') ? document.getElementById(value.slice(1)) : null;
    const text = source ? source.textContent : value || button.textContent.trim();
    const ok = await copyText(text);
    toast(ok ? button.dataset.osCopied || t('copied') : t('copyFailed'));
  });
}

function initPrint(button) {
  button.addEventListener('click', () => window.print());
}

function initDialogTrigger(trigger) {
  trigger.addEventListener('click', (event) => {
    const dialog = document.getElementById(trigger.dataset.osDialog);
    if (!(dialog instanceof HTMLDialogElement)) return;
    event.preventDefault();
    dialog.showModal();
  });
}
  __exports.initToggle = initToggle;
  __exports.initShare = initShare;
  __exports.initCopy = initCopy;
  __exports.initPrint = initPrint;
  __exports.initDialogTrigger = initDialogTrigger;
});

__define("sort.js", function (__require, __exports) {
/**
 * Sortable tables — <table class="os-table" data-os-sort>.
 * Header cells become buttons; aria-sort reflects the state. Numbers
 * (including "7 500,-", "12,5 %" and dates written dd.mm.yyyy) sort
 * numerically. Add data-os-nosort to a <th> to leave it alone.
 */
const { $, $$ } = __require("core.js");
function sortValue(cell) {
  const raw = (cell.dataset.sortValue ?? cell.textContent).trim();
  const date = raw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (date) return Number(`${date[3]}${date[2].padStart(2, '0')}${date[1].padStart(2, '0')}`);
  const numeric = raw.replace(/[\s ]/g, '').replace(/,-$/, '').replace(/kr$/i, '').replace('−', '-').replace(',', '.').replace(/%$/, '');
  return numeric !== '' && !Number.isNaN(Number(numeric)) ? Number(numeric) : raw.toLocaleLowerCase('nb');
}

function initSortableTable(table) {
  const head = $('thead tr', table);
  const body = $('tbody', table);
  if (!head || !body) return;
  const headers = $$('th', head);

  headers.forEach((th, column) => {
    if (th.hasAttribute('data-os-nosort')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'os-table__sort';
    button.append(...th.childNodes);
    th.append(button);

    button.addEventListener('click', () => {
      const ascending = th.getAttribute('aria-sort') !== 'ascending';
      headers.forEach((other) => other.removeAttribute('aria-sort'));
      th.setAttribute('aria-sort', ascending ? 'ascending' : 'descending');
      const rows = $$('tr', body);
      rows.sort((a, b) => {
        const x = sortValue(a.cells[column]);
        const y = sortValue(b.cells[column]);
        const result = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'nb');
        return ascending ? result : -result;
      });
      body.append(...rows);
    });
  });
}

/**
 * Stacked tables — <table class="os-table os-table--stack">. Copies each
 * column header's text into data-label on cells that have none, so the
 * stacked (narrow) layout can label every value.
 */
function initStackedTable(table) {
  // title holds the full name of a shortened header; innerText keeps <br> as a space.
  const headers = $$('thead th', table).map((th) => (th.title || th.innerText || th.textContent).replace(/\s+/g, ' ').trim());
  for (const row of $$('tbody tr', table)) {
    Array.from(row.cells).forEach((cell, i) => {
      if (!cell.hasAttribute('data-label') && headers[i]) cell.dataset.label = headers[i];
    });
  }
}
  __exports.initSortableTable = initSortableTable;
  __exports.initStackedTable = initStackedTable;
});

__define("menu.js", function (__require, __exports) {
/**
 * Menus — places an .os-menu popover under the button that opens it.
 *
 * CSS anchor positioning does this on its own in browsers that support it
 * and when the popover is opened by its popovertarget button. Everywhere
 * else (older browsers, showPopover() from script) a fixed popover would open
 * in the top-left corner, so this measures the button instead: below it,
 * aligned to its start edge (or its end edge when there is no room), flipped
 * above when there is no room below. Follows scrolling while open.
 */
const { $ } = __require("core.js");
const GAP = 4;
const EDGE = 8;

function place(menu, button) {
  const r = button.getBoundingClientRect();
  menu.style.positionArea = 'none';
  menu.style.margin = '0';
  const w = menu.offsetWidth;
  const h = menu.offsetHeight;
  const vw = document.documentElement.clientWidth;
  const vh = window.innerHeight;
  let left = r.left + w <= vw - EDGE ? r.left : r.right - w;
  left = Math.max(EDGE, Math.min(left, vw - w - EDGE));
  const below = r.bottom + GAP + h <= vh - EDGE;
  menu.style.left = `${left}px`;
  menu.style.top = `${below ? r.bottom + GAP : Math.max(EDGE, r.top - h - GAP)}px`;
}

function initMenu(menu) {
  if (!menu.id) return;
  let button = null;
  const update = () => button && place(menu, button);
  menu.addEventListener('toggle', (event) => {
    if (event.newState === 'open') {
      button = event.source ?? $(`[popovertarget="${CSS.escape(menu.id)}"]`);
      if (!button) return;
      update();
      window.addEventListener('scroll', update, { capture: true, passive: true });
      window.addEventListener('resize', update, { passive: true });
    } else {
      window.removeEventListener('scroll', update, { capture: true });
      window.removeEventListener('resize', update);
      button = null;
    }
  });
}
  __exports.initMenu = initMenu;
});

__define("theme.js", function (__require, __exports) {
/**
 * Theme, mode, density and width preferences.
 *
 *   <html data-theme="standard" data-mode="dark" data-density="compact" data-width="wide">
 *
 * Preferences persist in localStorage ("os-prefs") and sync across tabs and
 * iframes. Put this in <head> *before* the stylesheet to avoid a flash:
 *
 *   <script>(function(){try{var p=JSON.parse(localStorage.getItem('os-prefs')||'{}'),d=document.documentElement;
 *   if(d.hasAttribute('data-os-lock'))return;if(p.theme)d.dataset.theme=p.theme;if(p.mode&&p.mode!=='auto')d.dataset.mode=p.mode;
 *   if(p.density&&p.density!=='standard')d.dataset.density=p.density;if(p.width&&p.width!=='classic')d.dataset.width=p.width}catch(e){}})()</script>
 *
 * Declarative controls (select or radio group):
 *   <select data-os-theme-control="theme">…</select>
 *   <fieldset data-os-theme-control="mode">…radios auto|light|dark…</fieldset>
 *
 * Add data-os-lock to <html> to keep a page on its own theme.
 */
const { $$, store } = __require("core.js");
const KEY = 'os-prefs';
const DEFAULTS = { theme: 'retro', mode: 'auto', density: 'standard', width: 'classic' };
const ATTRS = { theme: 'data-theme', mode: 'data-mode', density: 'data-density', width: 'data-width' };

function root() {
  return document.documentElement;
}

function getPreferences() {
  const el = root();
  return {
    theme: el.getAttribute(ATTRS.theme) ?? DEFAULTS.theme,
    mode: el.getAttribute(ATTRS.mode) ?? DEFAULTS.mode,
    density: el.getAttribute(ATTRS.density) ?? DEFAULTS.density,
    width: el.getAttribute(ATTRS.width) ?? DEFAULTS.width,
  };
}

function apply(prefs) {
  const el = root();
  for (const [key, attr] of Object.entries(ATTRS)) {
    if (!(key in prefs)) continue;
    const value = prefs[key];
    if (!value || (key !== 'theme' && value === DEFAULTS[key])) el.removeAttribute(attr);
    else el.setAttribute(attr, value);
  }
  syncControls();
  document.dispatchEvent(new CustomEvent('os:preferences', { detail: getPreferences() }));
}

function setPreferences(partial) {
  if (root().hasAttribute('data-os-lock')) return getPreferences();
  const next = { ...store.get(KEY, {}), ...partial };
  store.set(KEY, next);
  apply(partial);
  return getPreferences();
}

/** The resolved mode right now: 'light' or 'dark'. */
function resolvedMode() {
  const { mode } = getPreferences();
  if (mode === 'light' || mode === 'dark') return mode;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function syncControls() {
  const prefs = getPreferences();
  for (const control of $$('[data-os-theme-control]')) {
    const key = control.dataset.osThemeControl;
    const value = prefs[key];
    if (control instanceof HTMLSelectElement) {
      control.value = value;
    } else {
      for (const input of $$('input', control)) input.checked = input.value === value;
    }
  }
}

function bindThemeControl(control) {
  const key = control.dataset.osThemeControl;
  if (!(key in ATTRS)) return;
  control.addEventListener('change', (event) => {
    const value = event.target.value;
    if (value) setPreferences({ [key]: value });
  });
  syncControls();
}

let listening = false;
function listenForPreferenceChanges() {
  if (listening) return;
  listening = true;
  window.addEventListener('storage', (event) => {
    if (event.key !== KEY || root().hasAttribute('data-os-lock')) return;
    apply({ ...DEFAULTS, ...store.get(KEY, {}) });
  });
}
  __exports.getPreferences = getPreferences;
  __exports.setPreferences = setPreferences;
  __exports.resolvedMode = resolvedMode;
  __exports.bindThemeControl = bindThemeControl;
  __exports.listenForPreferenceChanges = listenForPreferenceChanges;
});

__define("oldschool.js", function (__require, __exports) {
/**
 * Oldschool — behaviors entry point (optional: every component works without it).
 *
 * Classic script (works from file:// too):
 *   <script src="dist/oldschool.js" defer></script>      → window.Oldschool
 * ES module:
 *   <script type="module" src="dist/esm/oldschool.js"></script>
 *   import { toast } from 'oldschool-no';
 *
 * Behaviors attach to data-os-* hooks on DOMContentLoaded. After inserting
 * new markup, call Oldschool.init(container).
 */
const { register, initAll } = __require("core.js");
const { initTabs } = __require("tabs.js");
const { toast } = __require("toast.js");
const { initToggle, initShare, initCopy, initPrint, initDialogTrigger } = __require("actions.js");
const { initSortableTable, initStackedTable } = __require("sort.js");
const { initMenu } = __require("menu.js");
const { getPreferences, setPreferences, resolvedMode, bindThemeControl, listenForPreferenceChanges } = __require("theme.js");
const version = '0.2.0';

register('tabs', '[data-os-tabs]', initTabs);
register('toggle', '[data-os-toggle]', initToggle);
register('share', '[data-os-share]', initShare);
register('copy', '[data-os-copy]', initCopy);
register('print', '[data-os-print]', initPrint);
register('dialog', '[data-os-dialog]', initDialogTrigger);
register('sort', 'table[data-os-sort]', initSortableTable);
register('stack', 'table.os-table--stack', initStackedTable);
register('menu', '.os-menu[popover]', initMenu);
register('theme-control', '[data-os-theme-control]', bindThemeControl);

function init(root = document) {
  initAll(root);
}

const theme = { get: getPreferences, set: setPreferences, resolvedMode };


function start() {
  document.documentElement.classList.add('os-js');
  listenForPreferenceChanges();
  init(document);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
}
  __exports.version = version;
  __exports.init = init;
  __exports.theme = theme;
  __exports.toast = toast;
  __exports.register = register;
});

window.Oldschool = __require("oldschool.js");
})();
