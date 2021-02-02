let width = 700;
let height = 700;
let radius = width/2-10;
let centerX = width/2;
let centerY = height/2;
let lineWeight = 1;


let curAngle, prevAngle, prevPrevAngle, haveRepeated, divider, fib, sequence, multiplyFib;

function setup() {
  createCanvas(width, height).position(screen.width/4, 25, 'absolute');
  background(getComputedStyle(document.documentElement).getPropertyValue('--bgColor'))
  strokeWeight(5)
  stroke(0,0,0);
  fill(getComputedStyle(document.documentElement).getPropertyValue('--bgColor'));
  ellipse(width/2, height/2, radius*2, radius*2);
  start();
}

function start() {
  strokeWeight(lineWeight)
  stroke(0,0,0);
  fib = [Big(document.getElementById("fibstart").value.split(":")[0]),Big(document.getElementById("fibstart").value.split(":")[1])]
  sequence = "";
  haveRepeated = false;
  divider = document.getElementById("divider").value;
  multiplyFib = document.getElementById("multiplier").value;
}

function butt() {
  /* old
  document.getElementById("divider").value = 2529
  document.getElementById("multiplier").value = 2;
  document.getElementById("fibstart").value = "0:1"; */
  document.getElementById("divider").value = 737
  document.getElementById("multiplier").value = 2;
  document.getElementById("fibstart").value = "9:3";

  setup();
}
function shrek() {
  document.getElementById("divider").value = 972
  document.getElementById("multiplier").value = 682;
  document.getElementById("fibstart").value = "5:2";
  setup();
}
function jg() {
  document.getElementById("divider").value = 972
  document.getElementById("multiplier").value = 164;
  document.getElementById("fibstart").value = "5:2";
  setup();
}
function grid() {
  document.getElementById("divider").value = 972
  document.getElementById("multiplier").value = 168;
  document.getElementById("fibstart").value = "5:2";
  setup();
}

function straight() {
  document.getElementById("divider").value = 254
  document.getElementById("multiplier").value = 817;
  document.getElementById("fibstart").value = "0:1";
  setup();
}

function infinite() {
  document.getElementById("divider").value = 376
  document.getElementById("multiplier").value = 854;
  document.getElementById("fibstart").value = "9:10";
  setup();
}

function mandala() {
  document.getElementById("divider").value = 688
  document.getElementById("multiplier").value = 662;
  document.getElementById("fibstart").value = "2:8";
  setup();
}

function randomShape() {
  document.getElementById("divider").value = Math.floor(random(1000));
  document.getElementById("multiplier").value = Math.floor(random(1000));
  document.getElementById("fibstart").value = Math.floor(random(10)+1) + ":" + Math.floor(random(10)+1);
  setup();
}

function perfectCircle() {
  document.getElementById("divider").value = 1244160;
  document.getElementById("multiplier").value = 666;
  document.getElementById("fibstart").value = "2:6";
  setup();
}


function eye() {
  document.getElementById("divider").value = 680;
  document.getElementById("multiplier").value = 670;
  document.getElementById("fibstart").value = "2:2";
  setup();
}

function wow() {
  document.getElementById("divider").value = 675;
  document.getElementById("multiplier").value = 947;
  document.getElementById("fibstart").value = "6:7";
  setup();
}

function changeStroke(sweight) {
  lineWeight = sweight;
}

function draw() {
    if (checkRepeated(sequence) || haveRepeated) {
      strokeWeight(5)
      stroke(0,255,0);
      noFill();
      ellipse(width/2, height/2, radius*2, radius*2);
      curAngle = prevAngle = prevPrevAngle = 0;
      haveRepeated = true;
      return;
    }
    for (i = 0; i < 10; i++) {
    if (multiplyFib > 0) {
      fib.push(Big(fib[fib.length-1].add(fib[fib.length-2].times(multiplyFib))))
  } else {
    fib.push(Big(fib[fib.length-1].add(fib[fib.length-2])));
  }
  let num = fib[fib.length-1].mod(divider).toNumber()
  sequence += num;

  curAngle = 360 / divider * num - 90;



  let curX = centerX + radius * cos(curAngle * (Math.PI/180))
  let curY = centerY + radius * sin(curAngle * (Math.PI/180))

  let prevX = centerX + radius * cos(prevAngle * (Math.PI/180))
  let prevY = centerY + radius * sin(prevAngle * (Math.PI/180))

  let prevPrevX = centerX + radius * cos(prevPrevAngle * (Math.PI/180))
  let prevPrevY = centerY + radius * sin(prevPrevAngle * (Math.PI/180))
  prevPrevAngle = prevAngle;
  prevAngle = curAngle;
  stroke(0,0,0)
  line(prevPrevX, prevPrevY, prevX, prevY);
  stroke(255,255,255)
  line(prevX, prevY, curX, curY);
}
}

function checkRepeated(str) {
    return (str + str).indexOf(str, 1) !== str.length;
}
