/**
 * Toasts — short confirmations in a polite live region.
 *
 *   Oldschool.toast('Annonsen er lagret');
 *   Oldschool.toast('Kunne ikke kopiere', { icon: 'circle-alert' });
 */
import { icon } from './core.js';

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

export function toast(message, { icon: iconName = 'circle-check', duration = 3200 } = {}) {
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
