'use strict';

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
