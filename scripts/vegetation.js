/*
 * Logic
 */

function coinFlip() {
  return (Math.floor(Math.random() * 2) == 0);
}

function isLive(x, y) {
  var key = x+","+y;
  var cell = Game.map[key];
  return (cell == "gg" || cell == tile_chars.TREE) ? true : false;
}

function getNeighbors(x, y) {
  n = (y != map_height - 1); // has northern neighbors
  e = (x != 0); // has eastern neighbors
  s = (y != 0); // has southern neighbors
  w = (x != map_width - 1); // has western neighbors
  count = 0;
  if (n && isLive(x, y + 1)) count++;
  if (n && e && isLive(x - 1, y + 1)) count++;
  if (e && isLive(x - 1, y)) count++;
  if (s && e && isLive(x - 1, y - 1)) count++;
  if (s && isLive(x, y - 1)) count++;
  if (s && w && isLive(x + 1, y - 1)) count++;
  if (w && isLive(x + 1, y)) count++;
  if (n && w && isLive(x + 1, y + 1)) count++;
  return count;
}

/*
 * Any live cell with fewer than two live neighbors dies, as if by under population.
 */
function isUnderPopulated(c) {
  return (c < 2);
}

/*
 * Any live cell with two or three live neighbors lives on to the next generation.
 */
function isHealthy(c) {
  return (c == 2 || c == 3);
}

/*
 * Any live cell with more than three live neighbors dies, as if by overpopulation.
 */
function isOverPopulated(c) {
  return (c > 3);
}

/*
 * Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.
 */
function isBorn(c) {
  return (c == 3);
}

function isSpawnTree(c) {
  return (c == 3 && Math.random() < 0.01);
}

function census(x, y) {
  c = getNeighbors(x, y);
  underPopulated = healthy = overPopulated = born = spawn_tree = false;
  if (isLive(x, y)) {
    underPopulated = isUnderPopulated(c);
    healthy = isHealthy(c);
    overPopulated = isOverPopulated(c);
    spawn_tree = isSpawnTree(c);
  } else {
    born = isBorn(c);
  }
  if (underPopulated || overPopulated) {
    return 0;
  }
  if (spawn_tree) {
    return 2;
  }
  if (healthy || born) {
    return 1;
  }
}
