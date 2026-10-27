'use strict';

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
