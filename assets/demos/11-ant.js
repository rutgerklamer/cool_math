'use strict';

/* ─────────────────────────── 11 Langton's ant ─────────────────────────── */
demo('ant', ({ section, ctx, hud }) => {
  const S = 120, CELL = W / S;
  const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];
  const COLORS = [null, INK, RED, PALETTE[2], PALETTE[1], PALETTE[4], PALETTE[3]];
  let grid, ant, steps, rule, running = true;

  const ui = bindUI(section, {
    onChange(k) { if (k === 'rule') reset(); },
    actions: {
      toggle(btn) { running = !running; btn.textContent = running ? 'Pause' : 'Play'; },
      reset,
    },
  });

  function reset() {
    grid = new Uint8Array(S * S);
    ant = { x: S / 2, y: S / 2, d: 0 };
    steps = 0;
    rule = ui.v.rule;
  }

  // Turn by the cell's colour, bump the colour to the next one, step forward. The grid wraps around.
  function tick() {
    const i = ant.y * S + ant.x, s = grid[i];
    ant.d = mod(ant.d + (rule[s] === 'R' ? 1 : -1), 4);
    grid[i] = (s + 1) % rule.length;
    ant.x = mod(ant.x + DX[ant.d], S);
    ant.y = mod(ant.y + DY[ant.d], S);
    steps++;
  }

  reset();

  return {
    frame() {
      if (running) for (let i = 0; i < ui.v.speed; i++) tick();
      clearCanvas(ctx);
      for (let i = 0; i < grid.length; i++) {
        const s = grid[i];
        if (!s) continue;
        ctx.fillStyle = COLORS[1 + (s - 1) % (COLORS.length - 1)];
        ctx.fillRect((i % S) * CELL, Math.floor(i / S) * CELL, CELL, CELL);
      }
      blob(ctx, (ant.x + 0.5) * CELL, (ant.y + 0.5) * CELL, 4, RED, 1.5);
      hud.innerHTML = `step <b>${steps.toLocaleString()}</b> · rule <b>${rule}</b>`;
    },
  };
});
