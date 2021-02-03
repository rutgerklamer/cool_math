let width = 700;
let height = 700;
let centerX = width/2;
let centerY = height/2;
let tri = [[centerX - width/3, centerY + height/3], [centerX + width/3, centerY + height/3], [centerX, centerY - height/3]];
let clicking = false;

function setup() {
  createCanvas(width, height).position(screen.width/4, 25, 'absolute');
  background(getComputedStyle(document.documentElement).getPropertyValue('--bgColor'));
  setStart();
}

function setStart() {

}

function getDistance(a,b) {
  return Math.sqrt((a[0]-b[0])*(a[0]-b[0]) + (a[1]-b[1])*(a[1]-b[1]));
}


function mousePressed() {
  clicking = true;
}

function mouseReleased() {
  clicking = false;
}



function draw() {
  clear();
  fill(254,255,12);
  let prev = [tri[tri.length-1][0], tri[tri.length-1][1]];
  let closest = 0;
  let dist = height;
  for (i = 0; i < tri.length; i++) {
    ellipse(tri[i][0],tri[i][1], 10,10);
    line(prev[0], prev[1], tri[i][0],tri[i][1]);
    prev = [tri[i][0],tri[i][1]];
    if (getDistance([mouseX, mouseY], tri[i]) < dist) {
      closest = i;
      dist = getDistance([mouseX, mouseY], tri[i]);
    }
  }
  if (clicking) {
    tri[closest][0] = mouseX;
    tri[closest][1] = mouseY;
  }

  let centroid = [(tri[0][0] + tri[1][0] + tri[2][0]) / 3, (tri[0][1] + tri[1][1] + tri[2][1]) / 3];
  fill(255,0,0)
  ellipse(centroid[0], centroid[1], 10,10);

  let ax = tri[0][0];
  let ay = tri[0][1];
  let bx = tri[1][0];
  let by = tri[1][1];
  let cx = tri[2][0];
  let cy = tri[2][1];

  let d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by))
  let circumcenter = [((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / d, ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / d];
  fill(0,255,0);
  ellipse(circumcenter[0], circumcenter[1], 10, 10);
  noFill();
  ellipse(circumcenter[0],circumcenter[1], getDistance([circumcenter[0],circumcenter[1]], tri[0]) * 2);

  let orthocenter = [centroid[0] * 3.0 - circumcenter[0] * 2.0, centroid[1] * 3.0 - circumcenter[1] * 2.0];
  fill(0,0,255);
  ellipse(orthocenter[0], orthocenter[1], 10, 10);
  line(circumcenter[0], circumcenter[1], orthocenter[0], orthocenter[1]);
}
