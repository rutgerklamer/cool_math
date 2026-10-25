'use strict';

// Every demo draws in a 600×600 logical space; the backing store is scaled for crisp HiDPI output.
const W = 600;
const DPR = Math.min(window.devicePixelRatio || 1, 2);
const TAU = Math.PI * 2;
const rootStyle = getComputedStyle(document.documentElement);
const cssVar = name => rootStyle.getPropertyValue(name).trim();
// Canvases are transparent so the paper background shows through, just like the p5 sketches.
const PAPER = cssVar('--bgColor');
const INK = cssVar('--ink');
const RED = cssVar('--standout');
const PALETTE = ['--c1', '--c2', '--c3', '--c4', '--c5'].map(cssVar);

const mod = (x, n) => ((x % n) + n) % n;
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const randInt = n => Math.floor(Math.random() * n);

function hexToRgb(hex) {
  const v = parseInt(hex.replace('#', ''), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

function setupCanvas(canvas) {
  canvas.width = canvas.height = Math.round(W * DPR);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  return ctx;
}

function pointer(canvas, e) {
  const r = canvas.getBoundingClientRect();
  return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * W];
}

// Pointer drag helper: `down` returns false to ignore the press; `hover` returns a cursor name.
function onDrag(canvas, { down, move, up, hover }) {
  canvas.addEventListener('pointerdown', e => {
    if (down(pointer(canvas, e), e) === false) return;
    canvas.setPointerCapture(e.pointerId);
    const mv = ev => move(pointer(canvas, ev), ev);
    const end = () => {
      canvas.removeEventListener('pointermove', mv);
      canvas.removeEventListener('pointerup', end);
      canvas.removeEventListener('pointercancel', end);
      up?.();
    };
    canvas.addEventListener('pointermove', mv);
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
  });
  if (hover) canvas.addEventListener('pointermove', e => { canvas.style.cursor = hover(pointer(canvas, e)) || ''; });
}

function nearest(points, p, maxDist) {
  let best = -1, bestD = maxDist;
  points.forEach((q, i) => { const d = dist(p, q); if (d < bestD) { best = i; bestD = d; } });
  return best;
}

// Wires [data-k] inputs, [data-act] buttons and an optional [data-preset] select inside a section.
function bindUI(section, opts) {
  const v = {};
  const inputs = {};
  const read = input => {
    const k = input.dataset.k;
    v[k] = input.type === 'checkbox' ? input.checked
      : (input.type === 'range' || input.type === 'number') ? Number(input.value)
      : input.value;
    const out = section.querySelector(`output[data-for="${k}"]`);
    if (out) out.textContent = opts.format?.[k] ? opts.format[k](v[k]) : input.value;
  };
  section.querySelectorAll('[data-k]').forEach(input => {
    inputs[input.dataset.k] = input;
    if (input.type === 'range') {
      // Original-style slider: a bordered box with its own name repeated across it.
      const name = input.closest('.field').querySelector('span').firstChild.textContent.trim().toUpperCase();
      const box = document.createElement('span');
      box.className = 'slider';
      box.innerHTML = `<span class="slider-text">${(name + ' ').repeat(16)}</span>`;
      input.before(box);
      box.append(input);
    }
    read(input);
    input.addEventListener(input.type === 'number' ? 'change' : 'input', () => {
      read(input);
      opts.onChange?.(input.dataset.k);
    });
  });
  section.querySelectorAll('[data-act]').forEach(btn =>
    btn.addEventListener('click', () => opts.actions[btn.dataset.act](btn)));
  section.querySelector('[data-preset]')?.addEventListener('change', e => opts.preset(e.target.value));
  return {
    v,
    set(k, value) {
      const input = inputs[k];
      if (input.type === 'checkbox') input.checked = value; else input.value = value;
      read(input);
    },
    button: act => section.querySelector(`[data-act="${act}"]`),
  };
}

const demos = [];
const visibility = new IntersectionObserver(entries => {
  for (const entry of entries) entry.target._demo.visible = entry.isIntersecting;
}, { rootMargin: '150px 0px' });

function demo(id, factory) {
  const section = document.getElementById(id);
  const canvas = section.querySelector('canvas');
  const d = factory({ section, canvas, ctx: setupCanvas(canvas), hud: section.querySelector('.hud') });
  d.visible = false;
  section._demo = d;
  section.querySelector('.panel').insertAdjacentHTML('beforeend', '<a class="home" href="#top">Go home</a>');
  demos.push(d);
  visibility.observe(section);
}

// Tiny shared synth. Browsers only allow sound after a click, so a checkbox calls unlockAudio() first.
let audioCtx = null;
function unlockAudio() {
  audioCtx ??= new AudioContext();
  audioCtx.resume();
}

function beep(freq, length = 0.3) {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'triangle';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.12, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, t + length);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + length + 0.02);
}

// Maps 0…1 onto five octaves of a pentatonic scale, so any sequence sounds sort of musical.
function pentatonic(x) {
  const scale = [0, 2, 4, 7, 9];
  const k = Math.max(0, Math.min(24, Math.floor(x * 25)));
  return 110 * 2 ** ((12 * Math.floor(k / 5) + scale[k % 5]) / 12);
}

function clearCanvas(ctx) {
  ctx.clearRect(0, 0, W, W);
}

// A filled disc with a black outline: the p5 default look for every ball, seed and weight.
function blob(ctx, x, y, r, fill, stroke = 1.5) {
  ctx.fillStyle = fill;
  ctx.strokeStyle = INK;
  ctx.lineWidth = stroke;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.stroke();
}

