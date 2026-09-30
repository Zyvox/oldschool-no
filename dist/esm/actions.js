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
import { $, $$, store, t, copyText } from './core.js';
import { toast } from './toast.js';

const PERSIST_KEY = 'os-toggles';

export function initToggle(button) {
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

export function initShare(button) {
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

export function initCopy(button) {
  button.addEventListener('click', async () => {
    const text = button.dataset.osCopy || button.textContent.trim();
    const ok = await copyText(text);
    toast(ok ? button.dataset.osCopied || t('copied') : t('copyFailed'), { icon: ok ? 'clipboard-check' : 'circle-alert' });
  });
}

export function initPrint(button) {
  button.addEventListener('click', () => window.print());
}

export function initDialogTrigger(trigger) {
  trigger.addEventListener('click', (event) => {
    const dialog = document.getElementById(trigger.dataset.osDialog);
    if (!(dialog instanceof HTMLDialogElement)) return;
    event.preventDefault();
    dialog.showModal();
  });
}

export function initViewSwitch(group) {
  const target = $(group.dataset.osView);
  if (!target) return;
  const apply = () => {
    const value = $('input:checked', group)?.value;
    target.classList.toggle('os-results--grid', value === 'grid');
  };
  $$('input', group).forEach((input) => input.addEventListener('change', apply));
  apply();
}
