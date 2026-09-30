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
import { register, initAll } from './core.js';
import { initGallery } from './gallery.js';
import { openLightbox } from './lightbox.js';
import { initTabs } from './tabs.js';
import { toast } from './toast.js';
import { initToggle, initShare, initCopy, initPrint, initDialogTrigger, initViewSwitch } from './actions.js';
import { getPreferences, setPreferences, resolvedMode, bindThemeControl, listenForPreferenceChanges } from './theme.js';

export const version = '0.1.0';

register('gallery', '[data-os-gallery]', initGallery);
register('tabs', '[data-os-tabs]', initTabs);
register('toggle', '[data-os-toggle]', initToggle);
register('share', '[data-os-share]', initShare);
register('copy', '[data-os-copy]', initCopy);
register('print', '[data-os-print]', initPrint);
register('dialog', '[data-os-dialog]', initDialogTrigger);
register('view', '[data-os-view]', initViewSwitch);
register('theme-control', '[data-os-theme-control]', bindThemeControl);

export function init(root = document) {
  initAll(root);
}

export const theme = { get: getPreferences, set: setPreferences, resolvedMode };

export { toast, openLightbox, register };

function start() {
  document.documentElement.classList.add('os-js');
  listenForPreferenceChanges();
  init(document);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
}
