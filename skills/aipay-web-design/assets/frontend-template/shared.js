/** Small safe DOM primitives shared by the four independent modules. */
export function el(tag, className, ...children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.append(...children.filter(child => child != null));
  return node;
}

export function link({ href, label }, className) {
  const node = el('a', className, label);
  node.href = href;
  return node;
}

export function button(label, className) {
  const node = el('button', className, label);
  node.type = 'button';
  return node;
}

const paths = {
  bolt: 'M13 2 4 14h7l-1 8 10-12h-7l1-8Z',
  calendar: 'M6 3v4m12-4v4M4 9h16M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm3 8h2m4 0h2m-8 4h2',
  fork: 'M6 3v10a5 5 0 0 0 5 5h8m-4-4 4 4-4 4M6 13a5 5 0 0 1 5-5h8m-4-4 4 4-4 4',
  brand: 'M3 18 8 6h4L7 18H3Zm8 0 5-12h4l-5 12h-4Zm7 0 2-5h2v5h-4Z',
  chevron: 'm6 9 6 6 6-6',
  next: 'm9 6 6 6-6 6',
  previous: 'm15 6-6 6 6 6',
  menu: 'M5 8h14M5 16h14',
  close: 'm6 6 12 12M18 6 6 18',
};

export function icon(name, className = 'aw-icon') {
  const namespace = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(namespace, 'svg');
  svg.setAttribute('class', className);
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const path = document.createElementNS(namespace, 'path');
  path.setAttribute('d', paths[name] ?? paths.brand);
  if (name === 'brand') {
    path.setAttribute('fill', 'currentColor');
  } else {
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-width', '1.8');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
  }
  svg.append(path);
  return svg;
}

/** Product marks use the same palette in all four components. */
export function mark(product, className = '') {
  const node = el('span', `aw-mark ${className}`.trim(), icon(product.icon));
  node.style.setProperty('--aw-accent', product.color);
  node.style.setProperty('--aw-tint', product.tint);
  node.setAttribute('aria-hidden', 'true');
  return node;
}

export function badge(product, className = '') {
  const node = el('span', `aw-badge ${className}`.trim(), mark(product), product.label);
  tint(node, product);
  return node;
}

export function tint(node, product) {
  node.style.setProperty('--aw-accent', product.color);
  node.style.setProperty('--aw-tint', product.tint);
  node.style.setProperty('--aw-accent-ink', product.ink ?? '#151515');
}

export function motionQuery() {
  return matchMedia('(prefers-reduced-motion: reduce)');
}

export function setLabel(node, label) {
  node.setAttribute('aria-label', label);
  return node;
}
