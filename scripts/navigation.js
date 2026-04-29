import { $, $$ } from './dom-utils.js';

const HEADER_SCROLLED_THRESHOLD = 50;
const ANCHOR_SCROLL_GAP_PX = 12;

function getAnchorScrollOffset() {
  const header = $('.header');
  if (!header) {
    return ANCHOR_SCROLL_GAP_PX;
  }

  return Math.ceil(header.getBoundingClientRect().height) + ANCHOR_SCROLL_GAP_PX;
}

export function bindNavigation() {
  let scrollTicking = false;
  window.addEventListener(
    'scroll',
    () => {
      if (scrollTicking) {
        return;
      }
      scrollTicking = true;
      requestAnimationFrame(() => {
        $('.header')?.classList.toggle('scrolled', window.scrollY > HEADER_SCROLLED_THRESHOLD);
        scrollTicking = false;
      });
    },
    { passive: true }
  );

  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', event => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') {
        return;
      }
      const target = document.querySelector(href);
      if (!target) {
        return;
      }

      event.preventDefault();
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - getAnchorScrollOffset(),
        behavior: 'smooth'
      });
    });
  });
}
