import { button, el, icon, link, mark, motionQuery, setLabel, tint } from '../shared.js';

const clamp = value => Math.max(0, Math.min(1, value));
const ease = value => value * value * (3 - 2 * value);

/** The demo callback returns a fresh Node for each visible step and variant. */
export function mountStory(host, { title, lead, chapters, renderDemo = defaultDemo }) {
  const life = new AbortController();
  const on = (node, type, fn) => node.addEventListener(type, fn, { signal: life.signal });
  const narrow = matchMedia('(max-width: 760px)');
  const reduced = motionQuery();
  const steps = chapters.map(() => 0);
  const rail = el('nav', 'aw-story__rail');
  setLabel(rail, '产品章节');
  const chapterLinks = chapters.map(chapter => {
    const a = link({ href: '#' + chapter.id, label: chapter.product.label });
    a.prepend(mark(chapter.product));
    rail.append(a);
    return a;
  });
  const intro = el('div', 'aw-story__intro aw-wrap', el('h2', '', title), el('p', '', lead), rail);
  const texts = el('div', 'aw-story__texts');
  const aside = el('div', 'aw-story__sticky');
  const chapterNodes = [];
  const mobileSlots = [];

  chapters.forEach(chapter => {
    const features = el('dl', 'aw-story__features', ...chapter.features.map(feature =>
      el('div', '', el('dt', '', feature.title), el('dd', '', feature.text))));
    const mobile = el('div', 'aw-story__mobile');
    const detail = link(chapter.details, 'aw-story__detail');
    detail.append(icon('next'));
    const article = el('article', 'aw-story__chapter', mark(chapter.product, 'aw-story__mark'), el('h3', '', chapter.product.label),
      el('p', 'aw-story__tagline', chapter.tagline), el('p', 'aw-story__copy', chapter.copy), features, mobile, detail);
    article.id = chapter.id;
    article.tabIndex = -1;
    texts.append(article);
    chapterNodes.push(article);
    mobileSlots.push(mobile);
  });

  const story = el('section', 'aw-story', intro, el('div', 'aw-story__grid aw-wrap', texts, aside));
  host.replaceChildren(story);

  function artwork(product) {
    const layer = el('div', 'aw-story__art');
    layer.setAttribute('aria-hidden', 'true');
    tint(layer, product);
    return layer;
  }

  function detailLink(chapter) {
    const detail = link(chapter.details, 'aw-story__detail');
    detail.append(icon('next'));
    return detail;
  }

  function buildDiagram(index, desktop) {
    const chapter = chapters[index];
    const name = chapter.product.label;
    const screenTitle = el('div', 'aw-story__window-title', mark(chapter.product), chapter.demoTitle ?? name);
    const screenBody = el('div', 'aw-story__window-body');
    const screen = el('div', 'aw-story__window', screenTitle, screenBody);
    const choices = setLabel(el('div', 'aw-story__steps'), name + '演示步骤');
    choices.setAttribute('role', 'group');
    const diagram = el('div', 'aw-story__diagram', screen, choices);
    const controls = chapter.steps.map((step, stepIndex) => {
      const control = button(step.label, 'aw-story__step');
      control.addEventListener('click', () => update(stepIndex));
      choices.append(control);
      return control;
    });
    let lastStep = -1;
    function update(stepIndex) {
      if (lastStep === stepIndex) return;
      lastStep = stepIndex;
      steps[index] = stepIndex;
      controls.forEach((control, number) => control.setAttribute('aria-pressed', String(number === stepIndex)));
      screenBody.replaceChildren(chapter.steps[stepIndex]
        ? renderDemo(chapter.steps[stepIndex], { chapter, stepIndex, variant: desktop ? 'desktop' : 'mobile' })
        : '');
    }
    update(steps[index]);
    return { diagram, update };
  }

  const art = el('div', 'aw-story__backdrop');
  const artLayers = chapters.map(chapter => artwork(chapter.product));
  const diagramSlot = el('div', 'aw-story__diagram-slot');
  const canvas = el('div', 'aw-story__stage', art, diagramSlot);
  const pagination = setLabel(el('nav', 'aw-story__pagination'), '演示章节');
  const jumps = chapters.map(chapter => {
    const label = el('span', 'aw-story__current', chapter.product.label);
    label.setAttribute('aria-hidden', 'true');
    return setLabel(link({ href: '#' + chapter.id, label }, 'aw-story__dot'), chapter.product.label);
  });
  pagination.append(...jumps);
  const berth = el('span', 'aw-story__berth');
  berth.setAttribute('aria-hidden', 'true');
  const details = el('div', 'aw-story__actions', berth);
  aside.append(canvas, el('div', 'aw-story__meta', pagination, details));
  if (!chapters.length) aside.hidden = true;

  let active = -1, shown = -1, artFrom = -1, artTo = -1, frame = 0;
  let nearby = true;
  let mobileStages, desktopStage;

  function syncReading(index, progress) {
    if (active !== index) {
      active = index;
      chapterLinks.forEach((anchor, n) => {
        if (n === index) anchor.setAttribute('aria-current', 'location');
        else anchor.removeAttribute('aria-current');
      });
    }
    jumps[index]?.style.setProperty('--aw-story-read', `${(progress * 100).toFixed(1)}%`);
  }

  function paint(from, to, progress) {
    if (artFrom !== from || artTo !== to) {
      artFrom = from;
      artTo = to;
      artLayers[from].style.opacity = '1';
      art.replaceChildren(artLayers[from], ...(to < 0 ? [] : [artLayers[to]]));
    }
    if (to >= 0) artLayers[to].style.opacity = progress.toFixed(3);
  }

  function showDesktop(index, opacity, offset) {
    if (shown !== index) {
      shown = index;
      desktopStage = buildDiagram(index, true);
      diagramSlot.replaceChildren(desktopStage.diagram);
      details.querySelector('a')?.remove();
      details.append(detailLink(chapters[index]));
      jumps.forEach((jump, n) => {
        if (n === index) jump.setAttribute('aria-current', 'step');
        else jump.removeAttribute('aria-current');
      });
    }
    diagramSlot.style.setProperty('--aw-story-opacity', opacity.toFixed(3));
    diagramSlot.style.setProperty('--aw-story-offset', `${offset.toFixed(2)}px`);
    diagramSlot.inert = opacity < .45;
  }

  function measure() {
    frame = 0;
    if (!nearby || !chapters.length || document.hidden) return;
    const line = innerHeight * .45;
    const rects = chapterNodes.map(node => node.getBoundingClientRect());
    let bestIndex = 0;
    while (rects[bestIndex + 1]?.top <= line) bestIndex++;
    // Use a shorter band than the source's 500 px gap: the sample uses
    // tall contiguous chapters instead of standalone spaced blocks.
    const band = narrow.matches ? 0 : Math.min(320, innerHeight * .34);
    const next = rects[bestIndex + 1];
    const progress = next && band ? clamp((line + band - next.top) / band) : 0;
    const index = bestIndex + (progress > .5 ? 1 : 0);

    const start = rects[index].top - (index ? band * .5 : 0);
    const end = rects[index + 1] ? rects[index + 1].top - band * .5 : rects[index].bottom;
    syncReading(index, clamp((line - start) / Math.max(1, end - start)));
    if (narrow.matches) return;

    // A scrolling chapter must never remove a control that has keyboard focus.
    const focus = document.activeElement;
    if (shown >= 0 && focus?.matches(':focus-visible') && (diagramSlot.contains(focus) || details.contains(focus))) {
      paint(shown, -1, 0);
      showDesktop(shown, 1, 0);
      return;
    }
    if (reduced.matches || !progress) {
      paint(index, -1, 0);
      showDesktop(index, 1, 0);
      return;
    }

    paint(bestIndex, bestIndex + 1, ease(progress));
    const exit = clamp(progress / .12);
    const enter = ease(clamp((progress - .82) / .18));
    const distance = Math.min(72, Math.max(36, canvas.clientHeight * .12));
    showDesktop(index, progress <= .5 ? 1 - exit : enter,
      progress <= .5 ? -distance * ease(exit) : distance * (1 - enter));
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(measure); }
  function renderVariant() {
    if (narrow.matches) {
      mobileStages ??= mobileSlots.map((slot, index) => {
        const stage = buildDiagram(index, false);
        slot.append(el('div', 'aw-story__stage', artwork(chapters[index].product), stage.diagram));
        return stage;
      });
      mobileStages.forEach((stage, index) => stage.update(steps[index]));
    } else if (chapters.length) {
      if (!desktopStage) {
        paint(0, -1, 0);
        showDesktop(0, 1, 0);
      } else desktopStage.update(steps[shown]);
    }
    schedule();
  }
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => {
    nearby = entry.isIntersecting;
    if (nearby) schedule();
  }, { rootMargin: '600px 0px' }) : null;
  observer?.observe(story);
  on(window, 'scroll', schedule);
  on(window, 'resize', schedule);
  on(window, 'hashchange', schedule);
  on(document, 'visibilitychange', schedule);
  on(narrow, 'change', renderVariant);
  on(reduced, 'change', schedule);
  on(aside, 'focusin', schedule);
  on(aside, 'focusout', schedule);
  renderVariant();

  return { destroy() { life.abort(); observer?.disconnect(); cancelAnimationFrame(frame); story.remove(); } };
}

function defaultDemo(step) {
  return el('div', 'aw-story__example', el('h4', '', step.title ?? step.label), el('p', '', step.text));
}
