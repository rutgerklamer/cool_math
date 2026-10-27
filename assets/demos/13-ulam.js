'use strict';

/* ─────────────────────────── 13 Ulam spiral ─────────────────────────── */
demo('ulam', ({ section, ctx, hud }) => {
  let dirty = true;
  const ui = bindUI(section, {
    format: { cell: v => v + ' px' },
    onChange() { dirty = true; },
    actions: { start(btn) { ui.set('start', Number(btn.dataset.v)); dirty = true; } },
  });

  function draw() {
    clearCanvas(ctx);
    const cell = ui.v.cell, start = ui.v.start;
    let side = Math.floor(W / cell);
    if (side % 2 === 0) side--;                    // odd, so the spiral has a centre cell
    const count = side * side, last = start + count - 1;

    const composite = new Uint8Array(last + 1);    // sieve of Eratosthenes
    composite[0] = composite[1] = 1;
    for (let i = 2; i * i <= last; i++) if (!composite[i]) for (let j = i * i; j <= last; j += i) composite[j] = 1;

    const margin = (W - side * cell) / 2;
    const showNumbers = ui.v.numbers && cell >= 22;
    ctx.font = `${Math.floor(cell * 0.4)}px "Times New Roman", Times, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Walk the square spiral: right 1, up 1, left 2, down 2, right 3, …
    const DX = [1, 0, -1, 0], DY = [0, -1, 0, 1];
    let x = (side - 1) / 2, y = (side - 1) / 2, dir = 0, run = 1, n = start, primes = 0;
    walk: while (true) {
      for (let turn = 0; turn < 2; turn++) {
        for (let s = 0; s < run; s++) {
          if (n > last) break walk;
          const px = margin + x * cell, py = margin + y * cell;
          const prime = !composite[n];
          if (prime) primes++;
          if (showNumbers) {
            ctx.fillStyle = prime ? RED : 'rgba(0,0,0,0.45)';
            ctx.fillText(n, px + cell / 2, py + cell / 2);
          } else if (prime) {
            ctx.fillStyle = INK;
            ctx.fillRect(px, py, cell, cell);
          }
          n++;
          x += DX[dir]; y += DY[dir];
        }
        dir = (dir + 1) % 4;
      }
      run++;
    }
    const c = margin + (side - 1) / 2 * cell;
    ctx.strokeStyle = RED;
    ctx.lineWidth = 2;
    ctx.strokeRect(c, c, cell, cell);
    hud.innerHTML = `<b>${primes.toLocaleString()}</b> primes between <b>${start}</b> and <b>${last.toLocaleString()}</b>`;
  }

  return {
    frame() { if (dirty) { draw(); dirty = false; } },
  };
});
