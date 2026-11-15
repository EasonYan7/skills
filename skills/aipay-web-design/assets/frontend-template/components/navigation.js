import { button, el, icon, link, mark, setLabel } from '../shared.js';

export function mountNavigation(host, { brand, groups, links, action, productsLabel = '产品', darkSections = [] }) {
  const id = host.id || 'aw-site-navigation';
  const life = new AbortController();
  const on = (node, type, fn) => node.addEventListener(type, fn, { signal: life.signal });
  const compactWidth = matchMedia('(max-width: 980px)');
  const header = el('header', 'aw-nav');
  const brandLink = link(brand, 'aw-nav__brand');
  brandLink.prepend(icon('brand'));
  if (brand.tag) brandLink.append(el('span', 'aw-nav__tag', brand.tag));
  const trigger = button(productsLabel, 'aw-nav__trigger');
  trigger.append(icon('chevron'));
  const toggle = setLabel(button('', 'aw-nav__toggle'), '打开菜单');
  toggle.append(icon('menu', 'aw-icon aw-nav__toggle-menu'), icon('close', 'aw-icon aw-nav__toggle-close'));
  const panel = el('div', 'aw-nav__panel');
  panel.id = id + '-desktop';
  const compact = el('div', 'aw-nav__compact-panel');
  compact.id = id + '-compact';
  trigger.setAttribute('aria-controls', panel.id);
  toggle.setAttribute('aria-controls', compact.id);

  function groupsList() {
    return el('div', 'aw-nav__groups', ...groups.map(group => {
      const items = group.items.map(item => {
        const title = link(item, 'aw-nav__item-link');
        if (item.product) title.prepend(mark(item.product));
        return el('li', 'aw-nav__item', title, el('p', 'aw-nav__description', item.description),
          item.links?.length ? el('ul', 'aw-nav__subitems', ...item.links.map(entry => el('li', '', link(entry)))) : null);
      });
      return el('div', 'aw-nav__group', el('p', 'aw-nav__group-label', group.label), el('ul', '', ...items));
    }));
  }

  panel.append(groupsList());
  const details = el('details', 'aw-nav__disclosure');
  const summary = el('summary', '', productsLabel, icon('chevron'));
  details.append(summary, groupsList());
  compact.append(details, ...links.map(entry => link(entry, 'aw-nav__compact-link')));
  const tray = el('div', 'aw-nav__tray', trigger, panel, ...links.map(entry => link(entry, 'aw-nav__tray-link')));
  const controls = el('div', 'aw-nav__controls', tray, toggle, link(action, 'aw-nav__action'));
  const nav = setLabel(el('nav', 'aw-nav__inner aw-wrap', brandLink, controls, compact), '主导航');
  header.append(nav);
  host.replaceChildren(header);

  function fitTray() {
    const bounds = tray.getBoundingClientRect();
    const room = bounds.right - brandLink.getBoundingClientRect().right - 16;
    tray.style.setProperty('--aw-tray-room', `${Math.max(bounds.width, room)}px`);
  }

  let openMode;
  function setOpen(mode = '', returnFocus = false) {
    if (mode === openMode) return;
    const former = openMode === 'desktop' ? trigger : openMode === 'compact' ? toggle : null;
    openMode = mode;
    const desktopOpen = mode === 'desktop';
    const compactOpen = mode === 'compact';
    if (desktopOpen) fitTray();
    header.classList.toggle('aw-nav--open', desktopOpen);
    header.classList.toggle('aw-nav--compact-open', compactOpen);
    trigger.setAttribute('aria-expanded', String(desktopOpen));
    toggle.setAttribute('aria-expanded', String(compactOpen));
    setLabel(toggle, compactOpen ? '关闭菜单' : '打开菜单');
    if (returnFocus) former?.focus();
    // A closing panel can stay on screen through the CSS transition. Remove
    // its links from pointer and keyboard navigation as soon as it closes.
    panel.inert = panel.hidden = !desktopOpen;
    compact.inert = compact.hidden = !compactOpen;
    if (!compactOpen) details.open = false;
  }

  on(trigger, 'click', () => setOpen(openMode === 'desktop' ? '' : 'desktop'));
  on(toggle, 'click', () => setOpen(openMode === 'compact' ? '' : 'compact'));
  on(compactWidth, 'change', () => {
    const active = document.activeElement;
    const moveFocus = panel.contains(active) || compact.contains(active) || active === trigger || active === toggle;
    setOpen();
    if (moveFocus) (compactWidth.matches ? toggle : trigger).focus();
  });
  on(document, 'keydown', event => {
    if (event.key === 'Escape' && openMode) {
      event.preventDefault();
      setOpen('', true);
    }
  });
  on(document, 'pointerdown', event => { if (!header.contains(event.target)) setOpen(); });
  on(document, 'focusin', event => { if (!header.contains(event.target)) setOpen(); });
  on(nav, 'click', event => {
    const anchor = event.target.closest('a');
    if (!anchor) return;
    const isInside = panel.contains(anchor) || compact.contains(anchor);
    if (!isInside) { setOpen(); return; }
    const url = new URL(anchor.href);
    const hash = url.origin === location.origin && url.pathname === location.pathname && url.search === location.search && url.hash;
    let target;
    if (hash) {
      try { target = document.getElementById(decodeURIComponent(hash.slice(1))); } catch { /* Invalid fragment. */ }
    }
    setOpen('', !target);
    if (target) {
      if (!target.matches('a[href], button, input, select, textarea, [tabindex]')) target.tabIndex = -1;
      target.focus({ preventScroll: true });
    }
  });

  let frame = 0;
  function sampleTheme() {
    frame = 0;
    const sampleLine = header.getBoundingClientRect().height / 2;
    header.classList.toggle('aw-nav--dark', darkSections.some(section => {
      const target = typeof section === 'string' ? document.querySelector(section) : section;
      if (!target) return false;
      const rect = target.getBoundingClientRect();
      return rect.top <= sampleLine && rect.bottom > sampleLine;
    }));
  }
  function scheduleTheme() {
    if (!frame) frame = requestAnimationFrame(sampleTheme);
  }
  on(window, 'scroll', scheduleTheme);
  on(window, 'resize', () => {
    if (openMode === 'desktop') fitTray();
    scheduleTheme();
  });
  sampleTheme();
  setOpen();

  return {
    refreshTheme: scheduleTheme,
    destroy() { life.abort(); cancelAnimationFrame(frame); header.remove(); },
  };
}
