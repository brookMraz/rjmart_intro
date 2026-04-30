import { byId } from './dom-utils.js';
import { api } from './request.js?v=202604304';

function appendDomain(domains, domain) {
  if (domain && !domains.includes(domain)) {
    domains.push(domain);
  }
}

function getFallbackFooterDomain(config) {
  const fallbackDomains = config.websiteBottomConfigFallbackDomains || {};
  return window.location.hostname.endsWith('.rjmart.cn')
    ? fallbackDomains.production
    : fallbackDomains.test;
}

function resolveFooterDomains(config) {
  const domains = [];
  appendDomain(domains, config.websiteBottomConfigDomain);
  appendDomain(domains, window.location.hostname);
  appendDomain(domains, getFallbackFooterDomain(config));

  const origin = window.location.origin;
  if (!domains.length) {
    appendDomain(domains, origin === 'null' ? window.location.href : origin);
  }

  return domains;
}

async function fetchWebsiteBottomConfig(config) {
  if (!config.websiteBottomConfigUrl) {
    return null;
  }

  const domains = resolveFooterDomains(config);
  let lastError = null;
  for (const domain of domains) {
    try {
      const response = await api.post(config.websiteBottomConfigUrl, { domain }, { silent: true });
      if (isValidWebsiteBottomConfig(response)) {
        return response;
      }
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    throw lastError;
  }

  return null;
}

function getWebsiteBottomRows(response) {
  const rows = response?.sortBottoms?.[0]?.rowBottoms;
  return Array.isArray(rows) ? rows : [];
}

function isValidWebsiteBottomConfig(response) {
  return response?.websiteStatus === 1 && getWebsiteBottomRows(response).length > 0;
}

function createFooterBottomNode(bottom) {
  const text = bottom?.displayNameCn || bottom?.displayNameEn || bottom?.name || '';
  if (!text.trim()) {
    return null;
  }

  const logoUrl = bottom.logoUrl && bottom.logoUrl.trim();
  const attachment = bottom.attachment && bottom.attachment.trim();
  const node = attachment && bottom.clickType !== 1 ? document.createElement('a') : document.createElement('span');

  node.className = 'footer-bottom-item';
  node.textContent = text;
  if (node.tagName === 'A') {
    node.href = attachment;
    node.target = '_blank';
    node.rel = 'noopener noreferrer';
  }

  if (logoUrl) {
    const img = document.createElement('img');
    img.referrerPolicy = 'no-referrer';
    img.src = logoUrl;
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    node.prepend(img);
  }

  return node;
}

function applyWebsiteBottomConfig(response) {
  const rows = getWebsiteBottomRows(response);
  const container = byId('footer-bottom-config');
  if (!container || !rows.length) {
    return false;
  }

  const fragment = document.createDocumentFragment();
  rows.forEach(row => {
    const items = Array.isArray(row.columnBottoms)
      ? row.columnBottoms
          .slice()
          .sort((left, right) => (left.column || 0) - (right.column || 0))
          .map(item => createFooterBottomNode(item.bottom))
          .filter(Boolean)
      : [];

    if (!items.length) {
      return;
    }

    const rowNode = document.createElement('div');
    rowNode.className = 'footer-bottom-row';
    items.forEach((item, index) => {
      if (index > 0) {
        const divider = document.createElement('span');
        divider.className = 'footer-divider';
        divider.textContent = '|';
        rowNode.appendChild(divider);
      }
      rowNode.appendChild(item);
    });
    fragment.appendChild(rowNode);
  });

  if (!fragment.children.length) {
    return false;
  }

  container.replaceChildren(fragment);
  return true;
}

export async function loadWebsiteBottomConfig(config) {
  try {
    const response = await fetchWebsiteBottomConfig(config);
    if (!response) {
      return;
    }
    applyWebsiteBottomConfig(response);
  } catch (error) {
    console.warn('Failed to load website bottom config, using static footer fallback.', error);
  }
}
