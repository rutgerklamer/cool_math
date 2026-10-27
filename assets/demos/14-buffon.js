'use strict';

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
