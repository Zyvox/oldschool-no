/**
 * Gallery — enhances .os-gallery[data-os-gallery]:
 *  · previous/next buttons and a full-screen button on the picture
 *  · thumbnails move the picture instead of jumping the page
 *  · arrow keys on the focused picture, counter kept in sync while swiping
 *  · [data-os-gallery-open] and clicking the picture open the lightbox
 */
import { $, $$, icon, t, reducedMotion } from './core.js';
import { openLightbox } from './lightbox.js';

export function initGallery(root) {
  const track = $('.os-gallery__track', root);
  const stage = $('.os-gallery__stage', root);
  if (!track || !stage) return;

  const slides = Array.from(track.children);
  const thumbs = $$('.os-gallery__thumb', root);
  const counters = $$('[data-os-gallery-current]', root);
  const total = slides.length;
  let index = 0;

  const items = slides.map((slide) => {
    const img = $('img', slide);
    return {
      src: slide.dataset.full || img?.currentSrc || img?.src,
      thumb: img?.currentSrc || img?.src,
      alt: img?.alt ?? '',
      caption: slide.dataset.caption ?? img?.alt ?? '',
    };
  });

  const makeButton = (className, label, iconName) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.setAttribute('aria-label', label);
    button.innerHTML = icon(iconName);
    stage.append(button);
    return button;
  };

  const prev = total > 1 ? makeButton('os-gallery__nav os-gallery__nav--prev', t('prev'), 'chevron-left') : null;
  const next = total > 1 ? makeButton('os-gallery__nav os-gallery__nav--next', t('next'), 'chevron-right') : null;
  makeButton('os-gallery__expand', t('open'), 'maximize-2').addEventListener('click', () => open());

  track.tabIndex = 0;
  track.setAttribute('aria-label', root.getAttribute('aria-label') ?? t('gallery'));
  slides.forEach((slide, i) => {
    slide.setAttribute('aria-label', t('imageOf', { i: i + 1, n: total }));
  });

  function setIndex(i) {
    index = i;
    counters.forEach((el) => { el.textContent = String(i + 1); });
    thumbs.forEach((thumb, j) => thumb.setAttribute('aria-current', String(j === i)));
    if (prev) prev.disabled = i === 0;
    if (next) next.disabled = i === total - 1;
  }

  function go(i) {
    const target = Math.max(0, Math.min(i, total - 1));
    track.scrollTo({ left: target * track.clientWidth, behavior: reducedMotion() ? 'auto' : 'smooth' });
    setIndex(target);
  }

  function open(i = index) {
    openLightbox(items, i, { onChange: (j) => { if (j !== index) go(j); } });
  }

  let frame = 0;
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const i = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
      if (i !== index && i >= 0 && i < total) setIndex(i);
    });
  }, { passive: true });

  prev?.addEventListener('click', () => go(index - 1));
  next?.addEventListener('click', () => go(index + 1));

  thumbs.forEach((thumb, i) => {
    thumb.addEventListener('click', (event) => {
      event.preventDefault();
      if (thumb.hasAttribute('data-more')) open(i);
      else go(i);
    });
  });

  track.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); go(index - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); go(index + 1); }
    if (event.key === 'Enter') { event.preventDefault(); open(); }
  });

  slides.forEach((slide, i) => {
    slide.addEventListener('click', (event) => {
      event.preventDefault();
      open(i);
    });
  });

  $$('[data-os-gallery-open]', root).forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      open();
    });
  });

  setIndex(0);
}
