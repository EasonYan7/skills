import { mountNavigation } from './components/navigation.js';
import { mountHero } from './components/hero.js';
import { mountStory } from './components/story.js';
import { mountComparison } from './components/comparison.js';
import { mountDeveloperTools } from './components/developer-tools.js';
import { mountScrollMark } from './components/scroll-mark.js';
import { mountCardTilt, mountCommandDock, mountFooterRunway, mountProductHandoff, mountProofSequence } from './components/home-motion.js';
import { mountClosing, mountReliability, mountSupport } from './components/closing.js';
import { el, icon, link, mark } from './shared.js';
import { chapters, dimensions, navGroups, products } from './demo-data.js';

function renderConsole(step) {
  const status = el('span', 'demo-console__status', step.status);
  status.dataset.tone = step.tone;
  const heading = el('div', 'demo-console__heading', el('h4', '', step.title), status);
  const rows = el('dl', 'demo-console__rows', ...step.rows.map(([key, value]) =>
    el('div', '', el('dt', '', key), el('dd', '', value))));
  return el('div', 'demo-console', el('p', 'demo-console__label', '示例执行记录'), heading, rows);
}

function renderInstrument(chapter) {
  const type = chapter?.product.id ?? 'overview';
  const main = el('span', 'demo-tool-art__main', el('span', 'demo-tool-art__indicator'));
  const satellite = el('span', 'demo-tool-art__satellite');
  const art = el('div', 'demo-tool-art', main, satellite);
  art.dataset.instrument = type;
  art.setAttribute('aria-hidden', 'true');
  return art;
}

function renderToolVisual(panel) {
  const { chapter } = panel;
  const emblem = chapter ? mark(chapter.product) : icon('brand');
  const heading = el('div', 'demo-tool__head', emblem, chapter?.demoTitle ?? '北屿云作 · 任务控制台');
  let content;
  if (!chapter) {
    const runs = chapters.map(item => {
      const record = item.steps[0];
      return el('li', 'demo-tool__run', mark(item.product),
        el('div', 'demo-tool__run-copy', el('strong', '', record.title), el('span', '', item.product.label)),
        el('span', 'demo-tool__status', record.status));
    });
    content = el('ul', 'demo-tool__runs', ...runs);
  } else {
    const example = document.querySelector(panel.action.href)?.querySelector('code');
    const record = chapter.steps[0];
    const results = el('dl', 'demo-tool__results', ...record.rows.slice(0, 2).map(([key, value]) =>
      el('div', '', el('dt', '', key), el('dd', '', value))));
    content = el('div', 'demo-tool__request',
      el('pre', 'demo-tool__code', el('code', '', example?.textContent ?? '')),
      results);
  }
  const visual = el('div', 'demo-tool', heading, content);
  if (chapter) visual.style.setProperty('--tool-accent', chapter.product.tint);
  return el('div', 'demo-tool-stage', renderInstrument(chapter), visual);
}

