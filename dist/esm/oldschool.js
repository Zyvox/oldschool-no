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
import { register, initAll } from './core.js';
import { initTabs } from './tabs.js';
import { toast, notify, initNotification } from './toast.js';
import { initToggle, initShare, initCopy, initPrint, initDialogTrigger } from './actions.js';
import { initSortableTable, initStackedTable } from './sort.js';
import { initMenu } from './menu.js';
import { initCarousel } from './carousel.js';
import { getPreferences, setPreferences, resolvedMode, bindThemeControl, listenForPreferenceChanges } from './theme.js';

export const version = '0.3.0';

register('tabs', '[data-os-tabs]', initTabs);
register('toggle', '[data-os-toggle]', initToggle);
register('share', '[data-os-share]', initShare);
register('copy', '[data-os-copy]', initCopy);
register('print', '[data-os-print]', initPrint);
register('dialog', '[data-os-dialog]', initDialogTrigger);
register('sort', 'table[data-os-sort]', initSortableTable);
register('stack', 'table.os-table--stack', initStackedTable);
register('menu', '.os-menu[popover]', initMenu);
register('notification', '.os-notification', initNotification);
register('carousel', '.os-carousel', initCarousel);
register('theme-control', '[data-os-theme-control]', bindThemeControl);

export function init(root = document) {
  initAll(root);
}

export const theme = { get: getPreferences, set: setPreferences, resolvedMode };

export { toast, notify, register };

function start() {
  document.documentElement.classList.add('os-js');
  listenForPreferenceChanges();
  init(document);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
}
