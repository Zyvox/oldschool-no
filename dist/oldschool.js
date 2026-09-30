/*! Oldschool v0.1.0 · MIT · https://github.com/Zyvox/oldschool-no */
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
    gallery: 'Image gallery',
    prev: 'Previous image',
    next: 'Next image',
    close: 'Close',
    open: 'Show full screen',
    imageOf: 'Image {i} of {n}',
    copied: 'Copied to the clipboard',
    linkCopied: 'Link copied',
    copyFailed: 'Could not copy',
    saved: 'Saved',
    removed: 'Removed',
  },
  nb: {
    gallery: 'Bildegalleri',
    prev: 'Forrige bilde',
    next: 'Neste bilde',
    close: 'Lukk',
    open: 'Vis i fullskjerm',
    imageOf: 'Bilde {i} av {n}',
    copied: 'Kopiert til utklippstavlen',
    linkCopied: 'Lenken er kopiert',
    copyFailed: 'Kunne ikke kopiere',
    saved: 'Lagret',
    removed: 'Fjernet',
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

__define("lightbox.js", function (__require, __exports) {
/**
 * Lightbox — full-screen image viewer on a native <dialog>.
 *
 *   Oldschool.openLightbox([{ src, alt, caption }], startIndex);
 *
 * Arrow keys and swipes move between images, Escape closes, and focus returns
 * to where it was when the viewer opened.
 */
const { icon, t } = __require("core.js");
function openLightbox(items, start = 0, { onChange } = {}) {
  if (!items.length) return null;
  let index = Math.max(0, Math.min(start, items.length - 1));

  const dialog = document.createElement('dialog');
  dialog.className = 'os-lightbox';
  dialog.setAttribute('aria-label', t('gallery'));
  dialog.innerHTML = `
    <div class="os-lightbox__bar">
      <span class="os-lightbox__count" aria-live="polite"></span>
      <span class="os-lightbox__caption"></span>
      <button type="button" class="os-lightbox__button" data-action="close" aria-label="${t('close')}">${icon('x')}</button>
    </div>
    <div class="os-lightbox__stage">
      <img alt="">
      <button type="button" class="os-lightbox__button os-lightbox__prev" data-action="prev" aria-label="${t('prev')}">${icon('chevron-left')}</button>
      <button type="button" class="os-lightbox__button os-lightbox__next" data-action="next" aria-label="${t('next')}">${icon('chevron-right')}</button>
    </div>
    <div class="os-lightbox__thumbs"></div>`;

  const img = dialog.querySelector('.os-lightbox__stage img');
  const count = dialog.querySelector('.os-lightbox__count');
  const caption = dialog.querySelector('.os-lightbox__caption');
  const prev = dialog.querySelector('[data-action="prev"]');
  const next = dialog.querySelector('[data-action="next"]');
  const strip = dialog.querySelector('.os-lightbox__thumbs');

  const thumbs = items.map((item, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'os-lightbox__thumb';
    button.setAttribute('aria-label', t('imageOf', { i: i + 1, n: items.length }));
    button.innerHTML = '<img alt="">';
    button.querySelector('img').src = item.thumb ?? item.src;
    button.addEventListener('click', () => show(i));
    strip.append(button);
    return button;
  });

  function show(i) {
    index = (i + items.length) % items.length;
    const item = items[index];
    img.src = item.src;
    img.alt = item.alt ?? '';
    count.textContent = `${index + 1} / ${items.length}`;
    caption.textContent = item.caption ?? item.alt ?? '';
    thumbs.forEach((thumb, j) => thumb.setAttribute('aria-current', String(j === index)));
    thumbs[index].scrollIntoView({ block: 'nearest', inline: 'nearest' });
    onChange?.(index);
  }

  dialog.addEventListener('click', (event) => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'close') dialog.close();
    else if (action === 'prev') show(index - 1);
    else if (action === 'next') show(index + 1);
    else if (event.target === dialog || event.target.classList.contains('os-lightbox__stage')) dialog.close();
  });

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); show(index - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); show(index + 1); }
    if (event.key === 'Home') { event.preventDefault(); show(0); }
    if (event.key === 'End') { event.preventDefault(); show(items.length - 1); }
  });

  // Swipe
  let startX = null;
  const stage = dialog.querySelector('.os-lightbox__stage');
  stage.addEventListener('pointerdown', (event) => { startX = event.clientX; });
  stage.addEventListener('pointerup', (event) => {
    if (startX === null) return;
    const dx = event.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
  });

  dialog.addEventListener('close', () => dialog.remove());

  if (items.length < 2) {
    prev.hidden = true;
    next.hidden = true;
    strip.hidden = true;
  }

  document.body.append(dialog);
  show(index);
  dialog.showModal();
  dialog.querySelector('[data-action="close"]').focus();
  return dialog;
}
  __exports.openLightbox = openLightbox;
});

