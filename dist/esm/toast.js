/**
 * Toasts and notifications, in polite live regions.
 *
 *   Oldschool.toast('Lagret!');            the yellow note, top centre, goes away by itself
 *   Oldschool.notify({                     the small window in the bottom corner
 *     title: 'Jobben er ferdig',
 *     message: '12 nye annonser i «Hytte i Valdres».',
 *     tone: 'success',                     info (default) · success · warning · danger
 *     actions: [{ label: 'Se treffene', href: '/treff' }, { label: 'Angre', onClick }],
 *     duration: 6000,                      ms; 0 = until closed. Default 6 s (centre: 3 s), or 0 with actions
 *     placement: 'corner',                 or 'center': mid-screen over a dimmed page (a popover)
 *   });                                    → { element, close() }
 *
 * Server-rendered .os-notification elements get the same behaviour:
 * [data-os-dismiss] closes, data-os-autohide="ms" hides after a while, and a
 * centred one with the popover attribute is opened on load.
 * Timers pause while the pointer or focus is inside; Escape closes.
 */
import { t } from './core.js';

const regions = {};
const MAX_NOTIFICATIONS = 4;

/** A live region, created once. New regions speak a frame after they are
 *  added, so screen readers have registered them; messages keep their order. */
function region(kind, then) {
  if (!regions[kind]?.el.isConnected) {
    const el = document.querySelector(`.os-toaster${kind === 'corner' ? '.os-toaster--corner' : ':not(.os-toaster--corner)'}`)
      ?? Object.assign(document.createElement('div'), { className: kind === 'corner' ? 'os-toaster os-toaster--corner' : 'os-toaster' });
    el.setAttribute('aria-live', 'polite');
    const fresh = !el.isConnected;
    if (fresh) document.body.append(el);
    regions[kind] = { el, ready: fresh ? new Promise((resolve) => requestAnimationFrame(resolve)) : Promise.resolve() };
  }
  const { el, ready } = regions[kind];
  ready.then(() => then(el));
}

function hide(el) {
  if (el.dataset.state === 'hidden') return;
  el.dataset.state = 'hidden';
  const remove = () => el.remove();
  el.addEventListener('transitionend', remove, { once: true });
  window.setTimeout(remove, 400);
}

export function toast(message, { duration = 3200 } = {}) {
  const el = document.createElement('div');
  el.className = 'os-toast';
  el.textContent = message;
  region('top', (host) => host.append(el));
  window.setTimeout(() => hide(el), duration);
  return el;
}

/** Close box, Escape, and a timer that pauses on hover and focus. */
export function initNotification(el) {
  if (el.dataset.osReady) return;
  el.dataset.osReady = '';
  const close = () => {
    if (el.contains(document.activeElement)) document.activeElement.blur();
    if (el.matches(':popover-open')) el.hidePopover();
    else hide(el);
  };
  if (el.hasAttribute('popover')) {
    // Light dismiss (Escape, click outside) closes it too; either way it is gone.
    el.addEventListener('toggle', (event) => {
      if (event.newState === 'closed') el.remove();
    });
    if (el.isConnected && !el.matches(':popover-open')) el.showPopover();
  }
  el.addEventListener('click', (event) => {
    if (event.target.closest('[data-os-dismiss]')) close();
  });
  el.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
  const duration = Number(el.dataset.osAutohide || 0);
  if (duration > 0) {
    let left = duration;
    let started = Date.now();
    let timer = window.setTimeout(close, left);
    const pause = () => {
      window.clearTimeout(timer);
      timer = null;
      left -= Date.now() - started;
    };
    const resume = () => {
      if (timer || el.matches(':hover, :focus-within')) return;
      started = Date.now();
      timer = window.setTimeout(close, Math.max(left, 1500));
    };
    el.addEventListener('pointerenter', pause);
    el.addEventListener('focusin', () => timer && pause());
    el.addEventListener('pointerleave', resume);
    el.addEventListener('focusout', () => requestAnimationFrame(resume));
  }
  return { element: el, close };
}

export function notify({ title, message = '', tone = 'info', actions = [], duration, placement = 'corner' } = {}) {
  const center = placement === 'center';
  const el = document.createElement('div');
  el.className = `os-notification${tone === 'info' ? '' : ' os-notification--' + tone}${center ? ' os-notification--center' : ''}`;
  el.setAttribute('role', tone === 'danger' ? 'alert' : 'status');
  if (center) el.setAttribute('popover', 'auto');
  el.dataset.osAutohide = String(duration ?? (actions.length ? 0 : center ? 3000 : 6000));

  const bar = document.createElement('div');
  bar.className = 'os-notification__bar';
  const heading = Object.assign(document.createElement('p'), { className: 'os-notification__title', textContent: title ?? t(tone) });
  const closeBox = Object.assign(document.createElement('button'), { className: 'os-notification__close', type: 'button', textContent: '×' });
  closeBox.setAttribute('aria-label', t('close'));
  closeBox.dataset.osDismiss = '';
  bar.append(heading, closeBox);

  const body = document.createElement('div');
  body.className = 'os-notification__body';
  if (message) body.append(Object.assign(document.createElement('p'), { textContent: message }));
  if (actions.length) {
    const row = Object.assign(document.createElement('p'), { className: 'os-notification__actions' });
    for (const action of actions) {
      const item = action.href
        ? Object.assign(document.createElement('a'), { href: action.href, textContent: action.label })
        : Object.assign(document.createElement('button'), { type: 'button', className: 'os-button os-button--sm', textContent: action.label });
      if (action.onClick) item.addEventListener('click', (event) => action.onClick(event, handle));
      row.append(item);
    }
    body.append(row);
  }
  el.append(bar, body);

  const handle = initNotification(el);
  region('corner', (host) => {
    host.append(el);
    if (center) {
      el.showPopover();
      return;
    }
    const shown = host.querySelectorAll('.os-notification:not([data-state="hidden"], .os-notification--center)');
    for (let i = 0; i < shown.length - MAX_NOTIFICATIONS; i += 1) hide(shown[i]);
  });
  return handle;
}
