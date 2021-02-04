let width = 700;
let height = 700;
let centerX = width/2;
let centerY = height/2;
let points = [[centerX - width/2.5, centerY + height/2.5], [centerX + width/2.5, centerY + height/2.5], [centerX, centerY - height/2.5]];
let prevRandom = 0;
let division = 2;
let clicking = false;

let start = [centerX, centerY];

function setup() {
  createCanvas(width, height).position(screen.width/4, 25, 'absolute');
  background(0,0,0,0);
  setStart();
}

function mousePressed() {
  clicking = true;
}

function mouseReleased() {
  clicking = false;
}

function blockInfinite() {
  points = [[centerX - width/2.5, centerY + height/2.5], [centerX + width/2.5, centerY + height/2.5], [centerX - width/2.5, centerY - height/2.5], [centerX + width/2.5, centerY - height/2.5], [centerX, centerY]];
  division = 3/2;
  setup();
}

function block() {
  points = [[centerX - width/2.5, centerY + height/2.5], [centerX + width/2.5, centerY + height/2.5], [centerX - width/2.5, centerY - height/2.5], [centerX + width/2.5, centerY - height/2.5]];
  division = 3/2;
  setup();
}

function sierpinskiBlock() {
  points = [[centerX - width/2.5, centerY + height/2.5], [centerX - width/2.5, centerY], [centerX + width/2.5, centerY + height/2.5], [centerX + width/2.5, centerY], [centerX - width/2.5, centerY - height/2.5], [centerX, centerY - height/2.5], [centerX + width/2.5, centerY - height/2.5], [centerX, centerY + height/2.5]];
  division = 3/2;
  setup();
}

function sierpinskiTriangle() {
  points = [[centerX - width/2.5, centerY + height/2.5], [centerX + width/2.5, centerY + height/2.5], [centerX, centerY - height/2.5]];
  division = 2;
  setup();
}

function getDistance(a,b) {
  return Math.sqrt((a[0]-b[0])*(a[0]-b[0]) + (a[1]-b[1])*(a[1]-b[1]));
}

function setStart() {
  clear();
  start = [points[0][0], points[0][1]];
  fill(getComputedStyle(document.documentElement).getPropertyValue('--standout'));
  let closest = 0;
  let dist = height;
  for (i = 0; i < points.length; i++) {
    ellipse(points[i][0],points[i][1], 10,10);
  }
}

function changeDivider(i) {
  division *= i;
  console.log(division)
  setStart();
}

function addPoint() {
  points.push([centerX, centerY]);
  setStart();
}

function draw() {
  if (clicking && mouseX < width && mouseY < height && mouseX > 0 && mouseY > 0) {
    let closest = 0;
    let dist = height;
    for (i = 0; i < points.length; i++) {
      if (getDistance([mouseX, mouseY], points[i]) < dist) {
        closest = i;
        dist = getDistance([mouseX, mouseY], points[i]);
      }
    }
    points[closest][0] = mouseX;
    points[closest][1] = mouseY;
    setStart();
    return;
  }
  for (i = 0; i < document.getElementById("speed").value; i++) {
    ellipse(start[0],start[1], document.getElementById("size").value,document.getElementById("size").value);
    let randomMove = Math.floor(random(points.length));
    let angle = Math.atan2(points[randomMove][1] - start[1],points[randomMove][0] - start[0]);
    var distanceToMove = Math.sqrt((start[0]-points[randomMove][0])*(start[0]-points[randomMove][0]) + (start[1]-points[randomMove][1])*(start[1]-points[randomMove][1]))/division;

    let curX = start[0] + distanceToMove * cos(angle )
    let curY = start[1] + distanceToMove * sin(angle )

    start[0] = curX;
    start[1] = curY;
    prevRandom = randomMove;
  }

}
