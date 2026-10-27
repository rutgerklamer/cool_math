'use strict';

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
