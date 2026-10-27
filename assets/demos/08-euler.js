'use strict';

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