__define("gallery.js", function (__require, __exports) {
/**
 * Gallery — enhances .os-gallery[data-os-gallery]:
 *  · previous/next buttons and a full-screen button on the picture
 *  · thumbnails move the picture instead of jumping the page
 *  · arrow keys on the focused picture, counter kept in sync while swiping
 *  · [data-os-gallery-open] and clicking the picture open the lightbox
 */
const { $, $$, icon, t, reducedMotion } = __require("core.js");
const { openLightbox } = __require("lightbox.js");
function initGallery(root) {
  const track = $('.os-gallery__track', root);
  const stage = $('.os-gallery__stage', root);
  if (!track || !stage) return;

  const slides = Array.from(track.children);
  const thumbs = $$('.os-gallery__thumb', root);
  const counters = $$('[data-os-gallery-current]', root);
  const total = slides.length;
  let index = 0;

  const items = slides.map((slide) => {
    const img = $('img', slide);
    return {
      src: slide.dataset.full || img?.currentSrc || img?.src,
      thumb: img?.currentSrc || img?.src,
      alt: img?.alt ?? '',
      caption: slide.dataset.caption ?? img?.alt ?? '',
    };
  });

  const makeButton = (className, label, iconName) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.setAttribute('aria-label', label);
    button.innerHTML = icon(iconName);
    stage.append(button);
    return button;
  };

  const prev = total > 1 ? makeButton('os-gallery__nav os-gallery__nav--prev', t('prev'), 'chevron-left') : null;
  const next = total > 1 ? makeButton('os-gallery__nav os-gallery__nav--next', t('next'), 'chevron-right') : null;
  makeButton('os-gallery__expand', t('open'), 'maximize-2').addEventListener('click', () => open());

  track.tabIndex = 0;
  track.setAttribute('aria-label', root.getAttribute('aria-label') ?? t('gallery'));
  slides.forEach((slide, i) => {
    slide.setAttribute('aria-label', t('imageOf', { i: i + 1, n: total }));
  });

  function setIndex(i) {
    index = i;
    counters.forEach((el) => { el.textContent = String(i + 1); });
    thumbs.forEach((thumb, j) => thumb.setAttribute('aria-current', String(j === i)));
    if (prev) prev.disabled = i === 0;
    if (next) next.disabled = i === total - 1;
  }

  function go(i) {
    const target = Math.max(0, Math.min(i, total - 1));
    track.scrollTo({ left: target * track.clientWidth, behavior: reducedMotion() ? 'auto' : 'smooth' });
    setIndex(target);
  }

  function open(i = index) {
    openLightbox(items, i, { onChange: (j) => { if (j !== index) go(j); } });
  }

  let frame = 0;
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const i = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
      if (i !== index && i >= 0 && i < total) setIndex(i);
    });
  }, { passive: true });

  prev?.addEventListener('click', () => go(index - 1));
  next?.addEventListener('click', () => go(index + 1));

  thumbs.forEach((thumb, i) => {
    thumb.addEventListener('click', (event) => {
      event.preventDefault();
      if (thumb.hasAttribute('data-more')) open(i);
      else go(i);
    });
  });

  track.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); go(index - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); go(index + 1); }
    if (event.key === 'Enter') { event.preventDefault(); open(); }
  });

  slides.forEach((slide, i) => {
    slide.addEventListener('click', (event) => {
      event.preventDefault();
      open(i);
    });
  });

  $$('[data-os-gallery-open]', root).forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      open();
    });
  });

  setIndex(0);
}
  __exports.initGallery = initGallery;
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
 * Toasts — short confirmations in a polite live region.
 *
 *   Oldschool.toast('Annonsen er lagret');
 *   Oldschool.toast('Kunne ikke kopiere', { icon: 'circle-alert' });
 */
const { icon } = __require("core.js");
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