/* ─────────────────────────── 01 Fibonacci modulus ─────────────────────────── */
demo('fibonacci', ({ section, ctx, hud }) => {
  const R = 272, C = W / 2, MAX_STEPS = 250000;
  let n, m, a, b, step, done, seen, tail, nextNote = 0;

  const ui = bindUI(section, {
    format: { width: v => v.toFixed(1) },
    onChange(k) {
      if (k === 'sound') { if (ui.v.sound) unlockAudio(); }
      else if (k !== 'speed') restart();
    },
    preset(value) {
      if (!value) return;
      const [nn, mm, s0, s1] = value.split(',').map(Number);
      ui.set('mod', nn); ui.set('mult', mm); ui.set('a0', s0); ui.set('b0', s1);
      restart();
    },
    actions: {
      replay: restart,
      random() {
        ui.set('mod', 2 + randInt(998)); ui.set('mult', 1 + randInt(999));
        ui.set('a0', randInt(10) + 1); ui.set('b0', randInt(10) + 1);
        restart();
      },
    },
  });

  const point = r => {
    const t = r / n * TAU - Math.PI / 2;
    return [C + R * Math.cos(t), C + R * Math.sin(t)];
  };

  function ring(color, width) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.arc(C, C, R + 6, 0, TAU);
    ctx.stroke();
  }

  function restart() {
    n = Math.min(1e7, Math.max(2, Math.floor(ui.v.mod) || 2));
    m = Math.min(1e6, Math.max(1, Math.floor(ui.v.mult) || 1));
    a = mod(Math.floor(ui.v.a0) || 0, n);
    b = mod(Math.floor(ui.v.b0) || 0, n);
    step = 0; done = false; tail = -1;
    seen = new Map([[a * n + b, 0]]); // pair → first step it appeared; a revisit closes the cycle
    clearCanvas(ctx);
    ring(INK, 5);
  }

  // One note per frame at most, so fast speeds don't turn into noise.
  function playNote(r) {
    if (!ui.v.sound || performance.now() < nextNote) return;
    beep(pentatonic(r / n));
    nextNote = performance.now() + 90;
  }

  restart();

  return {
    frame() {
      if (done) return;
      ctx.lineWidth = ui.v.width;
      let prev = point(b);
      for (let i = 0; i < ui.v.speed && !done; i++) {
        const c = (b + m * a) % n;
        a = b; b = c; step++;
        const p = point(b);
        ctx.strokeStyle = 'rgba(0,0,0,0.6)';
        ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(p[0], p[1]); ctx.stroke();
        prev = p;
        const key = a * n + b;
        if (seen.has(key)) { tail = seen.get(key); done = true; }
        else if (step >= MAX_STEPS) done = true;
        else seen.set(key, step);
      }
      playNote(b);
      if (done) ring(tail >= 0 ? PALETTE[1] : RED, 5);
      hud.innerHTML = `n = <b>${n}</b> · step <b>${step.toLocaleString()}</b>` +
        (!done ? '' : tail < 0 ? ' · stopped (no repeat yet)'
          : ` · period <b>${(step - tail).toLocaleString()}</b>` + (tail ? ` after a tail of ${tail}` : ''));
    },
  };
});

/* ─────────────────────────── 02 Golden ratio ─────────────────────────── */
demo('golden', ({ section, ctx, hud }) => {
  let dirty = true;
  const ui = bindUI(section, {
    format: { angle: v => v.toFixed(3) + '°', size: v => v.toFixed(2) },
    onChange() { dirty = true; },
    actions: { angle(btn) { ui.set('angle', Number(btn.dataset.v)); dirty = true; } },
  });

  // Smallest-denominator fraction p/q of a turn within tolerance: that's how many spokes you see.
  function nearFraction(turn) {
    for (let q = 1; q <= 89; q++) {
      const p = Math.round(turn * q);
      if (Math.abs(turn - p / q) < 0.0004) return `${p}/${q}`;
    }
    return null;
  }

  function draw() {
    clearCanvas(ctx);
    const N = ui.v.seeds;
    const th = ui.v.angle * Math.PI / 180;
    const c = 282 / Math.sqrt(N);
    const r = Math.max(0.6, c * 0.55 * ui.v.size);
    for (let i = 1; i <= N; i++) {
      const rad = c * Math.sqrt(i);
      blob(ctx, W / 2 + rad * Math.cos(i * th), W / 2 + rad * Math.sin(i * th), r, RED, Math.min(1, r / 4));
    }
    const frac = nearFraction(ui.v.angle / 360);
    hud.innerHTML = `θ = <b>${ui.v.angle.toFixed(4)}°</b>` + (frac ? ` · ≈ <b>${frac}</b> turn` : ' · irrational-looking');
  }

  return {
    frame(dt) {
      if (ui.v.animate && ui.v.drift > 0) {
        ui.set('angle', mod(ui.v.angle + dt * ui.v.drift * 0.004, 360));
        dirty = true;
      }
      if (dirty) { draw(); dirty = false; }
    },
  };
});

/* ─────────────────────────── 03 Beautiful trigonometry ─────────────────────────── */
demo('trig', ({ section, ctx, hud }) => {
  const R = 255, C = W / 2;
  let t = 0;
  const ui = bindUI(section, { format: { speed: v => v.toFixed(1) + '×' } });

  return {
    frame(dt) {
      t += dt * ui.v.speed * 1.4;
      const N = ui.v.count;
      clearCanvas(ctx);

      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(C, C, R + 14, 0, TAU); ctx.stroke();

      if (ui.v.lines) {
        ctx.lineWidth = 1;
        for (let k = 0; k < N; k++) {
          const th = k * Math.PI / N, ux = Math.cos(th), uy = Math.sin(th);
          ctx.beginPath(); ctx.moveTo(C - R * ux, C - R * uy); ctx.lineTo(C + R * ux, C + R * uy); ctx.stroke();
        }
      }
      if (ui.v.inner) {
        ctx.strokeStyle = INK;
        ctx.setLineDash([6, 6]);
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(C + R / 2 * Math.cos(t), C + R / 2 * Math.sin(t), R / 2, 0, TAU); ctx.stroke();
        ctx.setLineDash([]);
      }
      for (let k = 0; k < N; k++) {
        const th = k * Math.PI / N, s = R * Math.cos(t - th);
        blob(ctx, C + s * Math.cos(th), C + s * Math.sin(th), 12.5, RED, 2);
      }
      hud.innerHTML = `<b>${N}</b> balls · <b>${N}</b> straight lines · 0 circles`;
    },
  };
});

