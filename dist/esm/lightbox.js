/**
 * Lightbox — full-screen image viewer on a native <dialog>.
 *
 *   Oldschool.openLightbox([{ src, alt, caption }], startIndex);
 *
 * Arrow keys and swipes move between images, Escape closes, and focus returns
 * to where it was when the viewer opened.
 */
import { icon, t } from './core.js';

export function openLightbox(items, start = 0, { onChange } = {}) {
  if (!items.length) return null;
  let index = Math.max(0, Math.min(start, items.length - 1));

  const dialog = document.createElement('dialog');
  dialog.className = 'os-lightbox';
  dialog.setAttribute('aria-label', t('gallery'));
  dialog.innerHTML = `
    <div class="os-lightbox__bar">
      <span class="os-lightbox__count" aria-live="polite"></span>
      <span class="os-lightbox__caption"></span>
      <button type="button" class="os-lightbox__button" data-action="close" aria-label="${t('close')}">${icon('x')}</button>
    </div>
    <div class="os-lightbox__stage">
      <img alt="">
      <button type="button" class="os-lightbox__button os-lightbox__prev" data-action="prev" aria-label="${t('prev')}">${icon('chevron-left')}</button>
      <button type="button" class="os-lightbox__button os-lightbox__next" data-action="next" aria-label="${t('next')}">${icon('chevron-right')}</button>
    </div>
    <div class="os-lightbox__thumbs"></div>`;

  const img = dialog.querySelector('.os-lightbox__stage img');
  const count = dialog.querySelector('.os-lightbox__count');
  const caption = dialog.querySelector('.os-lightbox__caption');
  const prev = dialog.querySelector('[data-action="prev"]');
  const next = dialog.querySelector('[data-action="next"]');
  const strip = dialog.querySelector('.os-lightbox__thumbs');

  const thumbs = items.map((item, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'os-lightbox__thumb';
    button.setAttribute('aria-label', t('imageOf', { i: i + 1, n: items.length }));
    button.innerHTML = '<img alt="">';
    button.querySelector('img').src = item.thumb ?? item.src;
    button.addEventListener('click', () => show(i));
    strip.append(button);
    return button;
  });

  function show(i) {
    index = (i + items.length) % items.length;
    const item = items[index];
    img.src = item.src;
    img.alt = item.alt ?? '';
    count.textContent = `${index + 1} / ${items.length}`;
    caption.textContent = item.caption ?? item.alt ?? '';
    thumbs.forEach((thumb, j) => thumb.setAttribute('aria-current', String(j === index)));
    thumbs[index].scrollIntoView({ block: 'nearest', inline: 'nearest' });
    onChange?.(index);
  }

  dialog.addEventListener('click', (event) => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'close') dialog.close();
    else if (action === 'prev') show(index - 1);
    else if (action === 'next') show(index + 1);
    else if (event.target === dialog || event.target.classList.contains('os-lightbox__stage')) dialog.close();
  });

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); show(index - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); show(index + 1); }
    if (event.key === 'Home') { event.preventDefault(); show(0); }
    if (event.key === 'End') { event.preventDefault(); show(items.length - 1); }
  });

  // Swipe
  let startX = null;
  const stage = dialog.querySelector('.os-lightbox__stage');
  stage.addEventListener('pointerdown', (event) => { startX = event.clientX; });
  stage.addEventListener('pointerup', (event) => {
    if (startX === null) return;
    const dx = event.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
  });

  dialog.addEventListener('close', () => dialog.remove());

  if (items.length < 2) {
    prev.hidden = true;
    next.hidden = true;
    strip.hidden = true;
  }

  document.body.append(dialog);
  show(index);
  dialog.showModal();
  dialog.querySelector('[data-action="close"]').focus();
  return dialog;
}
