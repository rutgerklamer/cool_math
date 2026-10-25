# Cool Math
Fifteen math visualisations you can fool around with, all on one page.

Live: https://rutgerklamer.github.io/cool_math/

| # | Visualisation | What you can do | Explanation |
|---|---------------|-----------------|-------------|
| 01 | Fibonacci modulus | Presets, any modulus/multiplier/start, exact cycle detection, sound | [YouTube](https://www.youtube.com/watch?v=o1eLKODSCqw) |
| 02 | Golden ratio | Sunflower phyllotaxis, irrational-angle presets, animated drift | [YouTube](https://www.youtube.com/watch?v=sj8Sg8qnjOg) |
| 03 | Beautiful trigonometry | Tusi couple: balls on straight lines that roll in a circle | [YouTube](https://www.youtube.com/watch?v=snHKEpCv0Hk) |
| 04 | Cellular automata | Life, HighLife, Day & Night, Seeds, Brian's Brain; draw on the grid | [YouTube](https://www.youtube.com/watch?v=R9Plq-D1gEk) |
| 05 | Double pendulum | RK4 physics, drag the weights, "chaos twins" | [YouTube](https://www.youtube.com/watch?v=uWzPe_S-RVE) |
| 06 | Toothpicks | OEIS A139250 growth with live counter | [YouTube](https://www.youtube.com/watch?v=_UtCli1SgjI&t=90s) |
| 07 | Chaos game | Draggable vertices, fractal presets, restricted vertex rules | [YouTube](https://www.youtube.com/watch?v=kbKtFN71Lfs) |
| 08 | Magic highway | Euler line, nine-point circle and incircle of any triangle | [YouTube](https://www.youtube.com/watch?v=wVH4MS6v23U) |
| 09 | Times tables | Point n to point n × k on a circle; cardioids, nephroids, auto count | |
| 10 | Recamán sequence | Back if you can, forward if you can't, as half circles; with sound | |
| 11 | Langton's ant | Classic RL ant and multi-colour turmites | |
| 12 | Mandelbrot & Julia | Drag c around the Mandelbrot set, see its Julia set live | |
| 13 | Ulam spiral | Primes on a square spiral; start at 41 for Euler's diagonal | |
| 14 | Buffon's needle | Estimate π by throwing needles on lined paper | |
| 15 | Harmonograph | Damped pendulums drawing with a pen | |

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
