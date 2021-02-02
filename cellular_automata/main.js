let width = 700;
let height = 700;
let w;
let co;
let rows;
let grid;
let next;

function setup() {
  createCanvas(width, height).position(screen.width/4, 0, 'absolute');
  w = 10;
  co = floor(width / w);
  rows = floor(height / w);
  board = new Array(co);
  for (let i = 0; i < co; i++) {
    board[i] = new Array(rows);
  }
  next = new Array(co);
  for (i = 0; i < co; i++) {
    next[i] = new Array(rows);
  }
  init();
}

function draw() {
  background(getComputedStyle(document.documentElement).getPropertyValue('--bgColor'))
  conway();
  for ( let i = 0; i < co;i++) {
    for ( let j = 0; j < rows;j++) {
      if ((board[i][j] == 1)) fill(0);
      else   fill(getComputedStyle(document.documentElement).getPropertyValue('--bgColor'));
      stroke(0);
      rect(i * w, j * w, w-1, w-1);
    }
  }

}

function mousePressed() {
  init();
}

function init() {
  for (let i = 0; i < co; i++) {
    for (let j = 0; j < rows; j++) {
      if (i == 0 || j == 0 || i == co-1 || j == rows-1) board[i][j] = 0;
      else board[i][j] = floor(random(2));
      next[i][j] = 0;
    }
  }
}

function conway() {
  for (let x = 1; x < co - 1; x++) {
    for (let y = 1; y < rows - 1; y++) {
      let neighbors = 0;
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          neighbors += board[x+i][y+j];
        }
      }

      neighbors -= board[x][y];
      if ((board[x][y] == 1) && (neighbors <  2)) {
        next[x][y] = 0;
      }
      else if ((board[x][y] == 1) && (neighbors >  3)) {
        next[x][y] = 0;
      }
      else if ((board[x][y] == 0) && (neighbors == 3)) {
        next[x][y] = 1;
      }
      else {
        next[x][y] = board[x][y];
      }
    }
  }

  let temp = board;
  board = next;
  next = temp;
}
