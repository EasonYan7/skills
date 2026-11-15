import { button, el, icon, motionQuery, setLabel } from '../shared.js';

const SVG = 'http://www.w3.org/2000/svg';
const clamp = value => Math.max(0, Math.min(1, value));
const mix = (a, b, progress) => a + (b - a) * progress;

function ease(progress) {
  return progress * progress * (3 - 2 * progress);
}

function curve(start, first, second, end, progress) {
  const inverse = 1 - progress;
  return inverse ** 3 * start + 3 * inverse ** 2 * progress * first
    + 3 * inverse * progress ** 2 * second + progress ** 3 * end;
}

function contour(compact) {
  const tailX = mix(19, 25, compact);
  const tailY = mix(49, 38, compact);
  const shoulder = mix(11, 8, compact);
  const bottom = mix(37, 36, compact);
  return `M ${shoulder} 4 H 48
    Q 55 4 54 11 L 51 30 Q 50 ${bottom} 43 ${bottom}
    H 31 L ${tailX} ${tailY} L 21 ${bottom}
    H 10 Q 3 ${bottom} 4 30 L 6 11 Q 7 4 ${shoulder} 4 Z`;
}

function finishRoute(y, size, { dock, finish }) {
  const parked = { ...dock, compact: .58, turn: 0, phase: 'header' };
  if (!finish) return parked;
  const { width, height } = size;
  const { toolStart, toolEnd, takeoff, stage, drop, enterScreen, exitScreen, target, screen } = finish;
  if (y >= toolStart && y < toolEnd && y < takeoff) {
    const t = clamp((y - toolStart) / (toolEnd - toolStart));
    const bend = Math.sin(Math.PI * t);
    return { x: mix(dock.x, width - 68, bend), y: mix(dock.y, height * .35, bend),
      scale: mix(dock.scale, 1, bend), turn: 16 * Math.sin(2 * Math.PI * t),
      compact: mix(.58, .18, bend), phase: 'flight' };
  }
  if (y < takeoff || y >= exitScreen) return parked;
  if (y < stage) {
    const t = ease(clamp((y - takeoff) / (stage - takeoff)));
    return { x: curve(dock.x, width * .23, width * .39, target.x, t),
      y: curve(dock.y, height * .31, height * .23, target.y, t),
      scale: mix(dock.scale, 1.5, t), turn: -13 * Math.sin(Math.PI * t),
      compact: mix(.58, 0, t), phase: 'flight' };
  }
  if (y <= drop) return { ...target, scale: 1.5, compact: 0, turn: 0, phase: 'closing' };
  const t = ease(clamp((y - drop) / (enterScreen - drop)));
  if (y < enterScreen) {
    return { x: curve(target.x, width * .63, screen.x + 30, screen.x, t),
      y: curve(target.y, target.y + height * .04, screen.y - height * .22, screen.y, t),
      scale: mix(1.5, .64, t), turn: 16 * Math.sin(Math.PI * t),
      compact: t * .95, phase: t > .81 ? 'screen' : 'flight', opacity: mix(1, .78, t) };
  }
  const release = ease(clamp((y - enterScreen) / (exitScreen - enterScreen)));
  // Fade the arriving surface into the live display and restore the header dock.
  return release < .5
    ? { x: screen.x, y: screen.y, scale: .64, compact: .95, turn: 0, phase: 'screen', opacity: .78 * (1 - release * 2) }
    : { ...parked, opacity: (release - .5) * 2 };
}