const guide = { href: '#guide', label: '快速开始' };
const compare = { href: '#comparison', label: '快速对比' };
const developers = { href: '#developers', label: '开发者工具' };
const reliability = { href: '#reliability', label: '执行与追踪' };
mountHero(document.querySelector('#hero'), {
  prefix: '云端任务的', suffix: '解决方案', accessibleTitle: '云端任务的解决方案',
  lead: '用同一套入口，执行即时、定时和事件任务。',
  products,
  actions: [guide, { href: '#solutions', label: '探索产品方案' }, { ...compare, label: '对比方案' }],
});
mountProofSequence(document.querySelector('#motion-proof'), {
  products,
  orbitItems: chapters.flatMap(({ product, steps }) => [
    { product, label: product.label },
    ...steps.map(({ label }) => ({ product, label })),
  ]),
  metrics: [
    { label: '任务类型', value: products.length, detail: products.map(({ label }) => label).join(' · ') },
    { label: '演示步骤', value: chapters.reduce((total, chapter) => total + chapter.steps.length, 0),
      detail: '从接收输入到取得执行结果' },
  ],
});
mountStory(document.querySelector('#solutions'), {
  title: '三种任务，从合适的入口开始', lead: '根据工作如何触发，选择一种执行方式。',
  chapters, renderDemo: renderConsole,
});
mountComparison(document.querySelector('#comparison'), {
  title: '快速对比', lead: '按触发方式、适用场景和交付结果，选择适合的方案。',
  dimensions, products,
});
mountProductHandoff(document.querySelector('#motion-handoff'), {
  target: document.querySelector('#comparison'),
});
mountDeveloperTools(document.querySelector('#developers'), {
  panels: [{
    id: 'tools-intro',
    title: developers.label,
    tagline: '从请求开始，跟踪任务直到交付',
    copy: '用现有的三种任务示例了解怎样发起执行、安排调度和接入事件。每个示例都对应一条可查的运行记录。',
    action: guide,
  }, ...chapters.map(chapter => ({
    id: `tools-${chapter.id}`,
    title: chapter.product.label,
    tagline: chapter.tagline,
    copy: chapter.copy,
    action: chapter.details,
    chapter,
  }))],
  renderVisual: renderToolVisual,
  lightEnding: true,
});
mountNavigation(document.querySelector('#navigation'), {
  brand: { href: '#home', label: '北屿云作', tag: '开发者工具' },
  groups: navGroups,
  links: [{ href: '#solutions', label: '产品导览' }, compare, developers, { href: '#api-example', label: '请求示例' }],
  action: guide,
  darkSections: ['#motion-handoff .aw-handoff__cover', '#comparison', '.aw-tools:not([data-light])'],
});
const markDock = el('span', 'aw-scroll-mark-dock');
markDock.setAttribute('aria-hidden', 'true');
document.querySelector('.aw-nav__brand').append(markDock);
mountCommandDock(document.querySelector('#motion-dock'), {
  launch: document.querySelector('#hero'),
  command: document.querySelector('#api-example code').textContent,
});
mountReliability(document.querySelector('#reliability'), {
  title: reliability.label,
  lead: '沿着任务记录，查看输入、执行状态与回执。',
  cards: [
    { ...chapters[0].features[0], kind: 'records' },
    { ...chapters[0].features[1], kind: 'trace' },
    ...chapters[2].features.map((feature, index) => ({
      ...feature, kind: ['verify', 'branch', 'retry', 'receipt'][index],
    })),
  ],
});
mountClosing(document.querySelector('#closing'), {
  title: '让你的任务在云端运行',
  copy: '提交即时请求、安排定时任务，或从一个事件开始。每次执行都有可以追踪的记录。',
  actions: [guide, developers],
});
document.querySelector('#footer-products').append(el('h2', '', '任务场景'), ...products.map(product => link(product)));
mountFooterRunway(document.querySelector('#footer-board'), products);
mountCardTilt(document.querySelectorAll('.demo-guide__cards article'));
const scrollMark = mountScrollMark(document.querySelector('#scroll-mark'), {
  start: '#hero', story: '.aw-story__chapter', berth: '.aw-story__berth',
  dark: '#platform', dock: markDock, proof: '.aw-proof__sequence', rope: '.aw-handoff__line',
  ending: { tools: '.aw-tools', closing: '.aw-closing__landing', runway: '.aw-runway' },
  interactive: true,
});
mountSupport(document.querySelector('#support'), {
  links: [guide, developers, reliability],
  markTrigger: scrollMark.trigger,
});

function restoreFragment() {
  const { hash } = location;
  if (!hash) return;
  try {
    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!target || target.matches('.aw-tools__panel, .aw-tools__anchor')) return;
    // Let the sticky sections settle before correcting the browser's initial fragment jump.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (location.hash === hash) target.scrollIntoView({ behavior: 'instant' });
    }));
  }
  catch { /* Invalid fragment. */ }
}
// A bookmark may point to a chapter created after the initial HTML parse.
if (document.readyState === 'complete') restoreFragment();
else window.addEventListener('load', restoreFragment, { once: true });
