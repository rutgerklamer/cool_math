'use strict';

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
