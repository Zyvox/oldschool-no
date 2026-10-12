/**
 * Oldschool — core helpers shared by all behaviors.
 * Everything here is tiny and dependency-free.
 */

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

let counter = 0;
export function uid(prefix = 'os') {
  counter += 1;
  return `${prefix}-${counter}-${Math.random().toString(36).slice(2, 7)}`;
}

export function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** localStorage that never throws (private mode, blocked storage, SSR). */
export const store = {
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
    close: 'Close',
    info: 'Information',
    success: 'Done',
    warning: 'Note',
    danger: 'Something went wrong',
  },
  nb: {
    copied: 'Kopiert',
    linkCopied: 'Lenken er kopiert',
    copyFailed: 'Kunne ikke kopiere',
    close: 'Lukk',
    info: 'Informasjon',
    success: 'Fullført',
    warning: 'Obs!',
    danger: 'Noe gikk galt',
  },
};

export function t(key, vars = {}) {
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
export function iconHref(name) {
  if (spriteUrl === undefined) {
    const configured = document.documentElement.dataset.osIcons;
    const existing = document.querySelector('use[href*="#os-"]')?.getAttribute('href');
    spriteUrl = configured ?? (existing ? existing.split('#')[0] : 'icons.svg');
  }
  return `${spriteUrl}#os-${name}`;
}

export function icon(name, className = '') {
  return `<svg class="os-icon ${className}" aria-hidden="true" focusable="false"><use href="${iconHref(name)}"></use></svg>`;
}

/* ---------------------------------------------------------------------------
 * Behavior registry: every behavior declares a selector and an init
 * function. init() runs once per element (tracked in a WeakSet).
 * ------------------------------------------------------------------------ */

const registry = [];
const initialised = new WeakMap();

export function register(name, selector, setup) {
  registry.push({ name, selector, setup });
}

export function initAll(root = document) {
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

export async function copyText(text) {
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
