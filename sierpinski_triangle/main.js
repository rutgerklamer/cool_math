let width = 700;
let height = 700;
let centerX = width/2;
let centerY = height/2;
let points = [[centerX - width/4, centerY + height/4], [centerX + width/4, centerY + height/4], [centerX, centerY - height/4]];
let start = [centerX, centerY];

function setup() {
  createCanvas(width, height).position(screen.width/4, 25, 'absolute');
  background(getComputedStyle(document.documentElement).getPropertyValue('--bgColor'));
  setStart();
}

function setStart() {
  fill(254,255,12);
  ellipse(points[0][0],points[0][1], 10,10);
  ellipse(points[1][0],points[1][1], 10,10);
  ellipse(points[2][0],points[2][1], 10,10);
}

function draw() {
  for (i = 0; i < 10; i++) {
    ellipse(start[0],start[1], 5,5);
    let randomMove = Math.floor(random(points.length));
    console.log(randomMove)
    let angle = Math.atan2(points[randomMove][1] - start[1],points[randomMove][0] - start[0]);
    var distanceToMove = Math.sqrt((start[0]-points[randomMove][0])*(start[0]-points[randomMove][0]) + (start[1]-points[randomMove][1])*(start[1]-points[randomMove][1]))/2;
    console.log(distanceToMove);

    let curX = start[0] + distanceToMove * cos(angle )
    let curY = start[1] + distanceToMove * sin(angle )

    start[0] = curX;
    start[1] = curY;
  }

}
