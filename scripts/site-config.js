import { byId, setText, setHref } from './dom-utils.js';

export function applySiteConfig(config) {
  setText('[data-config="phone"]', config.phoneDisplay || '');
  setText('[data-config="phone-compact"]', config.phoneCompact || config.phoneDisplay || '');
  setHref('[data-config-link="register"]', config.registerUrl);
  setHref('[data-config-link="login"]', config.loginUrl);
  setHref('[data-config-link="official-site"]', config.officialSiteUrl);
  setHref('[data-config-link="company-site"]', config.companySiteUrl);
}

export function bindHeroIntroVideoSource(config) {
  const video = byId('hero-intro-video');
  if (video && config.heroIntroVideoSrc) {
    video.src = config.heroIntroVideoSrc;
  }
}
