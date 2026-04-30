import { applySiteConfig, bindHeroIntroVideoSource } from './site-config.js?v=202604287';
import { initFeatureCarousel } from './feature-carousel.js?v=202604302';
import { initFloatingForm } from './floating-form.js?v=202604287';
import { initHeroVideoModal } from './hero-video.js?v=202604287';
import { loadWebsiteBottomConfig } from './footer-config.js?v=202604304';
import { bindSupplierReveal } from './supplier-reveal.js?v=202604287';
import { bindNavigation } from './navigation.js?v=202604287';

document.addEventListener('DOMContentLoaded', () => {
  const config = window.siteConfig || {};
  const features = Array.isArray(window.features) ? window.features : [];

  applySiteConfig(config);
  bindHeroIntroVideoSource(config);
  initFeatureCarousel(features);
  bindSupplierReveal();
  bindNavigation();
  initFloatingForm(config);
  initHeroVideoModal();
  loadWebsiteBottomConfig(config);
});
