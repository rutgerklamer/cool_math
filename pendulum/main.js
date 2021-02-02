let width = 700;
let height = 700;
let pendulum1Length = height/4;
let pendulum2Length = height/5;
let weight1 = 10;
let weight2 = 10;
let a1 = 0;
let a2 = 0;
let a1_v = 0;
let a2_v = 0;
let gravity = 1.5;

let px2 = -1;
let py2 = -1;
let cx, cy;

let buffer;


function resetPendulum() {
  a1 = 0;
  a2 = 0;
  a1_v = 0;
  a2_v = 0;
  px2 = -1;
  px1 = -1;
  setup();
}

function changeGravity(g) {
  gravity = g;
}

function setup() {
  createCanvas(width, height).position(screen.width/4, 25, 'absolute');
  background(getComputedStyle(document.documentElement).getPropertyValue('--bgColor'))
  pixelDensity(1);
  a1 = Math.PI / 2;
  a2 = Math.PI / 2;
  cx = width / 2;
  cy = 50;
  buffer = createGraphics(width, height);
  buffer.translate(cx, cy);
}

function draw() {
  pendulum1Length = height*document.getElementById("pen1").value/250;
  pendulum2Length = height*document.getElementById("pen2").value/250;
  let weight1 = document.getElementById("we1").value/5;
  let weight2 = document.getElementById("we2").value/5;

  clear()
  imageMode(CORNER);
  image(buffer, 0, 0, width, height);

  let num1 = -gravity * (2 * weight1 + weight2) * sin(a1);
  let num2 = -weight2 * gravity * sin(a1 - 2 * a2);
  let num3 = -2 * sin(a1 - a2) * weight2;
  let num4 = a2_v * a2_v * pendulum2Length + a1_v * a1_v * pendulum1Length * cos(a1 - a2);
  let den = pendulum1Length * (2 * weight1 + weight2 - weight2 * cos(2 * a1 - 2 * a2));
  let a1_a = (num1 + num2 + num3 * num4) / den;

  num1 = 2 * sin(a1 - a2);
  num2 = (a1_v * a1_v * pendulum1Length * (weight1 + weight2));
  num3 = gravity * (weight1 + weight2) * cos(a1);
  num4 = a2_v * a2_v * pendulum2Length * weight2 * cos(a1 - a2);
  den = pendulum2Length * (2 * weight1 + weight2 - weight2 * cos(2 * a1 - 2 * a2));
  let a2_a = (num1 * (num2 + num3 + num4)) / den;

  translate(cx, cy);
  stroke(0);
  strokeWeight(2);

  let x1 = pendulum1Length * sin(a1);
  let y1 = pendulum1Length * cos(a1);

  let x2 = x1 + pendulum2Length * sin(a2);
  let y2 = y1 + pendulum2Length * cos(a2);

  line(0, 0, x1, y1);
  fill(254,255,12);
  ellipse(x1, y1, weight1, weight1);

  line(x1, y1, x2, y2);
  fill(254,255,12);
  ellipse(x2, y2, weight2, weight2);

  a1_v += a1_a;
  a2_v += a2_a;
  a1 += a1_v;
  a2 += a2_v;


  buffer.stroke(0);
  if (frameCount > 1) {
    buffer.line(px2, py2, x2, y2);
  }

  px2 = x2;
  py2 = y2;
}