/* ─────────────────────────── 04 Cellular automata ─────────────────────────── */
demo('life', ({ section, canvas, ctx, hud }) => {
  const S = 75, CELL = W / S;
  let grid = new Uint8Array(S * S), next = new Uint8Array(S * S);
  let running = true, acc = 0, gen = 0, brain = false;
  let birth = [], survive = [];

  const ui = bindUI(section, {
    onChange(k) { if (k === 'rule') setRule(); },
    actions: {
      toggle(btn) { running = !running; btn.textContent = running ? 'Pause' : 'Play'; },
      step() { tick(); },
      randomize,
      clear() { grid.fill(0); gen = 0; },
    },
  });

  function setRule() {
    brain = ui.v.rule === 'brain';
    if (!brain) {
      const [, b, s] = ui.v.rule.match(/B(\d*)\/S(\d*)/);
      birth = Array.from({ length: 9 }, (_, i) => b.includes(i));
      survive = Array.from({ length: 9 }, (_, i) => s.includes(i));
      for (let i = 0; i < grid.length; i++) if (grid[i] === 2) grid[i] = 0; // no "dying" state in B/S rules
    }
  }

  function randomize() {
    for (let i = 0; i < grid.length; i++) grid[i] = Math.random() < ui.v.density ? 1 : 0;
    gen = 0;
  }

  // Toroidal neighbourhood: the grid wraps around at the edges. Only state 1 counts as alive.
  function tick() {
    for (let y = 0; y < S; y++) {
      const ym = mod(y - 1, S) * S, y0 = y * S, yp = mod(y + 1, S) * S;
      for (let x = 0; x < S; x++) {
        const xm = mod(x - 1, S), xp = mod(x + 1, S);
        const n = (grid[ym + xm] & 1) + (grid[ym + x] & 1) + (grid[ym + xp] & 1)
          + (grid[y0 + xm] & 1) + (grid[y0 + xp] & 1)
          + (grid[yp + xm] & 1) + (grid[yp + x] & 1) + (grid[yp + xp] & 1);
        const cell = grid[y0 + x];
        next[y0 + x] = brain
          ? (cell === 1 ? 2 : cell === 2 ? 0 : n === 2 ? 1 : 0)
          : (cell ? (survive[n] ? 1 : 0) : (birth[n] ? 1 : 0));
      }
    }
    [grid, next] = [next, grid];
    gen++;
  }

  let paintValue = 1, lastCell = null;
  const cellAt = p => [Math.floor(p[0] / CELL), Math.floor(p[1] / CELL)];
  function paintLine(from, to) {
    const steps = Math.max(Math.abs(to[0] - from[0]), Math.abs(to[1] - from[1]), 1);
    for (let i = 0; i <= steps; i++) {
      const x = Math.round(from[0] + (to[0] - from[0]) * i / steps);
      const y = Math.round(from[1] + (to[1] - from[1]) * i / steps);
      if (x >= 0 && y >= 0 && x < S && y < S) grid[y * S + x] = paintValue;
    }
  }
  onDrag(canvas, {
    down(p) {
      const c = cellAt(p);
      paintValue = grid[c[1] * S + c[0]] ? 0 : 1;
      paintLine(c, c);
      lastCell = c;
    },
    move(p) { const c = cellAt(p); paintLine(lastCell, c); lastCell = c; },
  });

  setRule();
  randomize();

  return {
    frame(dt) {
      if (running) {
        acc += dt * ui.v.speed;
        for (let i = 0; acc >= 1 && i < 4; i++) { tick(); acc--; }
        acc = Math.min(acc, 1);
      }
      ctx.fillStyle = PAPER;
      ctx.fillRect(0, 0, W, W);
      let pop = 0;
      for (let i = 0; i < grid.length; i++) {
        const cell = grid[i];
        if (!cell) continue;
        if (cell === 1) pop++;
        ctx.fillStyle = cell === 1 ? INK : RED;
        ctx.fillRect((i % S) * CELL, Math.floor(i / S) * CELL, CELL, CELL);
      }
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i <= S; i++) {
        ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, W);
        ctx.moveTo(0, i * CELL); ctx.lineTo(W, i * CELL);
      }
      ctx.stroke();
      hud.innerHTML = `generation <b>${gen}</b> · population <b>${pop}</b>`;
    },
  };
});

