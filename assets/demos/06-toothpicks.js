'use strict';

/* ─────────────────────────── 06 Toothpicks ─────────────────────────── */
demo('toothpicks', ({ section, ctx, hud }) => {
  // Grid units: a toothpick has length 2 and covers its centre plus both ends.
  let occ, last, gen, total, done, reach, running = true, acc = 0;

  const ui = bindUI(section, {
    format: { len: v => v + ' px', speed: v => v, width: v => v.toFixed(1) },
    onChange(k) { if (k !== 'speed') rebuild(gen); },
    actions: {
      toggle(btn) { running = !running; btn.textContent = running ? 'Pause' : 'Play'; },
      step() { if (!done) grow(); },
      reset() { rebuild(1); },
    },
  });

  const key = (x, y) => (x + 4096) * 8192 + (y + 4096);
  // The pattern spreads roughly one unit every two generations, so this is ~where it meets the edge.
  const maxGen = () => 2 * Math.floor((W / 2 - 10) / (ui.v.len / 2));

  function rebuild(target) {
    occ = new Map(); last = []; gen = 0; total = 0; reach = 0; done = false;
    clearCanvas(ctx);
    const goal = Math.max(1, Math.min(target, maxGen()));
    while (gen < goal && !done) grow();
  }

  function place(x, y, horizontal) {
    const [dx, dy] = horizontal ? [1, 0] : [0, 1];
    for (const s of [-1, 0, 1]) {
      const k = key(x + s * dx, y + s * dy);
      occ.set(k, (occ.get(k) || 0) + 1);
    }
    return { x, y, horizontal };
  }

  function grow() {
    gen++;
    const candidates = gen === 1 ? [[0, 0]] : [];
    for (const t of last) {
      const [dx, dy] = t.horizontal ? [1, 0] : [0, 1];
      for (const s of [-1, 1]) {
        const ex = t.x + s * dx, ey = t.y + s * dy;
        if (occ.get(key(ex, ey)) === 1) candidates.push([ex, ey]); // touched by nothing else = exposed
      }
    }
    const horizontal = gen % 2 === 1;
    const previous = last;
    last = candidates.map(([x, y]) => place(x, y, horizontal));
    total += last.length;

    stroke(previous, INK); // the previous "newest" generation turns black…
    stroke(last, RED);     // …and the one just added is red
    for (const t of last) reach = Math.max(reach, Math.abs(t.x) + 1, Math.abs(t.y) + 1);
    if ((reach + 1) * ui.v.len / 2 > W / 2 - 6 || !last.length) done = true;
  }

  function stroke(picks, color) {
    const unit = ui.v.len / 2;
    ctx.strokeStyle = color;
    ctx.lineWidth = ui.v.width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (const t of picks) {
      const cx = W / 2 + t.x * unit, cy = W / 2 + t.y * unit;
      if (t.horizontal) { ctx.moveTo(cx - unit, cy); ctx.lineTo(cx + unit, cy); }
      else { ctx.moveTo(cx, cy - unit); ctx.lineTo(cx, cy + unit); }
    }
    ctx.stroke();
  }

  rebuild(1);

  return {
    frame(dt) {
      if (running && !done) {
        acc += dt * ui.v.speed;
        while (acc >= 1 && !done) { grow(); acc--; }
      }
      hud.innerHTML = `generation <b>${gen}</b> · toothpicks <b>${total.toLocaleString()}</b> · new <b>${last.length}</b>` + (done ? ' · edge reached' : '');
    },
  };
});
