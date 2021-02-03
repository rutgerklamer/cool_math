let width = 700;
let height = 700;
let radius = width/2-15;
let centerX = width/2;
let centerY = height/2;
let lineWeight = 1;
let lines = 4;
let time = 0;
let drawLines = false;
let times = 0;

function setup() {
  createCanvas(width, height).position(screen.width/4, 0, 'absolute');
  background(getComputedStyle(document.documentElement).getPropertyValue('--bgColor'))
  strokeWeight(2)
  stroke(0,0,0);
  fill(getComputedStyle(document.documentElement).getPropertyValue('--standout'));
  ellipse(width/2, height/2, radius*2, radius*2);

}

function switchLines() {
  drawLines = !drawLines;
}


function changeStroke(sweight) {
  lineWeight = sweight;
}

function draw() {
  clear();
  lines = document.getElementById("lines").value * 4;
  for (i = 0; i < lines; i++) {
    time += 360/lines;
    let angle = (360/lines) * i;
    if (drawLines) {
      let x = centerX + width * cos(angle * (Math.PI/180))
      let y = centerY + height * sin(angle * (Math.PI/180))
      line(centerX, centerY, x, y);
    }

  /*  x = centerX + radius * cos(radius - (time/500)/i) * cos(angle * (Math.PI/180))
    y = centerY + radius * sin(radius - (time/500)/i) * sin(angle * (Math.PI/180))*/
    if (i < lines/2) {
      x = centerX + sin(times+i/(lines/6.25))*radius  * cos(time * (Math.PI/180))
      y = centerY + sin(times+i/(lines/6.25))*radius * sin(time * (Math.PI/180))
      times+=1/1000;
      ellipse(x, y, 25, 25);
  }
  }
}
