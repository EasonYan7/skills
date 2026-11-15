import { button, el, icon, link, mark, motionQuery, setLabel } from '../shared.js';

export function mountComparison(host, { title, lead, dimensions, products }) {
  const life = new AbortController();
  const on = (node, type, fn) => node.addEventListener(type, fn, { signal: life.signal });
  const reduced = motionQuery();
  const head = el('div', 'aw-compare__intro', el('h2', '', title), el('p', '', lead));
  head.append(el('div', 'aw-compare__marks', ...products.map(product => mark(product))));

  const table = el('table', 'aw-compare__table', el('caption', 'aw-sr', title));
  const corner = el('th', 'aw-compare__dimension', '对比维度');
  corner.scope = 'col';
  const header = el('tr', '', corner);
  const thead = el('thead', '', header);
  const body = el('tbody');
  table.append(thead, body);

  function columnCell(tag, product, content) {
    const node = el(tag, '', content);
    node.dataset.product = product.id;
    return node;
  }

  products.forEach(product => {
    const th = columnCell('th', product, link({ href: product.href, label: product.label }, 'aw-compare__table-link'));
    th.scope = 'col';
    header.append(th);
  });
  for (const dimension of dimensions) {
    const name = el('th', '', dimension.label);
    name.scope = 'row';
    const row = el('tr', '', name, ...products.map(product => columnCell('td', product, product.values[dimension.key])));
    body.append(row);
  }

  const cards = products.map(product => {
    const name = link({ href: product.href, label: product.label }, 'aw-compare__card-link');
    const data = el('dl', '', ...dimensions.map(dimension => el('div', '',
      el('dt', '', dimension.label), el('dd', '', product.values[dimension.key]))));
    return el('article', 'aw-compare__card', el('h3', '', name), data);
  });
  const previous = setLabel(button(icon('previous'), 'aw-compare__control'), '上一个方案');
  const next = setLabel(button(icon('next'), 'aw-compare__control'), '下一个方案');
  const status = el('span', 'aw-compare__status');
  status.setAttribute('aria-live', 'polite');
  const controls = el('div', 'aw-compare__controls', previous, status, next);
  const track = setLabel(el('div', 'aw-compare__track', ...cards), title + '方案卡片');
  track.tabIndex = products.length > 1 ? 0 : -1;
  track.classList.toggle('aw-compare__track--multiple', products.length > 1);
  controls.hidden = products.length < 2;
  track.setAttribute('role', 'region');
  const mobile = el('div', 'aw-compare__mobile', track, controls);
  const comparison = el('section', 'aw-compare', head, el('div', 'aw-compare__frame', table), mobile);
  host.replaceChildren(comparison);

  let hover = null;
  let focused = null;
  const cells = [...table.querySelectorAll('[data-product]')];
  const getProduct = target => target?.closest?.('[data-product]')?.dataset.product ?? null;
  function updateTable() {
    cells.forEach(cell => cell.classList.toggle('aw-compare__cell--active', cell.dataset.product === (focused || hover)));
  }
  on(table, 'pointerover', event => { hover = getProduct(event.target); updateTable(); });
  on(table, 'pointerleave', () => { hover = null; updateTable(); });
  on(table, 'focusin', event => { focused = getProduct(event.target); updateTable(); });
  on(table, 'focusout', event => { focused = getProduct(event.relatedTarget); updateTable(); });

  let index = 0;
  let requested = null;
  let timer = 0;
  function readTrack() {
    if (!track.clientWidth || !cards.length) return;
    const offset = track.scrollLeft;
    const last = track.scrollWidth - track.clientWidth;
    if (offset >= last - 2 && last > 0) index = cards.length - 1;
    else {
      let nearest = Infinity;
      cards.forEach((card, position) => {
        const distance = Math.abs(offset - card.offsetLeft);
        if (distance < nearest) { nearest = distance; index = position; }
      });
    }
    const count = `${index + 1} / ${cards.length}`;
    if (status.textContent !== count) status.textContent = count;
    previous.setAttribute('aria-disabled', String(index <= 0));
    next.setAttribute('aria-disabled', String(index >= cards.length - 1));
  }
  function move(destination) {
    if (destination < 0 || destination >= cards.length) return;
    requested = destination;
    track.scrollTo({ left: cards[destination].offsetLeft, behavior: reduced.matches ? 'instant' : 'smooth' });
    clearTimeout(timer);
    timer = setTimeout(() => { requested = null; readTrack(); }, 250);
  }
  on(previous, 'click', () => move((requested ?? index) - 1));
  on(next, 'click', () => move((requested ?? index) + 1));
  on(track, 'scroll', () => {
    clearTimeout(timer);
    timer = setTimeout(() => { requested = null; readTrack(); }, 110);
  });
  on(track, 'keydown', event => {
    if (event.target !== track) return;
    const destinations = { ArrowLeft: (requested ?? index) - 1, ArrowRight: (requested ?? index) + 1, Home: 0, End: cards.length - 1 };
    if (!(event.key in destinations)) return;
    event.preventDefault();
    move(destinations[event.key]);
  });
  on(window, 'resize', readTrack);
  readTrack();

  return { destroy() { life.abort(); clearTimeout(timer); comparison.remove(); } };
}
