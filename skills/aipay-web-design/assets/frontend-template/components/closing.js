import { button, el, icon, link, motionQuery, setLabel } from '../shared.js';

let instance = 0;

const models = {
  records: ['≡'],
  trace: ['✓', '✓', '↻'],
  verify: ['✓'],
  branch: ['•', '▪', '•'],
  retry: ['↻'],
  receipt: ['≡', '✓'],
};

function model(kind) {
  const parts = models[kind] ?? models.records;
  const object = el('div', 'aw-model__object', ...parts.map(glyph => el('span', 'aw-model__part', glyph)));
  const scene = el('div', 'aw-model', object);
  scene.dataset.model = kind;
  scene.setAttribute('aria-hidden', 'true');
  return scene;
}

export function mountReliability(host, { title, lead, cards }) {
  const id = `aw-reliability-${++instance}`;
  const heading = el('h2', 'aw-reliability__title', title);
  heading.id = id;
  const tiles = cards.map(({ title: name, text, kind }) => {
    const stage = model(kind);
    const copy = el('div', 'aw-reliability__copy', el('h3', '', name), el('p', '', text));
    return el('article', 'aw-reliability__tile', stage, copy);
  });
  const grid = el('div', 'aw-reliability__grid', ...tiles);
  const section = el('section', 'aw-reliability aw-wrap', heading, el('p', 'aw-reliability__lead', lead), grid);
  section.setAttribute('aria-labelledby', id);
  host.replaceChildren(section);
  const reduced = motionQuery();
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const life = new AbortController();
  const { signal } = life;
  const visible = new Set();
  let frame = 0;
  const states = tiles.map(tile => ({ tile, x: 0, y: 0, targetX: 0, targetY: 0 }));
  const sync = () => {
    for (const { tile } of states) {
      tile.toggleAttribute('data-playing', visible.has(tile) && !reduced.matches && !document.hidden);
    }
  };
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    }
    sync();
  }, { threshold: .15 });

  let previous = 0;
  function paint(now) {
    frame = 0;
    const dt = previous ? Math.min(48, now - previous) : 16;
    previous = now;
    let settling = false;
    for (const state of states) {
      const { tile, targetX, targetY } = state;
      const speed = 1 - Math.exp(-dt / (tile.hasAttribute('data-pointing') ? 85 : 130));
      state.x += (targetX - state.x) * speed;
      state.y += (targetY - state.y) * speed;
      const pending = Math.abs(targetX - state.x) + Math.abs(targetY - state.y) > .002;
      if (!pending) {
        state.x = targetX;
        state.y = targetY;
      }
      settling ||= pending;
      tile.style.setProperty('--model-tilt-x', `${-state.y * 5}deg`);
      tile.style.setProperty('--model-tilt-y', `${state.x * 5}deg`);
      tile.style.setProperty('--model-lift', `${Math.hypot(state.x, state.y) * 25}px`);
    }
    if (settling) frame = requestAnimationFrame(paint);
    else previous = 0;
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(paint);
  }
  function reset(state) {
    state.tile.removeAttribute('data-pointing');
    state.targetX = 0;
    state.targetY = 0;
  }
  for (const state of states) {
    const { tile } = state;
    observer.observe(tile);
    tile.addEventListener('pointermove', event => {
      if (!pointer.matches || reduced.matches || event.pointerType === 'touch') return;
      // The hit area stays still while its illustration tilts.
      const { left, top, width, height } = tile.getBoundingClientRect();
      const x = (event.clientX - left) / width * 2 - 1;
      const y = (event.clientY - top) / height * 2 - 1;
      const length = Math.max(1, Math.hypot(x, y));
      state.targetX = x / length;
      state.targetY = y / length;
      tile.setAttribute('data-pointing', '');
      schedule();
    }, { passive: true, signal });
    for (const type of ['pointerleave', 'pointercancel']) {
      tile.addEventListener(type, () => { reset(state); schedule(); }, { signal });
    }
  }
  for (const query of [pointer, reduced]) {
    query.addEventListener('change', () => {
      for (const state of states) reset(state);
      sync();
      schedule();
    }, { signal });
  }
  document.addEventListener('visibilitychange', sync, { signal });
  return () => {
    observer.disconnect();
    life.abort();
    cancelAnimationFrame(frame);
    section.remove();
  };
}

export function mountClosing(host, { title, copy, actions }) {
  const heading = el('h2', '', title);
  heading.id = `aw-closing-${++instance}`;
  const controls = el('div', 'aw-closing__actions', ...actions.map((action, index) => (
    link(action, `aw-action aw-action--${index === 0 ? 'primary' : 'secondary'}`)
  )));
  const landing = el('div', 'aw-closing__landing');
  landing.setAttribute('aria-hidden', 'true');
  const section = el('section', 'aw-closing aw-wrap', landing, heading, el('p', '', copy), controls);
  section.setAttribute('aria-labelledby', heading.id);
  host.replaceChildren(section);
  return () => section.remove();
}

export function mountSupport(host, { links, markTrigger }) {
  const life = new AbortController();
  const { signal } = life;
  const trigger = button('技术支持', 'aw-support__trigger');
  const cap = el('span', 'aw-support__cap');
  cap.setAttribute('aria-hidden', 'true');
  trigger.prepend(cap);
  const heading = el('h2', '', '技术支持');
  heading.id = `aw-support-title-${++instance}`;
  const close = setLabel(button('', 'aw-support__close'), '关闭');
  close.append(icon('close'));
  const nav = setLabel(el('nav', 'aw-support__links', ...links.map(item => link(item))), '帮助入口');
  const panel = el('dialog', 'aw-support__panel',
    el('div', 'aw-support__head', heading, close),
    nav);
  panel.id = `aw-support-panel-${instance}`;
  panel.setAttribute('aria-labelledby', heading.id);
  host.replaceChildren(trigger, panel);

  const toggles = [trigger, markTrigger].filter(Boolean);
  let opener = trigger;
  let destination;
  for (const toggle of toggles) {
    toggle.setAttribute('aria-controls', panel.id);
    toggle.setAttribute('aria-haspopup', 'dialog');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', () => {
      opener = toggle;
      panel.showModal();
      toggle.setAttribute('aria-expanded', 'true');
      close.focus();
    }, { signal });
  }
  close.addEventListener('click', () => panel.close(), { signal });
  panel.addEventListener('click', event => {
    if (event.target === panel) {
      const box = panel.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right ||
        event.clientY < box.top || event.clientY > box.bottom) panel.close();
    }
  }, { signal });
  panel.addEventListener('close', () => {
    opener.setAttribute('aria-expanded', 'false');
    if (destination) {
      if (!destination.hasAttribute('tabindex')) destination.tabIndex = -1;
      destination.focus({ preventScroll: true });
      destination = null;
    } else {
      (opener.hidden ? trigger : opener).focus({ preventScroll: true });
    }
  }, { signal });
  for (const item of nav.querySelectorAll('a')) {
    item.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      destination = item.getAttribute('href').startsWith('#')
        ? document.getElementById(item.hash.slice(1))
        : null;
      panel.close();
    }, { signal });
  }
  return () => {
    life.abort();
    panel.close();
    for (const toggle of toggles) {
      toggle.removeAttribute('aria-controls');
      toggle.removeAttribute('aria-haspopup');
      toggle.removeAttribute('aria-expanded');
    }
    host.replaceChildren();
  };
}
