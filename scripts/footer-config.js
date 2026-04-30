import { byId } from './dom-utils.js';
import { api } from './request.js?v=202604303';

function resolveFooterDomain(config) {
  if (config.websiteBottomConfigDomain) {
    return config.websiteBottomConfigDomain;
  }

  const origin = window.location.origin;
  return origin === 'null' ? window.location.href : origin;
}

async function fetchWebsiteBottomConfig(config) {
  if (!config.websiteBottomConfigUrl) {
    return null;
  }

  const domain = resolveFooterDomain(config);
  return api.post(config.websiteBottomConfigUrl, { domain }, { silent: true });
}

function getWebsiteBottomRows(response) {
  const rows = response?.sortBottoms?.[0]?.rowBottoms;
  return Array.isArray(rows) ? rows : [];
}

function hasRequiredFooterLegalContent(fragment) {
  const text = fragment.textContent || '';
  return [
    'Copyright',
    'ICP备',
    '公网安备',
    '增值电信业务许可证',
    '互联网诚信',
    '药品信息服务资格证书',
    '备案编号'
  ].every(token => text.includes(token));
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

  if (!fragment.children.length || !hasRequiredFooterLegalContent(fragment)) {
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
