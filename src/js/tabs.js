/**
 * Tabs — WAI-ARIA tabs with automatic activation, arrow keys, Home/End.
 * Markup: see src/css/components/tabs.css.
 */
import { $, $$, uid } from './core.js';

export function initTabs(root) {
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