function toast(message, { icon: iconName = 'circle-check', duration = 3200 } = {}) {
  const host = ensureRegion();
  const el = document.createElement('div');
  el.className = 'os-toast';
  el.innerHTML = `${icon(iconName)}<span></span>`;
  el.querySelector('span').textContent = message;
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
 *   data-os-copy="text"           copy text (or the element's text) to the clipboard
 *   data-os-print                 print the page
 *   data-os-dialog="id"           open <dialog id="…"> with showModal()
 *   data-os-view="#list"          radio group switching a result list between list/grid
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
    if (message) toast(message, { icon: pressed ? 'circle-check' : 'info' });
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
    toast(ok ? t('linkCopied') : t('copyFailed'), { icon: ok ? 'link' : 'circle-alert' });
  });
}

function initCopy(button) {
  button.addEventListener('click', async () => {
    const text = button.dataset.osCopy || button.textContent.trim();
    const ok = await copyText(text);
    toast(ok ? button.dataset.osCopied || t('copied') : t('copyFailed'), { icon: ok ? 'clipboard-check' : 'circle-alert' });
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

function initViewSwitch(group) {
  const target = $(group.dataset.osView);
  if (!target) return;
  const apply = () => {
    const value = $('input:checked', group)?.value;
    target.classList.toggle('os-results--grid', value === 'grid');
  };
  $$('input', group).forEach((input) => input.addEventListener('change', apply));
  apply();
}
  __exports.initToggle = initToggle;
  __exports.initShare = initShare;
  __exports.initCopy = initCopy;
  __exports.initPrint = initPrint;
  __exports.initDialogTrigger = initDialogTrigger;
  __exports.initViewSwitch = initViewSwitch;
});

__define("theme.js", function (__require, __exports) {
/**
 * Theme, mode and density preferences.
 *
 *   <html data-theme="fjord" data-mode="dark" data-density="compact">
 *
 * Preferences persist in localStorage ("os-prefs") and sync across tabs and
 * iframes. Put this in <head> *before* the stylesheet to avoid a flash:
 *
 *   <script>(function(){try{var p=JSON.parse(localStorage.getItem('os-prefs')||'{}'),d=document.documentElement;
 *   if(d.hasAttribute('data-os-lock'))return;if(p.theme)d.dataset.theme=p.theme;if(p.mode&&p.mode!=='auto')d.dataset.mode=p.mode;
 *   if(p.density&&p.density!=='comfortable')d.dataset.density=p.density}catch(e){}})()</script>
 *
 * Declarative controls (select or radio group):
 *   <select data-os-theme-control="theme">…</select>
 *   <fieldset data-os-theme-control="mode">…radios auto|light|dark…</fieldset>
 *
 * Add data-os-lock to <html> to keep a page on its own theme.
 */
const { $$, store } = __require("core.js");
const KEY = 'os-prefs';
const DEFAULTS = { theme: 'fjord', mode: 'auto', density: 'comfortable' };
const ATTRS = { theme: 'data-theme', mode: 'data-mode', density: 'data-density' };

function root() {
  return document.documentElement;
}

function getPreferences() {
  const el = root();
  return {
    theme: el.getAttribute(ATTRS.theme) ?? DEFAULTS.theme,
    mode: el.getAttribute(ATTRS.mode) ?? DEFAULTS.mode,
    density: el.getAttribute(ATTRS.density) ?? DEFAULTS.density,
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
 * Oldschool — behaviors entry point.
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
const { initGallery } = __require("gallery.js");
const { openLightbox } = __require("lightbox.js");
const { initTabs } = __require("tabs.js");
const { toast } = __require("toast.js");
const { initToggle, initShare, initCopy, initPrint, initDialogTrigger, initViewSwitch } = __require("actions.js");
const { getPreferences, setPreferences, resolvedMode, bindThemeControl, listenForPreferenceChanges } = __require("theme.js");
const version = '0.1.0';

register('gallery', '[data-os-gallery]', initGallery);
register('tabs', '[data-os-tabs]', initTabs);
register('toggle', '[data-os-toggle]', initToggle);
register('share', '[data-os-share]', initShare);
register('copy', '[data-os-copy]', initCopy);
register('print', '[data-os-print]', initPrint);
register('dialog', '[data-os-dialog]', initDialogTrigger);
register('view', '[data-os-view]', initViewSwitch);
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
  __exports.openLightbox = openLightbox;
  __exports.register = register;
});

window.Oldschool = __require("oldschool.js");
})();
