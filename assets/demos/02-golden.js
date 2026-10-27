'use strict';

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
