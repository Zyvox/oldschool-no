/**
 * Sortable tables — <table class="os-table" data-os-sort>.
 * Header cells become buttons; aria-sort reflects the state. Numbers
 * (including "7 500,-", "12,5 %" and dates written dd.mm.yyyy) sort
 * numerically. Add data-os-nosort to a <th> to leave it alone.
 */
import { $, $$ } from './core.js';

function sortValue(cell) {
  const raw = (cell.dataset.sortValue ?? cell.textContent).trim();
  const date = raw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (date) return Number(`${date[3]}${date[2].padStart(2, '0')}${date[1].padStart(2, '0')}`);
  const numeric = raw.replace(/[\s ]/g, '').replace(/,-$/, '').replace(/kr$/i, '').replace('−', '-').replace(',', '.').replace(/%$/, '');
  return numeric !== '' && !Number.isNaN(Number(numeric)) ? Number(numeric) : raw.toLocaleLowerCase('nb');
}

export function initSortableTable(table) {
  const head = $('thead tr', table);
  const body = $('tbody', table);
  if (!head || !body) return;
  const headers = $$('th', head);

  headers.forEach((th, column) => {
    if (th.hasAttribute('data-os-nosort')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'os-table__sort';
    button.append(...th.childNodes);
    th.append(button);

    button.addEventListener('click', () => {
      const ascending = th.getAttribute('aria-sort') !== 'ascending';
      headers.forEach((other) => other.removeAttribute('aria-sort'));
      th.setAttribute('aria-sort', ascending ? 'ascending' : 'descending');
      const rows = $$('tr', body);
      rows.sort((a, b) => {
        const x = sortValue(a.cells[column]);
        const y = sortValue(b.cells[column]);
        const result = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'nb');
        return ascending ? result : -result;
      });
      body.append(...rows);
    });
  });
}

/**
 * Stacked tables — <table class="os-table os-table--stack">. Copies each
 * column header's text into data-label on cells that have none, so the
 * stacked (narrow) layout can label every value.
 */
export function initStackedTable(table) {
  const headers = $$('thead th', table).map((th) => th.textContent.trim());
  for (const row of $$('tbody tr', table)) {
    Array.from(row.cells).forEach((cell, i) => {
      if (!cell.hasAttribute('data-label') && headers[i]) cell.dataset.label = headers[i];
    });
  }
}
