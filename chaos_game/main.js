let width = 700;
let height = 700;
let centerX = width/2;
let centerY = height/2;
let points = [[centerX - width/2.5, centerY + height/2.5], [centerX + width/2.5, centerY + height/2.5], [centerX, centerY - height/2.5]];
let prevRandom = 0;
let division = 2;

let start = [centerX, centerY];

function setup() {
  createCanvas(width, height).position(screen.width/4, 25, 'absolute');
  background(getComputedStyle(document.documentElement).getPropertyValue('--bgColor'));
  setStart();
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

function setStart() {
  start = [points[0][0], points[0][1]];
  fill(254,255,12);
  for (i = 0; i < points.length; i++) {
    ellipse(points[i][0],points[i][1], 10,10);
  }
}

function draw() {
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
