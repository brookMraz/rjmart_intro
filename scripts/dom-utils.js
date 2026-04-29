export const $ = selector => document.querySelector(selector);
export const $$ = selector => Array.from(document.querySelectorAll(selector));
export const byId = id => document.getElementById(id);

export function setText(selector, value) {
  $$(selector).forEach(node => {
    node.textContent = value;
  });
}

export function setHref(selector, value) {
  if (!value) {
    return;
  }
  $$(selector).forEach(node => {
    node.href = value;
  });
}