function route(y, size, waypoints) {
  const { width, height } = size;
  const { from, launch, glide, arrive, leave, park, berth, dock, rope } = waypoints;
  const point = (x, y, scale, compact, turn, phase) => ({ x, y, scale, compact, turn, phase });
  const bottom = height - 76;
  const left = width * .23;
  const edge = width - 55;

  if (y <= launch) {
    const t = ease(clamp((y - from) / (launch - from)));
    return point(curve(width / 2, width * .4, left - 10, left, t),
      curve(bottom, bottom - 12, height * .75, height * .59, t),
      mix(1, 1.08, t), 0, -13 * t, y <= from + 1 ? 'origin' : 'flight');
  }
  if (y < glide) {
    const t = ease(clamp((y - launch) / (glide - launch)));
    return point(curve(left, left + 15, width * .65, edge, t),
      curve(height * .59, height * .20, height * .10, height * .27, t),
      mix(1.08, .88, t), .16 * t, mix(-13, 12, t), 'flight');
  }
  if (y < arrive) {
    const t = ease(clamp((y - glide) / (arrive - glide)));
    return point(curve(edge, edge + 15, berth.x + 60, berth.x, t),
      curve(height * .27, height * .48, berth.y, berth.y, t),
      mix(.88, berth.scale, t), mix(.16, .2, t), 12 * (1 - t), 'flight');
  }
  if (y <= leave) {
    return point(berth.x, berth.y, berth.scale, .2, 0, 'story');
  }
  if (y < park) {
    const t = ease(clamp((y - leave) / (park - leave)));
    if (rope && t < .67) {
      const pull = ease(t / .67);
      return point(mix(berth.x, rope.x, pull), mix(berth.y, rope.y, pull),
        mix(berth.scale, .49, pull), mix(.2, .83, pull), 16 * (1 - pull), 'flight');
    }
    if (rope) {
      const release = ease((t - .67) / .33);
      return point(mix(rope.x, dock.x, release), mix(rope.y, dock.y, release),
        mix(.49, dock.scale, release), mix(.83, .58, release), -9 * Math.sin(Math.PI * release), 'flight');
    }
    return point(curve(berth.x, width - 48, width - 95, dock.x, t),
      curve(berth.y, berth.y - height * .18, dock.y + 74, dock.y, t),
      mix(berth.scale, dock.scale, t), mix(.2, .58, t), Math.sin(Math.PI * t) * 15, 'flight');
  }
  return finishRoute(y, size, waypoints);
}