/* ─────────────────────────── 05 Double pendulum ─────────────────────────── */
demo('pendulum', ({ section, canvas, ctx, hud }) => {
  const PX = W / 2, PY = W / 2, SCALE = 105, H = 1 / 480, TRAIL = 360;
  const TWIN_OFFSET = 0.001 * Math.PI / 180;
  let bobs = [], time = 0, dragging = 0;

  const ui = bindUI(section, {
    format: { l1: v => v.toFixed(2) + ' m', l2: v => v.toFixed(2) + ' m', m1: v => v.toFixed(1) + ' kg', m2: v => v.toFixed(1) + ' kg', g: v => v.toFixed(1) + ' m/s²' },
    onChange(k) { if (k === 'twins') start(bobs[0].s[0], bobs[0].s[1]); },
    actions: {
      reset() { start(Math.PI / 2, Math.PI / 2); },
      random() { start((Math.random() * 2 - 1) * Math.PI, (Math.random() * 2 - 1) * Math.PI); },
    },
  });

  function start(a1, a2) {
    const count = ui.v.twins ? 5 : 1;
    bobs = Array.from({ length: count }, (_, i) => ({ s: [a1, a2 + i * TWIN_OFFSET, 0, 0], trail: [] }));
    time = 0;
  }

  // Equations of motion for the double pendulum; state = [θ1, θ2, ω1, ω2].
  function deriv([a1, a2, w1, w2]) {
    const { l1, l2, m1, m2, g } = ui.v;
    const d = a1 - a2;
    const den = 2 * m1 + m2 - m2 * Math.cos(2 * d);
    const dw1 = (-g * (2 * m1 + m2) * Math.sin(a1) - m2 * g * Math.sin(a1 - 2 * a2)
      - 2 * Math.sin(d) * m2 * (w2 * w2 * l2 + w1 * w1 * l1 * Math.cos(d))) / (l1 * den);
    const dw2 = (2 * Math.sin(d) * (w1 * w1 * l1 * (m1 + m2) + g * (m1 + m2) * Math.cos(a1)
      + w2 * w2 * l2 * m2 * Math.cos(d))) / (l2 * den);
    return [w1, w2, dw1, dw2];
  }

  function rk4(s, h) {
    const add = (x, k, f) => x.map((v, i) => v + k[i] * f);
    const k1 = deriv(s);
    const k2 = deriv(add(s, k1, h / 2));
    const k3 = deriv(add(s, k2, h / 2));
    const k4 = deriv(add(s, k3, h));
    return s.map((v, i) => v + h / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
  }

  function joints(s) {
    const x1 = PX + SCALE * ui.v.l1 * Math.sin(s[0]);
    const y1 = PY + SCALE * ui.v.l1 * Math.cos(s[0]);
    return [[x1, y1], [x1 + SCALE * ui.v.l2 * Math.sin(s[1]), y1 + SCALE * ui.v.l2 * Math.cos(s[1])]];
  }

  onDrag(canvas, {
    down(p) {
      const [j1, j2] = joints(bobs[0].s);
      dragging = nearest([j1, j2], p, 36) + 1;
      return dragging > 0 ? undefined : false;
    },
    move(p) {
      const s = bobs[0].s;
      if (dragging === 1) s[0] = Math.atan2(p[0] - PX, p[1] - PY);
      else s[1] = Math.atan2(p[0] - joints(s)[0][0], p[1] - joints(s)[0][1]);
      start(s[0], s[1]);
    },
    up() { dragging = 0; },
    hover(p) { return nearest(joints(bobs[0].s), p, 36) >= 0 ? 'grab' : ''; },
  });

  start(Math.PI / 2, Math.PI / 2);

  return {
    frame(dt) {
      if (!dragging) {
        const steps = Math.min(40, Math.round(dt / H));
        for (const bob of bobs) {
          for (let i = 0; i < steps; i++) bob.s = rk4(bob.s, H);
          bob.trail.push(joints(bob.s)[1]);
          if (bob.trail.length > TRAIL) bob.trail.shift();
        }
        time += steps * H;
      }

      clearCanvas(ctx);
      ctx.lineCap = 'round';
      bobs.forEach((bob, b) => {
        const color = PALETTE[b % PALETTE.length];
        const chunk = 30;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.6;
        for (let i = 0; i < bob.trail.length - 1; i += chunk) {
          ctx.globalAlpha = 0.85 * (i + chunk) / TRAIL;
          ctx.beginPath();
          ctx.moveTo(bob.trail[i][0], bob.trail[i][1]);
          for (let j = i + 1; j <= Math.min(i + chunk, bob.trail.length - 1); j++) ctx.lineTo(bob.trail[j][0], bob.trail[j][1]);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      });
      // Draw rods and weights back to front so the first (draggable) pendulum is on top.
      for (let b = bobs.length - 1; b >= 0; b--) {
        const [j1, j2] = joints(bobs[b].s);
        ctx.strokeStyle = INK;
        ctx.globalAlpha = b === 0 ? 1 : 0.35;
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(PX, PY); ctx.lineTo(j1[0], j1[1]); ctx.lineTo(j2[0], j2[1]); ctx.stroke();
        ctx.globalAlpha = 1;
        blob(ctx, j1[0], j1[1], 6 + 4 * Math.sqrt(ui.v.m1), PALETTE[b % PALETTE.length], 2);
        blob(ctx, j2[0], j2[1], 6 + 4 * Math.sqrt(ui.v.m2), PALETTE[b % PALETTE.length], 2);
      }
      ctx.fillStyle = INK;
      ctx.beginPath(); ctx.arc(PX, PY, 4, 0, TAU); ctx.fill();
      hud.innerHTML = `t = <b>${time.toFixed(1)} s</b>` + (bobs.length > 1 ? ` · <b>${bobs.length}</b> pendulums` : '');
    },
  };
});

/* ─────────────────────────── 06 Toothpicks ─────────────────────────── */
demo('toothpicks', ({ section, ctx, hud }) => {
  // Grid units: a toothpick has length 2 and covers its centre plus both ends.
  let occ, last, gen, total, done, reach, running = true, acc = 0;

  const ui = bindUI(section, {
    format: { len: v => v + ' px', speed: v => v, width: v => v.toFixed(1) },
    onChange(k) { if (k !== 'speed') rebuild(gen); },
    actions: {
      toggle(btn) { running = !running; btn.textContent = running ? 'Pause' : 'Play'; },
      step() { if (!done) grow(); },
      reset() { rebuild(1); },
    },
  });

  const key = (x, y) => (x + 4096) * 8192 + (y + 4096);
  // The pattern spreads roughly one unit every two generations, so this is ~where it meets the edge.
  const maxGen = () => 2 * Math.floor((W / 2 - 10) / (ui.v.len / 2));

  function rebuild(target) {
    occ = new Map(); last = []; gen = 0; total = 0; reach = 0; done = false;
    clearCanvas(ctx);
    const goal = Math.max(1, Math.min(target, maxGen()));
    while (gen < goal && !done) grow();
  }

  function place(x, y, horizontal) {
    const [dx, dy] = horizontal ? [1, 0] : [0, 1];
    for (const s of [-1, 0, 1]) {
      const k = key(x + s * dx, y + s * dy);
      occ.set(k, (occ.get(k) || 0) + 1);
    }
    return { x, y, horizontal };
  }

  function grow() {
    gen++;
    const candidates = gen === 1 ? [[0, 0]] : [];
    for (const t of last) {
      const [dx, dy] = t.horizontal ? [1, 0] : [0, 1];
      for (const s of [-1, 1]) {
        const ex = t.x + s * dx, ey = t.y + s * dy;
        if (occ.get(key(ex, ey)) === 1) candidates.push([ex, ey]); // touched by nothing else = exposed
      }
    }
    const horizontal = gen % 2 === 1;
    const previous = last;
    last = candidates.map(([x, y]) => place(x, y, horizontal));
    total += last.length;

    stroke(previous, INK); // the previous "newest" generation turns black…
    stroke(last, RED);     // …and the one just added is red
    for (const t of last) reach = Math.max(reach, Math.abs(t.x) + 1, Math.abs(t.y) + 1);
    if ((reach + 1) * ui.v.len / 2 > W / 2 - 6 || !last.length) done = true;
  }

  function stroke(picks, color) {
    const unit = ui.v.len / 2;
    ctx.strokeStyle = color;
    ctx.lineWidth = ui.v.width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (const t of picks) {
      const cx = W / 2 + t.x * unit, cy = W / 2 + t.y * unit;
      if (t.horizontal) { ctx.moveTo(cx - unit, cy); ctx.lineTo(cx + unit, cy); }
      else { ctx.moveTo(cx, cy - unit); ctx.lineTo(cx, cy + unit); }
    }
    ctx.stroke();
  }

  rebuild(1);

  return {
    frame(dt) {
      if (running && !done) {
        acc += dt * ui.v.speed;
        while (acc >= 1 && !done) { grow(); acc--; }
      }
      hud.innerHTML = `generation <b>${gen}</b> · toothpicks <b>${total.toLocaleString()}</b> · new <b>${last.length}</b>` + (done ? ' · edge reached' : '');
    },
  };
});

/* ─────────────────────────── 07 Chaos game ─────────────────────────── */

// Decides which vertex the chaos game jumps towards next.
// rule: 'free' | 'no-repeat' | 'no-ccw' | 'no-neighbour-after-repeat'
// n: number of vertices (indexed 0 … n-1 in polygon order)
// last, prev: the two most recently chosen vertex indices (last is the newest)
function pickVertex(rule, n, last, prev) {
  // TODO(human): implement the restricted rules; every rule currently behaves like 'free'.
  return randInt(n);
}

demo('chaos', ({ section, canvas, ctx, hud }) => {
  const RES = Math.round(W * DPR), MAX_DOTS = 3e6, DOT = Math.max(2, Math.round(1.5 * DPR));
  const off = document.createElement('canvas');
  off.width = off.height = RES;
  const offCtx = off.getContext('2d');
  const image = offCtx.createImageData(RES, RES);
  const px = image.data;
  const dotRgb = PALETTE.map(hexToRgb);
  const inkRgb = hexToRgb(INK);
  let verts = [], pos = [W / 2, W / 2], last = 0, prev = 0, dots = 0, dragging = -1;

  const poly = (k, r, rot = -Math.PI / 2) =>
    Array.from({ length: k }, (_, i) => [W / 2 + r * Math.cos(rot + i * TAU / k), W / 2 + r * Math.sin(rot + i * TAU / k)]);
  const square = () => [[60, 60], [540, 60], [540, 540], [60, 540]];

  const PRESETS = {
    tri: () => ({ v: [[300, 50], [560, 530], [40, 530]], ratio: 0.5, rule: 'free' }),
    carpet: () => ({ v: [[60, 60], [300, 60], [540, 60], [540, 300], [540, 540], [300, 540], [60, 540], [60, 300]], ratio: 0.667, rule: 'free' }),
    squareCentre: () => ({ v: [...square(), [300, 300]], ratio: 0.667, rule: 'free' }),
    pentagon: () => ({ v: poly(5, 275), ratio: 0.618, rule: 'free' }),
    hexagon: () => ({ v: poly(6, 275), ratio: 0.667, rule: 'free' }),
    squareNoRepeat: () => ({ v: square(), ratio: 0.5, rule: 'no-repeat' }),
    squareNoNeighbour: () => ({ v: square(), ratio: 0.5, rule: 'no-ccw' }),
  };

  const ui = bindUI(section, {
    format: { ratio: v => v.toFixed(3), speed: v => v.toLocaleString() },
    onChange(k) { if (k !== 'speed') reset(); },
    preset(name) {
      if (!name) return;
      const p = PRESETS[name]();
      verts = p.v; ui.set('ratio', p.ratio); ui.set('rule', p.rule);
      reset();
    },
    actions: {
      addVertex() { verts = poly(verts.length + 1, 275); reset(); },
      removeVertex() { if (verts.length > 3) { verts = poly(verts.length - 1, 275); reset(); } },
    },
  });

  function reset() {
    px.fill(0);
    pos = [...verts[0]];
    last = prev = 0;
    dots = 0;
    for (let i = 0; i < 30; i++) jump(); // let the point settle onto the attractor before plotting
  }

  function jump() {
    const next = pickVertex(ui.v.rule, verts.length, last, prev);
    const r = ui.v.ratio;
    pos[0] += (verts[next][0] - pos[0]) * r;
    pos[1] += (verts[next][1] - pos[1]) * r;
    prev = last; last = next;
    return next;
  }

  onDrag(canvas, {
    down(p) { dragging = nearest(verts, p, 26); return dragging >= 0 ? undefined : false; },
    move(p) { verts[dragging] = [Math.max(0, Math.min(W, p[0])), Math.max(0, Math.min(W, p[1]))]; reset(); },
    up() { dragging = -1; },
    hover(p) { return nearest(verts, p, 26) >= 0 ? 'grab' : ''; },
  });

  verts = PRESETS.tri().v;
  reset();

  return {
    frame() {
      const budget = Math.min(ui.v.speed, MAX_DOTS - dots); // stop once the shape is fully inked
      for (let i = 0; i < budget; i++) {
        const v = jump();
        const x = Math.floor(pos[0] * DPR), y = Math.floor(pos[1] * DPR);
        if (x < 0 || y < 0 || x >= RES - DOT || y >= RES - DOT) continue;
        const c = ui.v.color ? dotRgb[v % dotRgb.length] : inkRgb;
        for (let dy = 0; dy < DOT; dy++) {
          for (let dx = 0; dx < DOT; dx++) {
            const o = ((y + dy) * RES + x + dx) * 4;
            px[o] = c[0]; px[o + 1] = c[1]; px[o + 2] = c[2];
            px[o + 3] += 120; // each hit adds opacity; Uint8Clamped stops at 255
          }
        }
      }
      dots += budget;
      offCtx.putImageData(image, 0, 0);
      clearCanvas(ctx);
      ctx.drawImage(off, 0, 0, W, W);
      verts.forEach((v, i) => blob(ctx, v[0], v[1], 7, ui.v.color ? PALETTE[i % PALETTE.length] : RED, 2));
      hud.innerHTML = `<b>${verts.length}</b> vertices · jump <b>${ui.v.ratio.toFixed(3)}</b> · <b>${dots.toLocaleString()}</b> dots`;
    },
  };
});

/* ─────────────────────────── 08 Magic highway (Euler line) ─────────────────────────── */
demo('euler', ({ section, canvas, ctx, hud }) => {
  const DEFAULT = [[210, 80], [70, 470], [540, 400]];
  let tri = DEFAULT.map(p => [...p]), dirty = true, dragging = -1;
  const [cG, cO, cH, cI, cN] = PALETTE;

  const ui = bindUI(section, {
    onChange() { dirty = true; },
    actions: {
      reset() { tri = DEFAULT.map(p => [...p]); dirty = true; },
      random() { tri = Array.from({ length: 3 }, () => [60 + Math.random() * 480, 60 + Math.random() * 480]); dirty = true; },
    },
  });

  const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  const foot = (p, a, b) => {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy);
    return [a[0] + t * dx, a[1] + t * dy];
  };

  function seg(p, q, color, width = 1.2, dash = []) {
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.setLineDash(dash);
    ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
    ctx.setLineDash([]);
  }
  function circle(c, r, color, width = 2) {
    ctx.strokeStyle = color; ctx.lineWidth = width;
    ctx.beginPath(); ctx.arc(c[0], c[1], r, 0, TAU); ctx.stroke();
  }
  function dot(p, color, label) {
    blob(ctx, p[0], p[1], 5.5, color, 1.5);
    ctx.fillStyle = INK;
    ctx.font = 'italic bold 20px "Times New Roman", Times, serif';
    ctx.fillText(label, p[0] + 9, p[1] - 9);
  }

  function draw() {
    clearCanvas(ctx);
    const [A, B, C] = tri;
    const [ax, ay] = A, [bx, by] = B, [cx, cy] = C;
    const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));

    ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(cx, cy); ctx.closePath(); ctx.stroke();

    if (Math.abs(d) < 1e-6) {
      hud.innerHTML = 'degenerate triangle — the corners are collinear';
      return;
    }

    const G = [(ax + bx + cx) / 3, (ay + by + cy) / 3];
    const sq = p => p[0] * p[0] + p[1] * p[1];
    const O = [(sq(A) * (by - cy) + sq(B) * (cy - ay) + sq(C) * (ay - by)) / d,
               (sq(A) * (cx - bx) + sq(B) * (ax - cx) + sq(C) * (bx - ax)) / d];
    const H = [3 * G[0] - 2 * O[0], 3 * G[1] - 2 * O[1]];
    const N = mid(O, H);
    const R = dist(O, A);
    const a = dist(B, C), b = dist(C, A), c = dist(A, B), per = a + b + c;
    const I = [(a * ax + b * bx + c * cx) / per, (a * ay + b * by + c * cy) / per];
    const inradius = (Math.abs(d) / 4) / (per / 2);

    if (ui.v.line && dist(O, H) > 1e-3) {
      const ux = (H[0] - O[0]) / dist(O, H), uy = (H[1] - O[1]) / dist(O, H);
      seg([O[0] - ux * 2000, O[1] - uy * 2000], [O[0] + ux * 2000, O[1] + uy * 2000], INK, 2, [10, 6]);
    }
    if (ui.v.circum) {
      circle(O, R, cO, 5);
      [mid(A, B), mid(B, C), mid(C, A)].forEach(m => seg(O, m, cO, 2));
    }
    if (ui.v.centroid) [[A, mid(B, C)], [B, mid(C, A)], [C, mid(A, B)]].forEach(([p, m]) => seg(p, m, cG, 2));
    if (ui.v.ortho) [[A, foot(A, B, C)], [B, foot(B, C, A)], [C, foot(C, A, B)]].forEach(([p, f]) => seg(p, f, cH, 2));
    if (ui.v.nine) circle(N, R / 2, cN, 2.5);
    if (ui.v.incircle) circle(I, inradius, cI, 5);

    if (ui.v.circum) dot(O, cO, 'O');
    if (ui.v.centroid) dot(G, cG, 'G');
    if (ui.v.ortho) dot(H, cH, 'H');
    if (ui.v.nine) dot(N, cN, 'N');
    if (ui.v.incircle) dot(I, cI, 'I');

    tri.forEach(p => blob(ctx, p[0], p[1], 8, cI, 3));

    const og = dist(O, G), gh = dist(G, H);
    hud.innerHTML = `|OG| = <b>${og.toFixed(1)}</b> · |GH| = <b>${gh.toFixed(1)}</b> · ratio <b>${og > 1e-6 ? (gh / og).toFixed(4) : '—'}</b>`;
  }

  onDrag(canvas, {
    down(p) { dragging = nearest(tri, p, 28); return dragging >= 0 ? undefined : false; },
    move(p) { tri[dragging] = [Math.max(8, Math.min(W - 8, p[0])), Math.max(8, Math.min(W - 8, p[1]))]; dirty = true; },
    up() { dragging = -1; },
    hover(p) { return nearest(tri, p, 28) >= 0 ? 'grab' : ''; },
  });

  return {
    frame() { if (dirty) { draw(); dirty = false; } },
  };
});

