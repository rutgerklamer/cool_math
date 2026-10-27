'use strict';

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
