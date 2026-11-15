import { el, mark, icon, motionQuery, setLabel } from '../shared.js';

const clamp = (value) => Math.max(0, Math.min(1, value));
const ease = (value) => clamp(value) ** 2 * (3 - 2 * clamp(value));

function watchScroll(bounds, update) {
  const life = new AbortController();
  const options = { passive: true, signal: life.signal };
  const reduced = motionQuery();
  let frame;
  function paint() {
    frame = 0;
    const height = window.innerHeight;
    const box = bounds.getBoundingClientRect();
    update(box, height, reduced.matches);
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(paint);
  }
  window.addEventListener('scroll', schedule, options);
  window.addEventListener('resize', schedule, options);
  reduced.addEventListener('change', schedule, options);
  paint();
  return () => {
    life.abort();
    cancelAnimationFrame(frame);
  };
}

export function mountCardTilt(cards) {
  const items = Array.from(cards);
  const life = new AbortController();
  const { signal } = life;
  const enabled = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const clear = card => card.removeAttribute('data-tilt');
  for (const card of items) {
    card.addEventListener('pointermove', event => {
      if (!enabled.matches || event.pointerType === 'touch') return;
      const box = card.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width * 2 - 1;
      const y = (event.clientY - box.top) / box.height * 2 - 1;
      const distance = Math.hypot(x, y);
      card.dataset.tilt = '';
      card.style.setProperty('--card-tilt-axis', distance > .001 ? `${-y / distance} ${x / distance} 0` : '1 0 0');
      card.style.setProperty('--card-tilt-angle', `${clamp(distance) * 5}deg`);
    }, { passive: true, signal });
    for (const event of ['pointerleave', 'pointercancel']) {
      card.addEventListener(event, () => clear(card), { signal });
    }
  }
  enabled.addEventListener('change', () => items.forEach(clear), { signal });
  return () => {
    life.abort();
    items.forEach(card => {
      clear(card);
      card.style.removeProperty('--card-tilt-axis');
      card.style.removeProperty('--card-tilt-angle');
    });
  };
}

export function mountProofSequence(host, { products, metrics, orbitItems = products.map(product => ({ product, label: product.label })) }) {
  if (!products.length || !metrics.length) return () => {};
  const ring = el('ul', 'aw-proof__ring');
  const points = orbitItems.map(({ product, label }) => {
    const tile = el('li', 'aw-proof__tile', mark(product), el('span', '', label));
    ring.append(tile);
    return tile;
  });
  const orbit = el('section', 'aw-proof__orbit', el('div', 'aw-proof__orbit-stage', ring));
  const proofTitle = el('h2', 'aw-proof__title', '任务执行概览');
  const description = el('p', 'aw-proof__lead', '从任务触发到执行回执，用示例记录查看每一步。');

  const numbers = metrics.map(({ label, value, detail }) => {
    const number = el('strong', 'aw-proof__number', el('span', 'aw-sr', String(value)));
    const digits = [...String(value).padStart(2, '0')].map(glyph => {
      const digit = el('span', 'aw-proof__digit');
      digit.setAttribute('aria-hidden', 'true');
      for (let depth = 0; depth < 7; depth++) {
        const face = el('span', depth === 6 ? 'aw-proof__face' : 'aw-proof__layer', glyph);
        face.style.setProperty('--digit-depth', String(depth));
        digit.append(face);
      }
      return digit;
    });
    number.append(...digits);
    return {
      digits,
      panel: el('div', 'aw-proof__metric', el('span', 'aw-proof__label', label),
        number, el('p', 'aw-proof__detail', detail)),
    };
  });
  const stage = el('div', 'aw-proof__stage', proofTitle, description,
    el('div', 'aw-proof__metrics', ...numbers.map(entry => entry.panel)));
  const proof = el('section', 'aw-proof__sequence', stage);
  host.replaceChildren(orbit, proof);
  const stop = watchScroll(host, (box, height, reduced) => {
    const desktop = innerWidth > 760 && !reduced;
    host.toggleAttribute('data-motion', desktop);
    if (!desktop || box.bottom < 0 || box.top > height) return;

    // Expand the ring as it rises. Delay individual tiles along the orbit.
    const orbitTop = orbit.getBoundingClientRect().top;
    const ringProgress = clamp(-orbitTop / (height * .85));
    const radius = Math.min(innerWidth * .24, height * .35);
    points.forEach((tile, index) => {
      const phase = ease((ringProgress - index * .024) / .84);
      const angle = -Math.PI / 2 + index / points.length * Math.PI * 2 - phase * .72;
      const distance = radius * (1 + 1.3 * phase);
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      tile.style.transform = `translate(-50%, -50%) translate3d(${x}px,${y}px,0) scale(${1 + phase * .22})`;
      tile.style.opacity = String(1 - ease((phase - .62) / .38));
    });

    const proofBounds = proof.getBoundingClientRect();
    const header = parseFloat(getComputedStyle(host).getPropertyValue('--aw-nav-height')) || 72;
    const progress = clamp((header - proofBounds.top) / Math.max(1, proofBounds.height - stage.offsetHeight));
    const reveal = ease((height - proofBounds.top) / (height * .58));
    stage.style.setProperty('--proof-reveal', reveal);
    stage.style.setProperty('--proof-depth', `${-380 * (1 - reveal)}px`);

    // Keep the active face readable at rest, with forward/reverse depth between metrics.
    const position = clamp((progress - .16) / .68) * (numbers.length - 1);
    numbers.forEach(({ panel, digits }, index) => {
      const offset = index - position;
      panel.style.opacity = String(1 - ease(Math.abs(offset)));
      panel.style.setProperty('--metric-copy', 1 - ease(Math.abs(offset) / .48));
      digits.forEach((digit, column) => {
        const flip = ease((Math.abs(offset) - column * .045) / .79);
        const angle = Math.sign(offset) * flip * 150;
        digit.style.setProperty('--digit-turn', `${angle}deg`);
      });
    });
  });
  return () => { stop(); host.replaceChildren(); };
}

