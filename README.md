# Cool Math
Fifteen math visualisations you can fool around with, all on one page.

Live: https://rutgerklamer.github.io/cool_math/

Most of these started as a Numberphile video. Go watch them, they explain it better than we do.

| # | Visualisation | Numberphile | Also worth a watch |
|---|---------------|-------------|--------------------|
| 01 | [Fibonacci modulus](https://rutgerklamer.github.io/cool_math/#fibonacci) | [Fibonacci Mystery](https://www.youtube.com/watch?v=Nu-lW-Ifyec) | [A New Way to Look at Fibonacci Numbers](https://www.youtube.com/watch?v=o1eLKODSCqw) (Jacob Yatsko) |
| 02 | [Golden ratio](https://rutgerklamer.github.io/cool_math/#golden) | [The Golden Ratio (why it is so irrational)](https://www.youtube.com/watch?v=sj8Sg8qnjOg) | |
| 03 | [Beautiful trigonometry](https://rutgerklamer.github.io/cool_math/#trig) | [Beautiful Trigonometry](https://www.youtube.com/watch?v=snHKEpCv0Hk) | |
| 04 | [Cellular automata](https://rutgerklamer.github.io/cool_math/#life) | [Inventing Game of Life (John Conway)](https://www.youtube.com/watch?v=R9Plq-D1gEk) | |
| 05 | [Double pendulum](https://rutgerklamer.github.io/cool_math/#pendulum) | none | [Coding Challenge 93: Double Pendulum](https://www.youtube.com/watch?v=uWzPe_S-RVE) (The Coding Train), [Double Pendulums are Chaoticn't](https://www.youtube.com/watch?v=dtjb2OhEQcU) (2swap) |
| 06 | [Toothpicks](https://rutgerklamer.github.io/cool_math/#toothpicks) | [Terrific Toothpick Patterns](https://www.youtube.com/watch?v=_UtCli1SgjI&t=90s) | |
| 07 | [Chaos game](https://rutgerklamer.github.io/cool_math/#chaos) | [Chaos Game](https://www.youtube.com/watch?v=kbKtFN71Lfs) | |
| 08 | [Magic highway](https://rutgerklamer.github.io/cool_math/#euler) | [Triangles have a Magic Highway](https://www.youtube.com/watch?v=wVH4MS6v23U) | |
| 09 | [Times tables](https://rutgerklamer.github.io/cool_math/#times) | none | [Times Tables, Mandelbrot and the Heart of Mathematics](https://www.youtube.com/watch?v=qhbuKbxJsk8) (Mathologer) |
| 10 | [Recamán sequence](https://rutgerklamer.github.io/cool_math/#recaman) | [The Slightly Spooky Recamán Sequence](https://www.youtube.com/watch?v=FGC5TdIiT9U) | |
| 11 | [Langton's ant](https://rutgerklamer.github.io/cool_math/#ant) | [Langton's Ant](https://www.youtube.com/watch?v=NWBToaXK5T0) | |
| 12 | [Mandelbrot & Julia](https://rutgerklamer.github.io/cool_math/#julia) | [The Mandelbrot Set](https://www.youtube.com/watch?v=NGMRB4O922I), [What's so special about the Mandelbrot Set?](https://www.youtube.com/watch?v=FFftmWSzgmk) | |
| 13 | [Ulam spiral](https://rutgerklamer.github.io/cool_math/#ulam) | [Prime Spirals](https://www.youtube.com/watch?v=iFuR97YcSLM) | |
| 14 | [Buffon's needle](https://rutgerklamer.github.io/cool_math/#buffon) | [Pi and Buffon's Matches](https://www.youtube.com/watch?v=sJVivjuMfWA) | |
| 15 | [Harmonograph](https://rutgerklamer.github.io/cool_math/#harmonograph) | none | [Three Pendulum Rotary Harmonograph](https://www.youtube.com/watch?v=H4YQonwQUDs) (Karl Sims) |

"none" means Numberphile hasn't made one, as far as we could find.

## Hosting
It's a static site, so GitHub Pages serves it straight from the root of `main` (Settings → Pages → Deploy from a branch). `.nojekyll` tells Pages to serve the files as they are.

## Running locally
No build step and no dependencies — plain HTML, CSS and canvas JavaScript.

```bash
python -m http.server 8080
```

Then open http://localhost:8080. The original per-demo p5.js pages are still in their folders.

The MIT License (MIT)
=====================

Copyright © 2021 Rutger Klamer

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the “Software”), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
