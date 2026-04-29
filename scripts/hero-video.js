import { byId } from './dom-utils.js';

const AUTO_OPEN_DELAY_MS = 3000;
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'video[controls]',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

let previousFocusedElement = null;

function getFocusableElements(container) {
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(element => {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden';
  });
}

function openHeroIntroVideoModal() {
  const modal = byId('hero-video-modal');
  const video = byId('hero-intro-video');
  if (!modal) {
    return;
  }

  previousFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  byId('hero-video-modal-close')?.focus();

  if (!video) {
    return;
  }

  const playWithAutoplayPolicyFallback = () => {
    video.muted = false;
    const attempt = video.play();
    if (attempt === undefined) {
      return;
    }
    return attempt
      .catch(() => {
        video.muted = true;
        return video.play();
      })
      .catch(() => {});
  };

  requestAnimationFrame(() => {
    requestAnimationFrame(playWithAutoplayPolicyFallback);
  });
}

function closeHeroIntroVideoModal() {
  const modal = byId('hero-video-modal');
  const video = byId('hero-intro-video');
  if (!modal) {
    return;
  }

  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  if (video) {
    video.pause();
    video.currentTime = 0;
    video.muted = false;
  }

  if (previousFocusedElement && document.contains(previousFocusedElement)) {
    previousFocusedElement.focus();
  }
  previousFocusedElement = null;
}

function trapFocus(event, modal) {
  const focusableElements = getFocusableElements(modal);
  if (!focusableElements.length) {
    event.preventDefault();
    return;
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  const activeElement = document.activeElement;

  if (event.shiftKey && activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
    return;
  }

  if (!event.shiftKey && activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
}

export function initHeroVideoModal() {
  const heroVideoModal = byId('hero-video-modal');

  byId('hero-platform-intro-btn')?.addEventListener('click', openHeroIntroVideoModal);
  byId('hero-video-modal-close')?.addEventListener('click', closeHeroIntroVideoModal);

  heroVideoModal?.addEventListener('click', event => {
    if (event.target === heroVideoModal) {
      closeHeroIntroVideoModal();
    }
  });

  document.addEventListener('keydown', event => {
    if (!heroVideoModal?.classList.contains('show')) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopImmediatePropagation();
      closeHeroIntroVideoModal();
      return;
    }

    if (event.key === 'Tab') {
      trapFocus(event, heroVideoModal);
    }
  });

  setTimeout(() => {
    if (heroVideoModal && !heroVideoModal.classList.contains('show')) {
      openHeroIntroVideoModal();
    }
  }, AUTO_OPEN_DELAY_MS);
}