/** Paint one mark against live layout anchors. The optional control is active at the dock. */
export function mountScrollMark(host, { start, story, berth, dark, dock, proof, rope, ending, interactive = false }) {
  const find = value => typeof value === 'string' ? document.querySelector(value) : value;
  const startNode = find(start);
  const storyNode = find(story);
  const berthNode = find(berth);
  const darkNode = find(dark);
  const dockNode = find(dock);
  const proofNode = find(proof);
  const ropeNode = find(rope);
  const toolsNode = find(ending?.tools);
  const closingNode = find(ending?.closing);
  const screenNode = find(ending?.runway);
  if (![startNode, storyNode, berthNode, darkNode, dockNode].every(Boolean)) {
    throw new TypeError('The scroll mark needs a start, story, berth, dark section and header dock.');
  }

  const body = document.createElementNS(SVG, 'svg');
  body.setAttribute('class', 'aw-scroll-mark__body');
  body.setAttribute('viewBox', '0 0 56 52');
  const path = document.createElementNS(SVG, 'path');
  body.append(path);
  const face = icon('brand', 'aw-scroll-mark__glyph');
  const mark = el('div', 'aw-scroll-mark',
    el('span', 'aw-scroll-mark__trail'), el('div', 'aw-scroll-mark__pose', body, face));
  mark.setAttribute('aria-hidden', 'true');
  mark.hidden = true;
  const trigger = interactive ? setLabel(button('', 'aw-scroll-mark-trigger'), '打开网站助手菜单') : null;
  if (trigger) trigger.hidden = true;
  host.replaceChildren(...(trigger ? [mark, trigger] : [mark]));

  const shifted = matchMedia('(max-width: 980px)');
  const reduced = motionQuery();
  const life = new AbortController();
  let frame = 0;
  let lastContour;

  function paint() {
    frame = 0;
    mark.hidden = shifted.matches;
    if (shifted.matches) {
      if (trigger) trigger.hidden = true;
      return;
    }

    const y = window.scrollY;
    const width = document.documentElement.clientWidth;
    const height = window.innerHeight;
    const darkRect = darkNode.getBoundingClientRect();
    const dockRect = dockNode.getBoundingClientRect();
    const berthRect = berthNode.getBoundingClientRect();
    const proofRect = proofNode?.getBoundingClientRect();
    const ropeRect = ropeNode?.getBoundingClientRect();
    const toolsRect = toolsNode?.getBoundingClientRect();
    const closingRect = closingNode?.getBoundingClientRect();
    const screenRect = screenNode?.getBoundingClientRect();
    const from = Math.max(0, startNode.getBoundingClientRect().top + y);
    const arrive = Math.max(from + 180, storyNode.getBoundingClientRect().top + y - height * .16);
    const park = Math.max(arrive + 150, darkRect.top + y + 6);
    const leave = Math.max(arrive, park - height * .66);
    const dock = { x: dockRect.left + dockRect.width / 2, y: dockRect.top + dockRect.height / 2, scale: dockRect.width / 56 };
    const berth = {
      x: berthRect.left + berthRect.width / 2,
      y: Math.min(height - 32, Math.max(dock.y + 34, berthRect.top + berthRect.height / 2)),
      scale: berthRect.width / 56,
    };
    const launch = proofRect && proofRect.height > height
      ? Math.min(arrive - height * .4, proofRect.top + y + proofRect.height * .2)
      : mix(from, arrive, .46);
    const waypoints = {
      from, launch, glide: mix(launch, arrive, .55), arrive, leave, park, berth, dock,
      rope: ropeRect && { x: ropeRect.left + ropeRect.width / 2,
        y: Math.max(dock.y + 25, Math.min(height - 50, ropeRect.bottom)) },
    };
    const size = { width, height };
    if (closingRect && screenRect) {
      const maximum = document.documentElement.scrollHeight - height;
      const closingStart = y + closingRect.top;
      const takeoff = closingStart - height * .94;
      const stage = closingStart - height * .13;
      const enterScreen = Math.min(y + screenRect.top - height * .8, maximum - height * .065);
      if (enterScreen > stage) {
        const toolsEnd = toolsRect ? y + toolsRect.bottom : Number.NEGATIVE_INFINITY;
        waypoints.finish = {
          toolStart: toolsEnd - height * 1.35,
          toolEnd: toolsEnd + height * .12,
          takeoff, stage, enterScreen, exitScreen: Math.min(enterScreen + height * .23, maximum - 1),
          drop: Math.max(stage, Math.min(stage + height * .13, enterScreen - height * .12)),
          target: { x: closingRect.left + closingRect.width / 2,
            y: Math.min(height * .41, Math.max(height * .12, closingRect.top)) },
          screen: { x: screenRect.left + Math.min(screenRect.width * .21, 230),
            y: Math.min(height - 47, Math.max(height * .13, screenRect.top + screenRect.height * .47)) },
        };
      }
    }

    const pose = reduced.matches
      ? { ...dock, compact: .58, turn: 0, phase: 'header' }
      : route(y, size, waypoints);
    const { x, scale, turn, compact, phase, opacity = 1 } = pose;
    const stretch = Math.abs(turn) * .012;
    const overLightTool = toolsNode?.hasAttribute('data-light') && toolsRect.top <= pose.y;
    const inDark = !overLightTool && darkRect.top <= pose.y && darkRect.bottom > pose.y;

    if (phase !== mark.dataset.phase) mark.dataset.phase = phase;
    mark.toggleAttribute('data-dark', inDark);
    mark.style.opacity = opacity;
    if (trigger) {
      const available = phase === 'header' && opacity >= .98;
      trigger.hidden = !available && document.activeElement !== trigger;
      trigger.style.inset = `${dockRect.top}px auto auto ${dockRect.left}px`;
      trigger.style.width = `${dockRect.width}px`;
      trigger.style.height = `${dockRect.height}px`;
    }
    if (phase === 'flight') {
      const future = route(y + 8, size, waypoints);
      const dx = future.x - x;
      const dy = future.y - pose.y;
      mark.style.setProperty('--mark-trail', clamp(Math.hypot(dx, dy) / 9));
      mark.style.setProperty('--mark-trail-angle', `${Math.atan2(dy, dx) * 180 / Math.PI - turn}deg`);
    }
    const scaleX = scale * (1 + stretch);
    const scaleY = scale * (1 - stretch * .45);
    mark.style.transform = `translate3d(${x.toFixed(2)}px, ${pose.y.toFixed(2)}px, 0) translate(-50%, -50%) rotate(${turn.toFixed(2)}deg) scale(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)})`;
    const outline = Math.round(compact * 1000) / 1000;
    if (lastContour !== outline) {
      path.setAttribute('d', contour(outline));
      lastContour = outline;
    }
  }
  function schedule() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(paint);
  }
  const observer = 'ResizeObserver' in window ? new ResizeObserver(schedule) : null;
  for (const node of [startNode, storyNode, berthNode, darkNode, dockNode, proofNode, ropeNode,
    toolsNode, closingNode, screenNode, document.body].filter(Boolean)) {
    observer?.observe(node);
  }
  const options = { passive: true, signal: life.signal };
  window.addEventListener('scroll', schedule, options);
  window.addEventListener('resize', schedule, options);
  document.addEventListener('visibilitychange', schedule, options);
  shifted.addEventListener('change', schedule, options);
  reduced.addEventListener('change', schedule, options);
  trigger?.addEventListener('blur', schedule, options);
  paint();

  return {
    destroy() {
      life.abort();
      observer?.disconnect();
      cancelAnimationFrame(frame);
      mark.remove();
      trigger?.remove();
    },
    trigger,
  };
}
