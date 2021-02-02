let width = 700;
let height = 700;
let step = 0;
let centerX = width/2;
let centerY = height/2;
let toothpickLength = 20;
let indi = 0;
let time = 0;
let outOfFrame = false;

let next = [[centerX, centerY]];



function setup() {
  createCanvas(width, height).position(screen.width/4, 25, 'absolute');
  background(getComputedStyle(document.documentElement).getPropertyValue('--bgColor'))
  next = [[centerX, centerY]];
  step = 0;
  time = 10;
  outOfFrame = false;
}

function isArrayInArray(arr, item){
  var item_as_string = JSON.stringify(item);
  indi = 0;
  arr.some(function(ele, ind){
    if (JSON.stringify(arr[ind]) == item_as_string) {
      indi = ind;
    }
  });
  return indi;
}

function resetToothpicks() {
  setup();
}

function draw() {
  time += deltaTime / (200-document.getElementById("speed").value);
  if (document.getElementById("length").value != toothpickLength) {
    toothpickLength = document.getElementById("length").value;
    setup();
  }

  if (time > 10 && !outOfFrame) {
    time  = 0;
    stroke(0);
    strokeWeight(document.getElementById("width").value/40);
    let tmp = [];
    step++;
    for (i = 0; i < next.length; i++) {
      if (next[i][0] + toothpickLength/2 > width) {
        console.log("Done")
        outOfFrame = true;
      }
      if (step % 2) {
        line(next[i][0] - (toothpickLength/2), next[i][1], next[i][0] + (toothpickLength/2), next[i][1]);
        let isX = isArrayInArray(tmp, [next[i][0] - (toothpickLength/2), next[i][1]]);
        if (isX == 0) {
          tmp.push([next[i][0] - (toothpickLength/2), next[i][1]]);
        } else {
          tmp.splice(isX,1);
        }
        let isX2 = isArrayInArray(tmp, [next[i][0] + (toothpickLength/2), next[i][1]]);
        if (isX2 == 0) {
          tmp.push([next[i][0] + (toothpickLength/2), next[i][1]]);
        } else {
          tmp.splice(isX2,1);
        }
      } else {
        line(next[i][0], next[i][1] + (toothpickLength/2), next[i][0], next[i][1] - (toothpickLength/2));
        let isY = isArrayInArray(tmp, [next[i][0], next[i][1] - (toothpickLength/2)]);
        if (isY == 0) {
          tmp.push([next[i][0], next[i][1] - (toothpickLength/2)]);
        } else {
          tmp.splice(isY,1);
        }
        let isY2 = isArrayInArray(tmp, [next[i][0], next[i][1] + (toothpickLength/2)]);
        if (isY2 == 0) {
          tmp.push([next[i][0], next[i][1] + (toothpickLength/2)]);
        } else {
          tmp.splice(isY2,1);
        }
      }
    }
    next = tmp;
  }
}
