# Cool Math
The goal of this project is to visualise some cool mathematical phenomenon. Although this project is cool as fuck do not mind the (sometimes) bad code and spelling mistakes.

| Projects      | demo           | Explenation  |
| ------------- |:-------------:| -----:|
| Fibonacci modulus     | [Demo](https://rutgerklamer.github.io/cool_math/#fibonacci) |[Youtube](https://www.youtube.com/watch?v=o1eLKODSCqw) |
| Golden ratio     | [Demo](https://rutgerklamer.github.io/cool_math/#golden) |[Youtube](https://www.youtube.com/watch?v=sj8Sg8qnjOg) |
| Beautiful trigonometry     | [Demo](https://rutgerklamer.github.io/cool_math/#trig) |[Youtube](https://www.youtube.com/watch?v=snHKEpCv0Hk) |
| Cellular automata     | [Demo](https://rutgerklamer.github.io/cool_math/#life) |[Youtube](https://www.youtube.com/watch?v=R9Plq-D1gEk) |
| Pendulum     | [Demo](https://rutgerklamer.github.io/cool_math/#pendulum) |[Youtube](https://www.youtube.com/watch?v=uWzPe_S-RVE) |
| Toothpicks     | [Demo](https://rutgerklamer.github.io/cool_math/#toothpicks) |[Youtube](https://www.youtube.com/watch?v=_UtCli1SgjI&t=90s) |
| Chaos game      | [Demo](https://rutgerklamer.github.io/cool_math/#chaos) |[Youtube](https://www.youtube.com/watch?v=kbKtFN71Lfs) |
| Magic highway      | [Demo](https://rutgerklamer.github.io/cool_math/#euler) |[Youtube](https://www.youtube.com/watch?v=wVH4MS6v23U) |
| Times tables     | [Demo](https://rutgerklamer.github.io/cool_math/#times) |[Youtube](https://www.youtube.com/watch?v=qhbuKbxJsk8) |
| Recamán sequence     | [Demo](https://rutgerklamer.github.io/cool_math/#recaman) |[Youtube](https://www.youtube.com/watch?v=FGC5TdIiT9U) |
| Langton's ant     | [Demo](https://rutgerklamer.github.io/cool_math/#ant) |[Youtube](https://www.youtube.com/watch?v=NWBToaXK5T0) |
| Mandelbrot & Julia     | [Demo](https://rutgerklamer.github.io/cool_math/#julia) |[Youtube](https://www.youtube.com/watch?v=NGMRB4O922I) |
| Ulam spiral     | [Demo](https://rutgerklamer.github.io/cool_math/#ulam) |[Youtube](https://www.youtube.com/watch?v=iFuR97YcSLM) |
| Buffon's needle     | [Demo](https://rutgerklamer.github.io/cool_math/#buffon) |[Youtube](https://www.youtube.com/watch?v=sJVivjuMfWA) |
| Harmonograph     | [Demo](https://rutgerklamer.github.io/cool_math/#harmonograph) |[Youtube](https://www.youtube.com/watch?v=H4YQonwQUDs) |

## The repo

| File | What it is |
| ---- | ---------- |
| [index.html](index.html) | The site. Without a hash it shows the home page; `#fibonacci`, `#ant` and so on open one visualisation. |
| [assets/core.js](assets/core.js) | What every visualisation shares: canvas setup, sliders and buttons, dragging, sound, the main loop and the router. |
| [assets/demos](assets/demos) | One file per visualisation, `01-fibonacci.js` to `15-harmonograph.js`. |
| [assets/app.css](assets/app.css) | The paper, the Times and the clumsy buttons. |
| [fibonacci_modulus](fibonacci_modulus), [golden_ratio](golden_ratio), [beautiful_trigonometry](beautiful_trigonometry), [cellular_automata](cellular_automata), [pendulum](pendulum), [toothpicks](toothpicks), [chaos_game](chaos_game), [magic_highway](magic_highway) | The old p5.js versions of the first eight. They still work. |
| [style.css](style.css), [background.jpg](background.jpg) | The stylesheet of the old versions, and the paper everything is drawn on. |

## Hosting
It's a static site, so GitHub Pages serves it straight from the root of `main` (Settings → Pages → Deploy from a branch). `.nojekyll` tells Pages to serve the files as they are.

## Running locally
No build step and no dependencies — plain HTML, CSS and canvas JavaScript.

```bash
python -m http.server 8080
```

Then open http://localhost:8080.

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
