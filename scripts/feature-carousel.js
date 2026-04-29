import { $$, byId } from './dom-utils.js';

const FEATURE_COPY_LEAVE_STAGGER_MS = 72;
const FEATURE_COPY_SEG_LEAVE_MS = 400;
const FEATURE_COPY_LEAVE_PAD_MS = 48;
const FEATURE_COPY_ENTER_ANIM_MS = 320;

const state = {
  currentFeature: 0,
  featureCopyAnimationTimer: null,
  featureCopyRunId: 0
};

let features = [];

function renderFeatureTabs() {
  const tabs = byId('feature-tabs');
  if (!tabs || !features.length) {
    return;
  }

  tabs.replaceChildren();
  features.forEach((feature, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'feature-tab';
    button.dataset.feature = String(index);
    button.setAttribute('aria-pressed', 'false');

    const icon = document.createElement('img');
    icon.src = feature.iconPath;
    icon.alt = '';
    icon.setAttribute('aria-hidden', 'true');
    button.appendChild(icon);

    const label = document.createElement('span');
    label.textContent = feature.title;
    button.appendChild(label);

    tabs.appendChild(button);
  });
}

function buildFeatureCarousel() {
  const track = byId('feature-carousel-track');
  if (!track || !features.length) {
    return;
  }

  track.replaceChildren();
  features.forEach(feature => {
    const slide = document.createElement('div');
    slide.className = 'feature-carousel-slide';

    const img = document.createElement('img');
    img.src = feature.imagePath;
    img.alt = feature.title;
    slide.appendChild(img);

    track.appendChild(slide);
  });
}

function setFeatureCopyText(titleEl, descEl, titleText, descText) {
  titleEl.textContent = titleText;
  descEl.textContent = descText;
}

function animateFeatureCopy(feature, immediate = false, onCopySwap = () => {}) {
  const copy = byId('feature-copy');
  const title = byId('feature-title');
  const desc = byId('feature-desc');

  if (!copy || !title || !desc || !feature) {
    return;
  }

  if (state.featureCopyAnimationTimer) {
    clearTimeout(state.featureCopyAnimationTimer);
    state.featureCopyAnimationTimer = null;
  }

  if (immediate) {
    copy.classList.remove('is-leaving', 'is-entering', 'is-leaving-blocks');
    setFeatureCopyText(title, desc, feature.title, feature.desc);
    onCopySwap(true);
    return;
  }

  copy.classList.remove('is-entering', 'is-leaving', 'is-leaving-blocks');
  state.featureCopyRunId += 1;
  const runId = state.featureCopyRunId;

  void title.offsetHeight;
  copy.classList.add('is-leaving-blocks');

  const leaveEnd =
    FEATURE_COPY_SEG_LEAVE_MS + FEATURE_COPY_LEAVE_STAGGER_MS + FEATURE_COPY_LEAVE_PAD_MS;

  state.featureCopyAnimationTimer = setTimeout(() => {
    if (runId !== state.featureCopyRunId) {
      return;
    }

    copy.classList.remove('is-leaving-blocks');
    setFeatureCopyText(title, desc, feature.title, feature.desc);
    onCopySwap(false);
    copy.classList.remove('is-entering');
    requestAnimationFrame(() => {
      if (runId !== state.featureCopyRunId) {
        return;
      }
      copy.classList.add('is-entering');
      requestAnimationFrame(() => {
        state.featureCopyAnimationTimer = setTimeout(() => {
          state.featureCopyAnimationTimer = null;
          if (runId === state.featureCopyRunId) {
            copy.classList.remove('is-entering');
          }
        }, FEATURE_COPY_ENTER_ANIM_MS);
      });
    });
  }, leaveEnd);
}

function updateFeatureCarousel(index, immediate = false) {
  const track = byId('feature-carousel-track');
  if (!track) {
    return;
  }

  if (immediate) {
    const previousTransition = track.style.transition;
    track.style.transition = 'none';
    track.style.transform = `translateX(-${index * 100}%)`;
    void track.offsetHeight;
    track.style.transition = previousTransition || '';
    return;
  }

  track.style.transform = `translateX(-${index * 100}%)`;
}

function updateFeature(index, options = {}) {
  if (!features[index]) {
    return;
  }

  state.currentFeature = index;
  animateFeatureCopy(features[index], options.immediate, immediateSwap => {
    updateFeatureCarousel(index, immediateSwap);
  });

  $$('.feature-tab').forEach((tab, tabIndex) => {
    const isActive = tabIndex === index;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-pressed', String(isActive));
  });

  byId('prev-btn')?.classList.toggle('disabled', index === 0);
  byId('next-btn')?.classList.toggle('disabled', index === features.length - 1);
}

function bindFeatureControls() {
  $$('.feature-tab').forEach((tab, index) => {
    tab.addEventListener('click', () => updateFeature(index));
  });

  byId('prev-btn')?.addEventListener('click', () => {
    if (state.currentFeature > 0) {
      updateFeature(state.currentFeature - 1);
    }
  });

  byId('next-btn')?.addEventListener('click', () => {
    if (state.currentFeature < features.length - 1) {
      updateFeature(state.currentFeature + 1);
    }
  });
}

export function initFeatureCarousel(featureList) {
  features = Array.isArray(featureList) ? featureList : [];
  renderFeatureTabs();
  buildFeatureCarousel();
  bindFeatureControls();
  if (features.length) {
    updateFeature(0, { immediate: true });
  }
}
