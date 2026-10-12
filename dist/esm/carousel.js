/**
 * Carousel — enhances .os-carousel (see src/css/components/carousel.css):
 *  · previous/next buttons over the edges, disabled at the first and last picture
 *  · an "n / total" counter, kept in sync while swiping
 *  · arrow keys, Home and End on the focused track
 *  · thumbnails move the track instead of jumping the page, and mark the current one
 * Without it the track still swipes and scrolls, and thumbnails are anchor links.
 */
import { $, $$, t, reducedMotion } from './core.js';

export function initCarousel(root) {
  const track = $('.os-carousel__track', root);
  if (!track) return;
  const stage = track.parentElement;
  const slides = Array.from(track.children);
  const thumbs = $$('.os-carousel__thumb', root);
  const total = slides.length;
  let index = -1;

  slides.forEach((slide, i) => {
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    if (!slide.hasAttribute('aria-label')) slide.setAttribute('aria-label', t('pictureOf', { i: i + 1, n: total }));
  });
  if (!track.hasAttribute('tabindex')) track.tabIndex = 0;

  const button = (dir, label, glyph) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = `os-carousel__nav os-carousel__nav--${dir}`;
    el.setAttribute('aria-label', label);
    el.textContent = glyph;
    stage.append(el);
    return el;
  };
  const prev = total > 1 ? button('prev', t('prevPicture'), '‹') : null;
  const next = total > 1 ? button('next', t('nextPicture'), '›') : null;
  let count = $('.os-carousel__count', root);
  if (!count && total > 1) {
    count = document.createElement('p');
    count.className = 'os-carousel__count';
    stage.append(count);
  }
  count?.setAttribute('aria-live', 'polite');

  function setIndex(i) {
    if (i === index) return;
    index = i;
    if (count) count.textContent = `${i + 1} / ${total}`;
    thumbs.forEach((thumb, j) => {
      if (j === i) thumb.setAttribute('aria-current', 'true');
      else thumb.removeAttribute('aria-current');
    });
    if (prev) prev.disabled = i === 0;
    if (next) next.disabled = i === total - 1;
  }

  function go(i) {
    const target = Math.max(0, Math.min(i, total - 1));
    track.scrollTo({ left: slides[target].offsetLeft - track.offsetLeft, behavior: reducedMotion() ? 'auto' : 'smooth' });
    setIndex(target);
  }

  let frame = 0;
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const i = Math.round(Math.abs(track.scrollLeft) / Math.max(1, track.clientWidth));
      if (i >= 0 && i < total) setIndex(i);
    });
  }, { passive: true });

  prev?.addEventListener('click', () => go(index - 1));
  next?.addEventListener('click', () => go(index + 1));
  thumbs.forEach((thumb, i) => thumb.addEventListener('click', (event) => {
    event.preventDefault();
    go(i);
  }));

  track.addEventListener('keydown', (event) => {
    const to = { ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: total - 1 }[event.key];
    if (to === undefined) return;
    event.preventDefault();
    go(to);
  });

  setIndex(0);
}
