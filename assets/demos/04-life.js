'use strict';

/* ─────────────────────────── 04 Cellular automata ─────────────────────────── */
demo('life', ({ section, canvas, ctx, hud }) => {
  const S = 75, CELL = W / S;
  let grid = new Uint8Array(S * S), next = new Uint8Array(S * S);
  let running = true, acc = 0, gen = 0, brain = false;
  let birth = [], survive = [];

  const ui = bindUI(section, {
    onChange(k) { if (k === 'rule') setRule(); },
    actions: {
      toggle(btn) { running = !running; btn.textContent = running ? 'Pause' : 'Play'; },
      step() { tick(); },
      randomize,
      clear() { grid.fill(0); gen = 0; },
    },
  });

  function setRule() {
    brain = ui.v.rule === 'brain';
    if (!brain) {
      const [, b, s] = ui.v.rule.match(/B(\d*)\/S(\d*)/);
      birth = Array.from({ length: 9 }, (_, i) => b.includes(i));
      survive = Array.from({ length: 9 }, (_, i) => s.includes(i));
      for (let i = 0; i < grid.length; i++) if (grid[i] === 2) grid[i] = 0; // no "dying" state in B/S rules
    }
  }

  function randomize() {
    for (let i = 0; i < grid.length; i++) grid[i] = Math.random() < ui.v.density ? 1 : 0;
    gen = 0;
  }

  // Toroidal neighbourhood: the grid wraps around at the edges. Only state 1 counts as alive.
  function tick() {
    for (let y = 0; y < S; y++) {
      const ym = mod(y - 1, S) * S, y0 = y * S, yp = mod(y + 1, S) * S;
      for (let x = 0; x < S; x++) {
        const xm = mod(x - 1, S), xp = mod(x + 1, S);
        const n = (grid[ym + xm] & 1) + (grid[ym + x] & 1) + (grid[ym + xp] & 1)
          + (grid[y0 + xm] & 1) + (grid[y0 + xp] & 1)
          + (grid[yp + xm] & 1) + (grid[yp + x] & 1) + (grid[yp + xp] & 1);
        const cell = grid[y0 + x];
        next[y0 + x] = brain
          ? (cell === 1 ? 2 : cell === 2 ? 0 : n === 2 ? 1 : 0)
          : (cell ? (survive[n] ? 1 : 0) : (birth[n] ? 1 : 0));
      }
    }
    [grid, next] = [next, grid];
    gen++;
  }

  let paintValue = 1, lastCell = null;
  const cellAt = p => [Math.floor(p[0] / CELL), Math.floor(p[1] / CELL)];
  function paintLine(from, to) {
    const steps = Math.max(Math.abs(to[0] - from[0]), Math.abs(to[1] - from[1]), 1);
    for (let i = 0; i <= steps; i++) {
      const x = Math.round(from[0] + (to[0] - from[0]) * i / steps);
      const y = Math.round(from[1] + (to[1] - from[1]) * i / steps);
      if (x >= 0 && y >= 0 && x < S && y < S) grid[y * S + x] = paintValue;
    }
  }
  onDrag(canvas, {
    down(p) {
      const c = cellAt(p);
      paintValue = grid[c[1] * S + c[0]] ? 0 : 1;
      paintLine(c, c);
      lastCell = c;
    },
    move(p) { const c = cellAt(p); paintLine(lastCell, c); lastCell = c; },
  });

  setRule();
  randomize();

  return {
    frame(dt) {
      if (running) {
        acc += dt * ui.v.speed;
        for (let i = 0; acc >= 1 && i < 4; i++) { tick(); acc--; }
        acc = Math.min(acc, 1);
      }
      ctx.fillStyle = PAPER;
      ctx.fillRect(0, 0, W, W);
      let pop = 0;
      for (let i = 0; i < grid.length; i++) {
        const cell = grid[i];
        if (!cell) continue;
        if (cell === 1) pop++;
        ctx.fillStyle = cell === 1 ? INK : RED;
        ctx.fillRect((i % S) * CELL, Math.floor(i / S) * CELL, CELL, CELL);
      }
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i <= S; i++) {
        ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, W);
        ctx.moveTo(0, i * CELL); ctx.lineTo(W, i * CELL);
      }
      ctx.stroke();
      hud.innerHTML = `generation <b>${gen}</b> · population <b>${pop}</b>`;
    },
  };
});