/* ─────────────────────────── 09 Times tables ─────────────────────────── */
demo('times', ({ section, ctx, hud }) => {
  const R = 272, C = W / 2;
  let dirty = true;
  const ui = bindUI(section, {
    format: { k: v => v.toFixed(2), speed: v => v.toFixed(2) },
    onChange() { dirty = true; },
    actions: { k(btn) { ui.set('k', Number(btn.dataset.v)); dirty = true; } },
  });

  const point = x => {
    const t = x / ui.v.points * TAU - Math.PI / 2;
    return [C + R * Math.cos(t), C + R * Math.sin(t)];
  };

  function draw() {
    clearCanvas(ctx);
    const n = ui.v.points, k = ui.v.k;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(C, C, R, 0, TAU); ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,0.65)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const p = point(i), q = point((i * k) % n);
      ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]);
    }
    ctx.stroke();
    if (n <= 150) for (let i = 0; i < n; i++) { const p = point(i); blob(ctx, p[0], p[1], 3.5, RED, 1); }
    hud.innerHTML = `<b>${n}</b> points · times <b>${k.toFixed(2)}</b>`;
  }

  return {
    frame(dt) {
      if (ui.v.animate) {
        const k = ui.v.k + dt * ui.v.speed;
        ui.set('k', k > 100 ? 0 : k);
        dirty = true;
      }
      if (dirty) { draw(); dirty = false; }
    },
  };
});

