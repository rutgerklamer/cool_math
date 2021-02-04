let width = 700;
let height = 700;
let radius = width/2-10;
let centerX = width/2;
let centerY = height/2;
let lineWeight = 1;
let osc, playing, freq, amp, env;

let attackLevel = 1;
let releaseLevel = 0;

let attackTime = 0.01;
let decayTime = 0.1;
let susPercent = 0.5;
let releaseTime = 0.1;
let steps = 0;


let curAngle, prevAngle, prevPrevAngle, haveRepeated, divider, fib, sequence, multiplyFib;

function setup() {
  prevAngle = 0;
  prevPrevAngle = 0;
  createCanvas(width, height).position(screen.width/4, 25, 'absolute');
  background(0,0,0,0);
  strokeWeight(5)
  stroke(0,0,0);
  noFill();
  ellipse(width/2, height/2, radius*2, radius*2);
  osc = new p5.Oscillator('triangle');
  osc.stop();
  env = new p5.Env();
  env.setADSR(attackTime, decayTime, susPercent, releaseTime);
  osc.amp(env);
  osc.start();
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
  osc.start();
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

function switchSound() {
  osc.start();
  playing = !playing;
}

function changeStroke(sweight) {
  lineWeight = sweight;
  setup();
}

function playOscillator() {
  osc.start();
  playing = true;
}

function draw() {
    if (checkRepeated(sequence) || haveRepeated) {
      osc.stop();
      strokeWeight(5)
      stroke(0,255,0);
      noFill();
      ellipse(width/2, height/2, radius*2, radius*2);
      curAngle = prevAngle = prevPrevAngle = 0;
      haveRepeated = true;
      return;
    }
    steps++;
    if (steps > 10-document.getElementById("speed").value) {
      for (i = 0; i < document.getElementById("speed").value; i++) {
      steps = 0;
      if (multiplyFib > 0) {
        fib.push(Big(fib[fib.length-1].add(fib[fib.length-2].times(multiplyFib))))
    } else {
      fib.push(Big(fib[fib.length-1].add(fib[fib.length-2])));
    }
    let num = fib[fib.length-1].mod(divider).toNumber()
    sequence += num;
    if (playing) {
        freq = pow(2, (floor(map(num, 0, divider, 0, 126)) - 49) / 12) * 220
        osc.freq(freq);
        env.play();
      }
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

}

function checkRepeated(str) {
    return (str + str).indexOf(str, 1) !== str.length;
}
