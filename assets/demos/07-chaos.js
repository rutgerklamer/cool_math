'use strict';

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
