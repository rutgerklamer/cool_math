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
  section.querySelector('.panel').insertAdjacentHTML('beforeend', '<a class="home" href="#">Go home</a>');
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

/* ─────────────────────────── One view at a time ─────────────────────────── */

// #fibonacci, #ant, … opens that one section; no hash (or an unknown one) shows the home page.
// Only the open demo runs; the visibility observer still pauses it while it's scrolled out of view.
function startRouter() {
  const home = document.getElementById('home');
  const sections = [...document.querySelectorAll('.demo')];
  const title = s => s.querySelector('h2').textContent;

  sections.forEach((s, i) => {
    const prev = sections[(i - 1 + sections.length) % sections.length];
    const next = sections[(i + 1) % sections.length];
    s.insertAdjacentHTML('beforeend',
      `<nav class="pager"><a href="#${prev.id}">← ${title(prev)}</a><a href="#${next.id}">${title(next)} →</a></nav>`);
  });

  function show() {
    const open = sections.find(s => '#' + s.id === location.hash);
    home.hidden = Boolean(open);
    sections.forEach(s => {
      s.classList.toggle('open', s === open);
      s._demo.visible = s === open; // right away; the observer only reports a frame or more later
    });
    document.title = open ? `${title(open)} · Cool Math` : 'Cool Math';
    window.scrollTo(0, 0);
  }

  addEventListener('hashchange', show);
  show();
}

// Runs after every demo script below core.js has registered itself.
addEventListener('DOMContentLoaded', startRouter);

/* ─────────────────────────── Main loop ─────────────────────────── */
let lastTime = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  for (const d of demos) if (d.visible) d.frame(dt);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
