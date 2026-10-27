'use strict';

/* ─────────────────────────── 10 Recamán sequence ─────────────────────────── */
demo('recaman', ({ section, ctx, hud }) => {
  // Precompute: step n goes back n if that's positive and unvisited, otherwise forward n.
  const seq = [0], used = new Set([0]);
  for (let i = 1; i < 1000; i++) {
    const back = seq[i - 1] - i;
    const v = back > 0 && !used.has(back) ? back : seq[i - 1] + i;
    seq.push(v);
    used.add(v);
  }
  let shown = 1, lastCount = 1;

  const ui = bindUI(section, {
    onChange(k) {
      if (k === 'sound' && ui.v.sound) unlockAudio();
      if (k === 'terms') shown = Math.min(shown, ui.v.terms);
    },
    actions: { replay() { shown = 1; lastCount = 1; } },
  });

  return {
    frame(dt) {
      if (shown < ui.v.terms) shown = Math.min(ui.v.terms, shown + dt * ui.v.speed);
      const count = Math.floor(shown);
      if (ui.v.sound && count > lastCount) beep(pentatonic((seq[count - 1] % 50) / 50), 0.4);
      lastCount = count;

      // Zoom out as the sequence grows, so the furthest jump always fits.
      let top = 1;
      for (let i = 0; i < count; i++) top = Math.max(top, seq[i]);
      const x = v => 20 + v * (W - 40) / top;

      clearCanvas(ctx);
      for (let i = 1; i < count; i++) {
        const a = x(seq[i - 1]), b = x(seq[i]);
        const newest = i === count - 1;
        ctx.strokeStyle = newest ? RED : INK;
        ctx.lineWidth = newest ? 3 : 1.5;
        ctx.beginPath();
        ctx.arc((a + b) / 2, W / 2, Math.abs(b - a) / 2, i % 2 ? Math.PI : 0, i % 2 ? TAU : Math.PI); // odd jumps above, even below
        ctx.stroke();
      }
      hud.innerHTML = `a(<b>${count - 1}</b>) = <b>${seq[count - 1]}</b>`;
    },
  };
});
