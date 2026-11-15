import { badge, button, el, icon, link, motionQuery } from '../shared.js';

export function mountHero(host, { prefix, suffix, accessibleTitle, lead, products, actions, interval = 2800 }) {
  const life = new AbortController();
  const on = (node, type, fn) => node.addEventListener(type, fn, { signal: life.signal });
  const reduced = motionQuery();
  const slot = el('span', 'aw-hero__slot');
  const belt = el('span', 'aw-hero__belt');
  slot.append(belt);
  const entries = products.map(product => {
    const visual = badge(product);
    const node = product.href ? link({ href: product.href, label: '' }, 'aw-hero__badge') : el('span', 'aw-hero__badge');
    node.append(visual);
    belt.append(node);
    return node;
  });
  const title = el('h1', 'aw-hero__title',
    el('span', 'aw-hero__part', prefix), slot, el('span', 'aw-hero__part', suffix));
  title.setAttribute('aria-label', accessibleTitle ?? [prefix, products[0]?.label, suffix].filter(Boolean).join(' '));
  const actionGroup = el('div', 'aw-hero__actions',
    ...actions.map((item, index) => {
      const anchor = link(item, 'aw-action aw-action--' + (['primary', 'secondary', 'tertiary'][index] ?? 'tertiary'));
      if (index === 0) anchor.append(icon('next'));
      return anchor;
    }));
  const pause = button('暂停轮换', 'aw-hero__pause');
  pause.hidden = entries.length < 2 || reduced.matches;
  const hero = el('section', 'aw-hero', el('div', 'aw-hero__content aw-wrap', title, el('p', 'aw-hero__lead', lead), actionGroup, pause));
  host.replaceChildren(hero);

  let position = 0;
  let current = -1;
  let visible = !('IntersectionObserver' in window);
  let manualPause = false;
  let hovered = false;
  let timer = 0;
  let frame = 0;
  const count = entries.length;

  function paint(value) {
    if (!count) return;
    position = value;
    const active = Math.round(position) % count;
    entries.forEach((node, index) => {
      // Keep each copy on the shortest side of the circular track. A wrap
      // happens past the mask for three or more entries.
      const half = count / 2;
      const offset = ((index - position + half) % count + count) % count - half;
      const distance = Math.min(1, Math.abs(offset));
      const fade = distance * distance * (3 - 2 * distance);
      node.style.setProperty('--aw-badge-offset', offset);
      node.style.setProperty('--aw-badge-fade', fade);
      node.style.setProperty('--aw-badge-visibility', count === 2 ? 1 - fade : 1);
      if (current === active) return;
      const isActive = index === active;
      node.dataset.position = isActive ? 'current' : 'off';
      node.setAttribute('aria-hidden', String(!isActive));
      if (node.matches('a')) node.tabIndex = isActive ? 0 : -1;
    });
    current = active;
  }

  function settle() {
    cancelAnimationFrame(frame);
    frame = 0;
    if (count) paint(Math.round(position) % count);
  }

  function canRotate() {
    return count > 1 && !reduced.matches && visible && !document.hidden && !manualPause &&
      !hovered && !hero.contains(document.activeElement);
  }

  function schedule() {
    clearTimeout(timer);
    if (!frame && canRotate()) timer = setTimeout(advance, interval);
  }

  function advance() {
    if (!canRotate()) return;
    const from = Math.round(position);
    const start = performance.now();
    function tick(now) {
      const seconds = Math.max(0, (now - start) / 1000);
      // Critically damped motion moves quickly through the center, then eases
      // the incoming badge into place without overshooting.
      if (seconds >= .66) {
        frame = 0;
        paint((from + 1) % count);
        schedule();
        return;
      }
      const displacement = 15 * seconds;
      paint(from + 1 - (1 + displacement) * Math.exp(-displacement));
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
  }

  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (!visible && frame) settle();
    schedule();
  }) : null;
  observer?.observe(slot);
  on(pause, 'click', () => {
    manualPause = !manualPause;
    pause.textContent = manualPause ? '继续轮换' : '暂停轮换';
    // Focus intentionally keeps the badge still until it leaves the hero.
    schedule();
  });
  on(slot, 'pointerenter', event => { if (event.pointerType !== 'touch') { hovered = true; schedule(); } });
  on(slot, 'pointerleave', () => { hovered = false; schedule(); });
  on(hero, 'focusin', () => {
    if (frame) settle();
    schedule();
  });
  on(hero, 'focusout', () => queueMicrotask(() => { if (!life.signal.aborted) schedule(); }));
  on(document, 'visibilitychange', () => {
    if (document.hidden && frame) settle();
    schedule();
  });
  on(reduced, 'change', () => {
    pause.hidden = reduced.matches || entries.length < 2;
    if (reduced.matches) settle();
    schedule();
  });
  paint(0);
  schedule();

  return { destroy() { life.abort(); observer?.disconnect(); clearTimeout(timer); cancelAnimationFrame(frame); hero.remove(); } };
}
