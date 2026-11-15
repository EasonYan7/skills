import { el, link, setLabel } from '../shared.js';

let instance = 0;
const clamp = (value, max) => Math.min(max, Math.max(0, value));

export function mountDeveloperTools(host, { panels, renderVisual, lightEnding = false }) {
  if (!panels.length) return () => {};
  const life = new AbortController();
  const { signal } = life;
  const wide = matchMedia('(width > 980px) and (height > 640px) and (prefers-reduced-motion: no-preference)');
  const supportsHorizontal = CSS.supports('height', '100svh')
    && CSS.supports('position', 'sticky') && CSS.supports('overflow', 'clip');
  const prefix = `aw-tools-${++instance}`;

  const scenes = panels.map((panel, index) => {
    const id = panel.id ?? `${prefix}-scene-${index + 1}`;
    const heading = el(index ? 'h3' : 'h2', 'aw-tools__title', panel.title);
    heading.id = `${prefix}-title-${index + 1}`;
    const copy = el('div', 'aw-tools__copy', heading,
      panel.tagline && el('p', 'aw-tools__tagline', panel.tagline),
      panel.copy && el('p', 'aw-tools__description', panel.copy),
      panel.action && link(panel.action, 'aw-tools__action'));
    const visual = el('div', 'aw-tools__visual', renderVisual?.(panel, index));
    visual.style.setProperty('--aw-tools-panel-index', index);
    const layout = el('div', 'aw-tools__layout aw-wrap', copy, visual);
    const article = el('article', 'aw-tools__panel', layout);
    article.id = id;
    article.setAttribute('aria-labelledby', heading.id);
    const anchor = el('span', 'aw-tools__anchor');
    anchor.setAttribute('aria-hidden', 'true');
    const stop = link({ href: `#${encodeURIComponent(id)}`, label: panel.title }, 'aw-tools__stop');
    return { id, heading, article, layout, anchor, stop };
  });

  const progress = el('span', 'aw-tools__progress');
  progress.setAttribute('aria-hidden', 'true');
  const controls = setLabel(el('nav', 'aw-tools__controls aw-wrap',
    el('ul', 'aw-tools__stops', ...scenes.map(({ stop }) => el('li', '', stop))),
    progress), '开发者工具场景');
  controls.hidden = scenes.length < 2;
  const track = el('div', 'aw-tools__track', ...scenes.map(({ article }) => article));
  const viewport = el('div', 'aw-tools__viewport', controls, track);
  const section = el('section', 'aw-tools', ...scenes.map(({ anchor }) => anchor), viewport);
  section.setAttribute('aria-labelledby', scenes[0].heading.id);
  host.replaceChildren(section);

  const last = scenes.length - 1;
  let frame = 0;
  let horizontal = false;
  let needsLayout = true;
  let topInset = 0;
  let travel = 0;
  let leadIn = 0;
  let step = 0;
  let active = -1;
  let reading = false;

  function readProgress(bounds) {
    if (horizontal) {
      const moved = clamp(topInset - bounds.top, travel);
      const slide = clamp((moved - leadIn) / step, last);
      track.style.setProperty('--aw-tools-slide', slide);
      return slide;
    }
    const readingLine = window.innerHeight * 0.55;
    return scenes.reduce((index, { article }, position) => (
      article.getBoundingClientRect().top <= readingLine ? position : index
    ), 0);
  }

  function render() {
    const bounds = section.getBoundingClientRect();
    reading = bounds.top <= topInset + 1 && bounds.bottom > topInset + 1;
    if (active !== -1 && (bounds.bottom < 0 || bounds.top > innerHeight)) return;
    const slide = readProgress(bounds);
    const current = Math.round(slide);
    section.style.setProperty('--aw-tools-progress', String(last ? slide / last : 0));
    if (lightEnding && last > 0) {
      const wash = horizontal ? clamp((slide - last + .8) / .8, 1) : 0;
      section.style.setProperty('--aw-tools-wash', wash);
      section.toggleAttribute('data-light', wash >= .46);
      section.toggleAttribute('data-changing-tone', wash > .23 && wash < .76);
    }
    if (current === active) return;
    scenes[active]?.stop.removeAttribute('aria-current');
    scenes[current].stop.setAttribute('aria-current', 'location');
    active = current;
  }

  function measure() {
    const wasHorizontal = horizontal;
    const mayPin = last > 0 && supportsHorizontal && wide.matches;
    section.toggleAttribute('data-horizontal', mayPin);
    if (mayPin) {
      const viewportStyle = getComputedStyle(viewport);
      const viewportHeight = viewport.clientHeight;
      const panelHeight = Math.max(...scenes.map(({ layout }) => layout.offsetHeight));
      const controlsHeight = controls.offsetHeight + parseFloat(getComputedStyle(controls).bottom);
      topInset = parseFloat(viewportStyle.top);
      horizontal = panelHeight + controlsHeight + 48 <= viewportHeight;
      step = viewportHeight * 0.95;
      travel = step * last / 0.8;
      leadIn = travel * 0.08;
      section.style.setProperty('--aw-tools-travel', `${travel}px`);
    } else {
      horizontal = false;
    }
    section.toggleAttribute('data-horizontal', horizontal);
    scenes.forEach(({ id, article, anchor }, index) => {
      if (horizontal) {
        article.removeAttribute('id');
        anchor.id = id;
        const position = index ? leadIn + step * index : 0;
        anchor.style.setProperty('--aw-tools-stop', `${position}px`);
      } else {
        anchor.removeAttribute('id');
        article.id = id;
      }
    });
    if (horizontal !== wasHorizontal && reading && active !== -1) {
      const focusScene = scenes.find(({ article }) => article.contains(document.activeElement));
      const scene = focusScene ?? scenes[active];
      (horizontal ? scene.anchor : scene.article).scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  }

  function update() {
    frame = 0;
    if (needsLayout) {
      needsLayout = false;
      measure();
    }
    render();
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(update);
  }

  function invalidateLayout() {
    needsLayout = true;
    schedule();
  }

  window.addEventListener('scroll', schedule, { passive: true, signal });
  window.addEventListener('resize', invalidateLayout, { signal });
  wide.addEventListener('change', invalidateLayout, { signal });

  // A focused control can be in a clipped scene while tabbing or following a deep link.
  track.addEventListener('focusin', event => {
    if (!horizontal) return;
    const index = scenes.findIndex(({ article }) => article.contains(event.target));
    if (index === -1) return;
    const bounds = section.getBoundingClientRect();
    const slide = clamp((topInset - bounds.top - leadIn) / step, last);
    const pinActive = bounds.top <= topInset + 1 && topInset - bounds.top <= travel + 1;
    if (pinActive && Math.abs(slide - index) < 0.01) return;
    const rect = event.target.getBoundingClientRect();
    const view = viewport.getBoundingClientRect();
    if (rect.left >= view.left && rect.right <= view.right
      && rect.top >= topInset && rect.bottom <= innerHeight) return;
    scenes[index].anchor.scrollIntoView({ behavior: 'instant', block: 'start' });
    render();
  }, { signal });

  // Move the keyboard reading position with a scene selected from the navigation.
  scenes.forEach(({ stop, heading }) => {
    stop.addEventListener('click', event => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      requestAnimationFrame(() => {
        if (signal.aborted || location.hash !== stop.hash) return;
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      });
    }, { signal });
  });

  update();
  const initialTarget = scenes.find(({ stop }) => stop.hash === location.hash);
  if (initialTarget) {
    (horizontal ? initialTarget.anchor : initialTarget.article).scrollIntoView({ behavior: 'instant', block: 'start' });
    render();
  }
  const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(invalidateLayout) : null;
  if (observer) {
    scenes.forEach(({ layout }) => observer.observe(layout));
    observer.observe(host);
  } else {
    section.addEventListener('load', invalidateLayout, { capture: true, signal });
    document.fonts?.ready.then(() => {
      if (!signal.aborted) invalidateLayout();
    });
  }

  return function destroy() {
    life.abort();
    observer?.disconnect();
    cancelAnimationFrame(frame);
    section.remove();
  };
}