/* ─────────────────────────── 10 Recamán sequence ─────────────────────────── */
demo('recaman', ({ section, ctx, hud }) => {
  // Precompute: step n goes back n if that's positive and unvisited, otherwise forward n.
  const seq = [0], used = new Set([0]);
  for (let i = 1; i < 1000; i++) {
    const back = seq[i - 1] - i;
    const v = back > 0 && !used.has(back) ? back : seq[i - 1] + i;
    seq.push(v);
    used.add(v);
  }
  let shown = 1, lastCount = 1;

  const ui = bindUI(section, {
    onChange(k) {
      if (k === 'sound' && ui.v.sound) unlockAudio();
      if (k === 'terms') shown = Math.min(shown, ui.v.terms);
    },
    actions: { replay() { shown = 1; lastCount = 1; } },
  });

  return {
    frame(dt) {
      if (shown < ui.v.terms) shown = Math.min(ui.v.terms, shown + dt * ui.v.speed);
      const count = Math.floor(shown);
      if (ui.v.sound && count > lastCount) beep(pentatonic((seq[count - 1] % 50) / 50), 0.4);
      lastCount = count;

      // Zoom out as the sequence grows, so the furthest jump always fits.
      let top = 1;
      for (let i = 0; i < count; i++) top = Math.max(top, seq[i]);
      const x = v => 20 + v * (W - 40) / top;

      clearCanvas(ctx);
      for (let i = 1; i < count; i++) {
        const a = x(seq[i - 1]), b = x(seq[i]);
        const newest = i === count - 1;
        ctx.strokeStyle = newest ? RED : INK;
        ctx.lineWidth = newest ? 3 : 1.5;
        ctx.beginPath();
        ctx.arc((a + b) / 2, W / 2, Math.abs(b - a) / 2, i % 2 ? Math.PI : 0, i % 2 ? TAU : Math.PI); // odd jumps above, even below
        ctx.stroke();
      }
      hud.innerHTML = `a(<b>${count - 1}</b>) = <b>${seq[count - 1]}</b>`;
    },
  };
});

