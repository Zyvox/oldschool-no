/**
 * Theme, mode, density and width preferences.
 *
 *   <html data-theme="retro" data-mode="dark" data-density="compact" data-width="wide">
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
import { $$, store } from './core.js';

const KEY = 'os-prefs';
const DEFAULTS = { theme: 'standard', mode: 'auto', density: 'standard', width: 'classic' };
const ATTRS = { theme: 'data-theme', mode: 'data-mode', density: 'data-density', width: 'data-width' };

function root() {
  return document.documentElement;
}

export function getPreferences() {
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

export function setPreferences(partial) {
  if (root().hasAttribute('data-os-lock')) return getPreferences();
  const next = { ...store.get(KEY, {}), ...partial };
  store.set(KEY, next);
  apply(partial);
  return getPreferences();
}

/** The resolved mode right now: 'light' or 'dark'. */
export function resolvedMode() {
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

export function bindThemeControl(control) {
  const key = control.dataset.osThemeControl;
  if (!(key in ATTRS)) return;
  control.addEventListener('change', (event) => {
    const value = event.target.value;
    if (value) setPreferences({ [key]: value });
  });
  syncControls();
}

let listening = false;
export function listenForPreferenceChanges() {
  if (listening) return;
  listening = true;
  window.addEventListener('storage', (event) => {
    if (event.key !== KEY || root().hasAttribute('data-os-lock')) return;
    apply({ ...DEFAULTS, ...store.get(KEY, {}) });
  });
}