export function mountCommandDock(host, { launch, command }) {
  const life = new AbortController();
  const code = el('code', '', command);
  const feedback = el('span', 'aw-dock__notice');
  feedback.setAttribute('role', 'status');
  const copy = setLabel(el('button', 'aw-dock__copy', icon('brand'), el('span', '', '请求示例'), code), '复制请求示例');
  copy.type = 'button';
  const dock = el('div', 'aw-dock', copy, feedback);
  host.replaceChildren(dock);

  let timer;
  copy.addEventListener('click', async () => {
    clearTimeout(timer);
    try {
      await navigator.clipboard.writeText(command);
      feedback.textContent = '已复制请求';
      dock.dataset.copied = '';
      timer = window.setTimeout(() => {
        delete dock.dataset.copied;
        feedback.textContent = '';
      }, 2000);
    } catch {
      feedback.textContent = '复制功能暂不可用';
    }
  }, { signal: life.signal });
  const stop = watchScroll(launch, (box, height, reduced) => {
    const leave = ease(-box.top / (height * .77));
    const visible = box.top <= height * .3 && leave < .999;
    dock.hidden = !visible;
    if (!visible) return;
    dock.style.setProperty('--dock-exit', reduced ? 0 : leave);
  });
  return () => {
    stop();
    life.abort();
    clearTimeout(timer);
    dock.remove();
  };
}

export function mountProductHandoff(host, { target }) {
  const life = new AbortController();
  const control = el('button', 'aw-handoff__pull', el('span', 'aw-handoff__line'), el('span', '', '进入快速对比'));
  control.type = 'button';
  const cover = el('div', 'aw-handoff__cover');
  cover.setAttribute('aria-hidden', 'true');
  const room = el('div', 'aw-handoff', cover, control);
  host.replaceChildren(room);
  const reduced = motionQuery();
  let grab;
  function go() {
    target.scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth' });
  }
  control.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    grab = event.clientY;
    control.setPointerCapture(event.pointerId);
  }, { signal: life.signal });
  control.addEventListener('pointermove', event => {
    if (grab === undefined || reduced.matches) return;
    const pull = Math.min(90, Math.max(0, event.clientY - grab));
    control.style.setProperty('--rope-pull', `${pull}px`);
  }, { signal: life.signal });
  const reset = () => {
    grab = undefined;
    control.style.removeProperty('--rope-pull');
  };
  control.addEventListener('pointercancel', reset, { signal: life.signal });
  control.addEventListener('pointerup', reset, { signal: life.signal });
  control.addEventListener('click', go, { signal: life.signal });
  const stop = watchScroll(room, (box, height, reduced) => {
    const reveal = reduced ? 1 : ease((height - box.top) / (height * .78));
    room.style.setProperty('--handoff-reveal', reveal);
  });
  return () => { stop(); life.abort(); room.remove(); };
}

export function mountFooterRunway(host, products) {
  if (!products.length) return () => {};
  const buttons = products.map(product => {
    const anchor = el('a', '', icon('brand'), el('strong', '', product.label),
      el('span', '', product.values.trigger));
    anchor.href = product.href;
    return anchor;
  });
  const track = el('div', 'aw-runway__track', ...buttons);
  const status = el('div', 'aw-runway', track);
  host.replaceChildren(status);
  const life = new AbortController();
  const reduced = motionQuery();
  let current = -1;
  let timer;
  let visible = false;
  let hovering = false;
  function show(index) {
    current = index;
    buttons.forEach((node, position) => { node.hidden = position !== index; });
  }
  function schedule() {
    clearInterval(timer);
    if (life.signal.aborted) return;
    const running = visible && !reduced.matches && !document.hidden
      && !hovering && !status.contains(document.activeElement);
    if (running) status.setAttribute('data-started', '');
    status.toggleAttribute('data-running', running);
    if (!running || buttons.length < 2) return;
    timer = setInterval(() => show((current + 1) % buttons.length), 4050);
  }
  show(0);
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.intersectionRatio >= .25;
    schedule();
  }, { threshold: .25 });
  observer.observe(status);
  status.addEventListener('focusin', schedule, { signal: life.signal });
  status.addEventListener('focusout', () => queueMicrotask(schedule), { signal: life.signal });
  status.addEventListener('pointerenter', () => { hovering = true; schedule(); }, { signal: life.signal });
  status.addEventListener('pointerleave', () => { hovering = false; schedule(); }, { signal: life.signal });
  document.addEventListener('visibilitychange', schedule, { signal: life.signal });
  reduced.addEventListener('change', schedule, { signal: life.signal });
  return () => {
    life.abort();
    observer.disconnect();
    clearInterval(timer);
    status.remove();
  };
}
