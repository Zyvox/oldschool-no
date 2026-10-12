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
import { $ } from './core.js';

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

export function initMenu(menu) {
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
