'use strict';

/* ─────────────────────────── 12 Mandelbrot & Julia ─────────────────────────── */
demo('julia', ({ section, canvas, ctx, hud }) => {
  const RES = 300;
  const off = document.createElement('canvas');
  off.width = off.height = RES;
  const offCtx = off.getContext('2d');
  const image = offCtx.createImageData(RES, RES);
  const px = image.data;
  const red = hexToRgb(RED);
  const VIEW = { mandelbrot: [-0.6, 0, 3], julia: [0, 0, 3.2] }; // centre re, centre im, width
  let c = [-0.123, 0.745], dirty = true;

  const ui = bindUI(section, {
    onChange() { dirty = true; },
    actions: {
      c(btn) { c = btn.dataset.v.split(',').map(Number); ui.set('mode', 'julia'); dirty = true; },
    },
  });

  const toPlane = (p, [cx, cy, size]) => [cx + (p[0] / W - 0.5) * size, cy - (p[1] / W - 0.5) * size];
  const toCanvas = ([re, im], [cx, cy, size]) => [((re - cx) / size + 0.5) * W, (0.5 - (im - cy) / size) * W];

  function render() {
    const julia = ui.v.mode === 'julia';
    const [cx, cy, size] = VIEW[ui.v.mode];
    const maxIt = ui.v.iter;
    for (let y = 0; y < RES; y++) {
      for (let x = 0; x < RES; x++) {
        const re = cx + (x / RES - 0.5) * size, im = cy - (y / RES - 0.5) * size;
        let zr = julia ? re : 0, zi = julia ? im : 0;
        const cr = julia ? c[0] : re, ci = julia ? c[1] : im;
        let it = 0;
        while (it < maxIt && zr * zr + zi * zi <= 4) {
          const t = zr * zr - zi * zi + cr;
          zi = 2 * zr * zi + ci;
          zr = t;
          it++;
        }
        const o = (y * RES + x) * 4;
        if (it === maxIt) {
          px[o] = px[o + 1] = px[o + 2] = 0; px[o + 3] = 255;   // never escaped: in the set, black ink
        } else {
          px[o] = red[0]; px[o + 1] = red[1]; px[o + 2] = red[2];
          px[o + 3] = Math.max(0, Math.min(255, (Math.sqrt(it / maxIt) - 0.2) * 420)); // escaped late = more red, early = paper
        }
      }
    }
    offCtx.putImageData(image, 0, 0);
  }

  function draw() {
    render();
    clearCanvas(ctx);
    ctx.drawImage(off, 0, 0, W, W);
    if (ui.v.mode === 'mandelbrot') {
      const p = toCanvas(c, VIEW.mandelbrot);
      blob(ctx, p[0], p[1], 8, PALETTE[3], 3);
    }
    const sign = c[1] < 0 ? '−' : '+';
    hud.innerHTML = `c = <b>${c[0].toFixed(3)} ${sign} ${Math.abs(c[1]).toFixed(3)}i</b>`;
  }

  // Dragging always moves c around the Mandelbrot plane, in both views.
  onDrag(canvas, {
    down(p) { c = toPlane(p, VIEW.mandelbrot); dirty = true; },
    move(p) { c = toPlane(p, VIEW.mandelbrot); dirty = true; },
  });

  return {
    frame() { if (dirty) { draw(); dirty = false; } },
  };
});