/* ─────────────────────────── 11 Langton's ant ─────────────────────────── */
demo('ant', ({ section, ctx, hud }) => {
  const S = 120, CELL = W / S;
  const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];
  const COLORS = [null, INK, RED, PALETTE[2], PALETTE[1], PALETTE[4], PALETTE[3]];
  let grid, ant, steps, rule, running = true;

  const ui = bindUI(section, {
    onChange(k) { if (k === 'rule') reset(); },
    actions: {
      toggle(btn) { running = !running; btn.textContent = running ? 'Pause' : 'Play'; },
      reset,
    },
  });

  function reset() {
    grid = new Uint8Array(S * S);
    ant = { x: S / 2, y: S / 2, d: 0 };
    steps = 0;
    rule = ui.v.rule;
  }

  // Turn by the cell's colour, bump the colour to the next one, step forward. The grid wraps around.
  function tick() {
    const i = ant.y * S + ant.x, s = grid[i];
    ant.d = mod(ant.d + (rule[s] === 'R' ? 1 : -1), 4);
    grid[i] = (s + 1) % rule.length;
    ant.x = mod(ant.x + DX[ant.d], S);
    ant.y = mod(ant.y + DY[ant.d], S);
    steps++;
  }

  reset();

  return {
    frame() {
      if (running) for (let i = 0; i < ui.v.speed; i++) tick();
      clearCanvas(ctx);
      for (let i = 0; i < grid.length; i++) {
        const s = grid[i];
        if (!s) continue;
        ctx.fillStyle = COLORS[1 + (s - 1) % (COLORS.length - 1)];
        ctx.fillRect((i % S) * CELL, Math.floor(i / S) * CELL, CELL, CELL);
      }
      blob(ctx, (ant.x + 0.5) * CELL, (ant.y + 0.5) * CELL, 4, RED, 1.5);
      hud.innerHTML = `step <b>${steps.toLocaleString()}</b> · rule <b>${rule}</b>`;
    },
  };
});

/* ─────────────────────────── 12 Mandelbrot & Julia ─────────────────────────── */
demo('julia', ({ section, canvas, ctx, hud }) => {
  const RES = 300;
  const off = document.createElement('canvas');
  off.width = off.height = RES;
  const offCtx = off.getContext('2d');
  const image = offCtx.createImageData(RES, RES);
  const px = image.data;
  const red = hexToRgb(RED);
  const VIEW = { mandelbrot: [-0.6, 0, 3], julia: [0, 0, 3.2] }; // centre re, centre im, width
  let c = [-0.123, 0.745], dirty = true;

  const ui = bindUI(section, {
    onChange() { dirty = true; },
    actions: {
      c(btn) { c = btn.dataset.v.split(',').map(Number); ui.set('mode', 'julia'); dirty = true; },
    },
  });

  const toPlane = (p, [cx, cy, size]) => [cx + (p[0] / W - 0.5) * size, cy - (p[1] / W - 0.5) * size];
  const toCanvas = ([re, im], [cx, cy, size]) => [((re - cx) / size + 0.5) * W, (0.5 - (im - cy) / size) * W];

  function render() {
    const julia = ui.v.mode === 'julia';
    const [cx, cy, size] = VIEW[ui.v.mode];
    const maxIt = ui.v.iter;
    for (let y = 0; y < RES; y++) {
      for (let x = 0; x < RES; x++) {
        const re = cx + (x / RES - 0.5) * size, im = cy - (y / RES - 0.5) * size;
        let zr = julia ? re : 0, zi = julia ? im : 0;
        const cr = julia ? c[0] : re, ci = julia ? c[1] : im;
        let it = 0;
        while (it < maxIt && zr * zr + zi * zi <= 4) {
          const t = zr * zr - zi * zi + cr;
          zi = 2 * zr * zi + ci;
          zr = t;
          it++;
        }
        const o = (y * RES + x) * 4;
        if (it === maxIt) {
          px[o] = px[o + 1] = px[o + 2] = 0; px[o + 3] = 255;   // never escaped: in the set, black ink
        } else {
          px[o] = red[0]; px[o + 1] = red[1]; px[o + 2] = red[2];
          px[o + 3] = Math.max(0, Math.min(255, (Math.sqrt(it / maxIt) - 0.2) * 420)); // escaped late = more red, early = paper
        }
      }
    }
    offCtx.putImageData(image, 0, 0);
  }

  function draw() {
    render();
    clearCanvas(ctx);
    ctx.drawImage(off, 0, 0, W, W);
    if (ui.v.mode === 'mandelbrot') {
      const p = toCanvas(c, VIEW.mandelbrot);
      blob(ctx, p[0], p[1], 8, PALETTE[3], 3);
    }
    const sign = c[1] < 0 ? '−' : '+';
    hud.innerHTML = `c = <b>${c[0].toFixed(3)} ${sign} ${Math.abs(c[1]).toFixed(3)}i</b>`;
  }

  // Dragging always moves c around the Mandelbrot plane, in both views.
  onDrag(canvas, {
    down(p) { c = toPlane(p, VIEW.mandelbrot); dirty = true; },
    move(p) { c = toPlane(p, VIEW.mandelbrot); dirty = true; },
  });

  return {
    frame() { if (dirty) { draw(); dirty = false; } },
  };
});

