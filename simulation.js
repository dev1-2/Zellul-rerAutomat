// Zellulärer Automat für eine Neandertalerwelt

const width = 80;
const height = 60;
const cellSize = 10;

const canvas = document.getElementById("sim");
const ctx = canvas.getContext("2d");

// Zelltypen
const Cave = 1;
const River = 2;
const Forest = 3;
const Grass = 4;
const Stone = 5;
const Mountain = 6;
const Animal = 7;

// Farben für die Zelltypen
const COLORS = {
  [Cave]: "#6B4226",
  [River]: "#1E90FF",
  [Forest]: "#228B22",
  [Grass]: "#DEB887",
  [Stone]: "#7B7B7B",
  [Mountain]: "#A9A9A9",
  [Animal]: "#FFD700",
};

let grid = [];
let nextGrid = [];

// Initialisiere die Welt
function initGrid() {
  grid = [];
  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      let type = Grass;
      // Berge am Rand
      if (x === 0 || y === 0 || x === width-1 || y === height-1) type = Mountain;
      // Zufällige Steine
      else if (Math.random() < 0.03) type = Stone;
      // Zufällige Höhlen
      else if (Math.random() < 0.01) type = Cave;
      // Fluss generieren
      else if (y > height/2-2 && y < height/2+2 && Math.abs(x-width/2) < width/4) type = River;
      // Zufälliger Wald
      else if (Math.random() < 0.10) type = Forest;
      // Zufälliges Tier
      else if (Math.random() < 0.005) type = Animal;
      row.push(type);
    }
    grid.push(row);
  }
}

// Zeichne das Grid
function drawGrid() {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let type = grid[y][x];
      ctx.fillStyle = COLORS[type] || "#000";
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }
}

// Zellregeln für nächste Generation
function step() {
  nextGrid = JSON.parse(JSON.stringify(grid));
  for (let y = 1; y < height-1; y++) {
    for (let x = 1; x < width-1; x++) {
      let type = grid[y][x];

      // Tiere bewegen sich zufällig
      if (type === Animal) {
        let dirs = [
          [0,1],[1,0],[0,-1],[-1,0]
        ];
        let dir = dirs[Math.floor(Math.random()*dirs.length)];
        let nx = x + dir[0], ny = y + dir[1];
        if (grid[ny][nx] === Grass || grid[ny][nx] === Forest) {
          nextGrid[ny][nx] = Animal;
          nextGrid[y][x] = grid[y][x] === Forest ? Forest : Grass;
        }
      }

      // Wald wächst ins Gras
      if (type === Forest) {
        let count = 0;
        for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++) {
          if(grid[y+dy][x+dx] === Forest) count++;
        }
        if (count >= 3) {
          for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++) {
            if(grid[y+dy][x+dx] === Grass && Math.random()<0.10)
              nextGrid[y+dy][x+dx] = Forest;
          }
        }
      }

      // Fluss fließt weiter
      if (type === River) {
        if (Math.random() < 0.02 && y+1 < height-1) nextGrid[y+1][x] = River;
        if (Math.random() < 0.01 && x+1 < width-1) nextGrid[y][x+1] = River;
        if (Math.random() < 0.01 && x-1 > 0) nextGrid[y][x-1] = River;
      }

      // Höhlen wachsen zu Steinen
      if (type === Cave && Math.random() < 0.01)
        nextGrid[y][x] = Stone;
    }
  }
  grid = nextGrid;
}

// Hauptloop
function loop() {
  step();
  drawGrid();
  requestAnimationFrame(loop);
}

// Startsimulation
initGrid();
drawGrid();
setTimeout(loop, 1000);
