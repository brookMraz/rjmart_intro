import { $$ } from './dom-utils.js';

export function bindSupplierReveal() {
  const supplierRows = $$('#supplier-section .supplier-brand-row');
  if (!supplierRows.length || !('IntersectionObserver' in window)) {
    return;
  }

  supplierRows.forEach(row => row.classList.add('supplier-brand-row--scroll-reveal'));

  const rowObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        entry.target.classList.toggle('is-row-visible', entry.isIntersecting);
      });
    },
    { threshold: 0, rootMargin: '0px' }
  );

  supplierRows.forEach(row => rowObserver.observe(row));
}