/* ─────────────────────────── 13 Ulam spiral ─────────────────────────── */
demo('ulam', ({ section, ctx, hud }) => {
  let dirty = true;
  const ui = bindUI(section, {
    format: { cell: v => v + ' px' },
    onChange() { dirty = true; },
    actions: { start(btn) { ui.set('start', Number(btn.dataset.v)); dirty = true; } },
  });

  function draw() {
    clearCanvas(ctx);
    const cell = ui.v.cell, start = ui.v.start;
    let side = Math.floor(W / cell);
    if (side % 2 === 0) side--;                    // odd, so the spiral has a centre cell
    const count = side * side, last = start + count - 1;

    const composite = new Uint8Array(last + 1);    // sieve of Eratosthenes
    composite[0] = composite[1] = 1;
    for (let i = 2; i * i <= last; i++) if (!composite[i]) for (let j = i * i; j <= last; j += i) composite[j] = 1;

    const margin = (W - side * cell) / 2;
    const showNumbers = ui.v.numbers && cell >= 22;
    ctx.font = `${Math.floor(cell * 0.4)}px "Times New Roman", Times, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Walk the square spiral: right 1, up 1, left 2, down 2, right 3, …
    const DX = [1, 0, -1, 0], DY = [0, -1, 0, 1];
    let x = (side - 1) / 2, y = (side - 1) / 2, dir = 0, run = 1, n = start, primes = 0;
    walk: while (true) {
      for (let turn = 0; turn < 2; turn++) {
        for (let s = 0; s < run; s++) {
          if (n > last) break walk;
          const px = margin + x * cell, py = margin + y * cell;
          const prime = !composite[n];
          if (prime) primes++;
          if (showNumbers) {
            ctx.fillStyle = prime ? RED : 'rgba(0,0,0,0.45)';
            ctx.fillText(n, px + cell / 2, py + cell / 2);
          } else if (prime) {
            ctx.fillStyle = INK;
            ctx.fillRect(px, py, cell, cell);
          }
          n++;
          x += DX[dir]; y += DY[dir];
        }
        dir = (dir + 1) % 4;
      }
      run++;
    }
    const c = margin + (side - 1) / 2 * cell;
    ctx.strokeStyle = RED;
    ctx.lineWidth = 2;
    ctx.strokeRect(c, c, cell, cell);
    hud.innerHTML = `<b>${primes.toLocaleString()}</b> primes between <b>${start}</b> and <b>${last.toLocaleString()}</b>`;
  }

  return {
    frame() { if (dirty) { draw(); dirty = false; } },
  };
});

/* ─────────────────────────── 14 Buffon's needle ─────────────────────────── */
demo('buffon', ({ section, ctx, hud }) => {
  const GAP = 60, FIRST = 30, DRAW_LIMIT = 4000;   // lines at y = 30, 90, 150, …
  let thrown = 0, hits = 0, running = true;

  const ui = bindUI(section, {
    format: { len: v => v.toFixed(2) + ' × gap' },
    onChange(k) { if (k === 'len') reset(); },
    actions: {
      toggle(btn) { running = !running; btn.textContent = running ? 'Pause' : 'Play'; },
      reset,
    },
  });

  function reset() {
    thrown = hits = 0;
    clearCanvas(ctx);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let y = FIRST; y < W; y += GAP) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();
  }

  reset();

  return {
    frame() {
      if (!running) return;
      const L = ui.v.len * GAP;
      ctx.lineWidth = 1.5;
      for (let i = 0; i < ui.v.speed; i++) {
        const x = Math.random() * W, y = Math.random() * W, th = Math.random() * Math.PI;
        const dx = Math.cos(th) * L / 2, dy = Math.sin(th) * L / 2;
        // It crosses when both ends sit between different pairs of lines.
        const cross = Math.floor((y - dy - FIRST) / GAP) !== Math.floor((y + dy - FIRST) / GAP);
        thrown++;
        if (cross) hits++;
        if (thrown <= DRAW_LIMIT) {
          ctx.strokeStyle = cross ? RED : INK;
          ctx.beginPath(); ctx.moveTo(x - dx, y - dy); ctx.lineTo(x + dx, y + dy); ctx.stroke();
        }
      }
      const est = hits ? 2 * L * thrown / (GAP * hits) : 0;
      hud.innerHTML = `needles <b>${thrown.toLocaleString()}</b> · crossing <b>${hits.toLocaleString()}</b> · π ≈ <b>${hits ? est.toFixed(5) : '?'}</b>` +
        (hits ? ` (off by ${Math.abs(est - Math.PI).toFixed(5)})` : '');
    },
  };
});

/* ─────────────────────────── 15 Harmonograph ─────────────────────────── */
demo('harmonograph', ({ section, ctx, hud }) => {
  const A = 135, H = 0.01;
  let t = 0, done = false;

  const ui = bindUI(section, {
    format: {
      f1: v => v.toFixed(3), f2: v => v.toFixed(3), f3: v => v.toFixed(3),
      phase: v => (v / Math.PI).toFixed(2) + 'π', rotary: v => v.toFixed(2), damp: v => v.toFixed(4),
    },
    onChange(k) { if (k !== 'speed') restart(); },
    actions: {
      replay: restart,
      random() {
        const near = () => 1 + randInt(4) + (Math.random() - 0.5) * 0.02;   // almost a whole number
        ui.set('f1', near()); ui.set('f2', near()); ui.set('f3', near());
        ui.set('phase', Math.random() * Math.PI);
        ui.set('rotary', Math.random());
        ui.set('damp', 0.001 + Math.random() * 0.005);
        restart();
      },
    },
  });

  // Two pendulums push the pen in x and y; a rotary one swings the paper in a circle. All of them slow down.
  function pen(t) {
    const { f1, f2, f3, phase, rotary, damp } = ui.v;
    const e = A * Math.exp(-damp * t);
    return [
      W / 2 + e * (Math.sin(f1 * t + phase) + rotary * Math.sin(f3 * t)),
      W / 2 + e * (Math.sin(f2 * t) + rotary * Math.cos(f3 * t)),
    ];
  }

  function restart() {
    t = 0;
    done = false;
    clearCanvas(ctx);
  }

  restart();

  return {
    frame(dt) {
      if (done) return;
      ctx.strokeStyle = 'rgba(0,0,0,0.7)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      let p = pen(t);
      ctx.moveTo(p[0], p[1]);
      const end = t + dt * ui.v.speed;
      for (; t < end; t += H) { p = pen(t); ctx.lineTo(p[0], p[1]); }
      ctx.stroke();
      const size = A * Math.exp(-ui.v.damp * t) * (1 + ui.v.rotary);
      if (size < 0.5) done = true;
      hud.innerHTML = `t = <b>${t.toFixed(0)}</b> · swing <b>${size.toFixed(1)} px</b>` + (done ? ' · stopped' : '');
    },
  };
});

/* ─────────────────────────── Main loop ─────────────────────────── */
let lastTime = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  for (const d of demos) if (d.visible) d.frame(dt);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
