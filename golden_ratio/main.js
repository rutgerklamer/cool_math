let width = 700;
let height = 700;
let radius = width/2;
let centerX = width/2;
let centerY = height/2;
let lineWeight = 1;
let ratio, animate;

function setup() {
  createCanvas(width, height).position(screen.width/4, 0, 'absolute');
  background(254,255,12)
  strokeWeight(1)
  stroke(0,0,0);
  fill(254,255,12);
  ellipse(width/2, height/2, radius*2, radius*2);
  animate = true;
  ratio = 1.61803398875;
  draw();
  animate = false;
  ratio = 1.61803398875;
}


function changeStroke(sweight) {
  lineWeight = sweight;
}

function animates() {
  animate = !animate;
}

function draw() {
  if (animate) {
    clear();
    ratio += deltaTime/10000000;
    let flower = 0;
    let angle = 0;
      for (i = 0; i < 1200; i++) {
        flower += 0.3;
        angle += 360 * (ratio);
        let curX = (width/2) + flower * cos(angle * (Math.PI/180))
        let curY = (width/2) + flower * sin(angle * (Math.PI/180))
        ellipse(curX, curY, 25, 25);
      }
  }
}
