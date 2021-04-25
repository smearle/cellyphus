const CAstates = {
    DIRT: 0,
    GRASS: 1,
    TREE: 2,
    FIRE: 3,
    INSECT: 4,
}

fire_lifetimes = {};


/*
 * Generic functions
 */

function inArr(e,arr){
  return arr.indexOf(e) != -1;
}



/*
 * Tile functions
 */

function drawTile(x, y) {
    Game.display.draw(x, y, getTile(x, y));
}

function getTile(x, y) {
    key = x+","+y;
    return Game.map[key]
}

function setTile(x, y, char) {
    key = x+","+y;
    Game.map[key] = char;
}

function getWanderTile(x, y) {
    var dirs = [[0, 1], [1, 0], [-1,0], [0,-1]]
    for (i=0; i<dirs.length; i++) {
//      console.log(x, y);
        var dx;
        var dy;
        j = Math.floor(Math.random() * dirs.length);
        [dx, dy] = dirs[j];
//      console.log(dx, dy);
        var x1 = x + dx
        var y1 = y + dy;
        tile_type = getTile(x1, y1);
        if (!(frog_impassable.indexOf(tile_type) >= 0)) {
            return [x1, y1];
        }
    }
    return [x, y];

}

// Find a tile, adjacent to the player, where they can plant a seed
function getPlantTile(x, y) {
    var dirs = [[0, 1], [1, 0], [-1,0], [0,-1]]
    for (i=0; i<dirs.length; i++) {
        var dx;
        var dy;
        [dx, dy] = dirs[i];
        var x1 = x + dx
        var y1 = y + dy;
        var tile_type = getTile(x1, y1);
        if (!(player_impassable.indexOf(tile_type) >= 0) && !(tile_type == tile_chars.GRASS)) {
            return [x1, y1];
        }
    }
    return [x, y];
}


/*
 * Passable tile controls
 */

 //var passableCallback = function(x, y) {
function humanPassableCallback(x, y) {
//    return (x+","+y in Game.map);
      key = x+","+y;
      tile_type = Game.map[key];
      var passable = (!(human_impassable.indexOf(tile_type) >= 0));
      return passable;
}

 //var passableCallback = function(x, y) {
function barbPassableCallback(x, y) {
//    return (x+","+y in Game.map);
      key = x+","+y;
      tile_type = Game.map[key];
      var passable = (!(barb_impassable.indexOf(tile_type) >= 0));
      return passable;
}

//var frogPassableCallback = function(x, y) {
function frogPassableCallback(x, y) {
//    return (x+","+y in Game.map);
      key = x+","+y;
      tile_type = Game.map[key];
      var passable = (!(frog_impassable.indexOf(tile_type) >= 0));
      return passable;
}

////////////////// Vegetation CA /////////////////////////

/*
 * Logic functions
 */

function coinFlip() {
  return (Math.floor(Math.random() * 2) == 0);
}

function isGrass(x, y) {
  // For grass and trees, are adjacent tiles "alive", i.e., contributing to grass/tree growth?
  var cell = getTile(x, y);
  return (cell == tile_chars.GRASS) ? true : false;
}

function isTree(x, y) {
    // Simply, is it a tree?
    var cell = getTile(x, y);
    return (cell == tile_chars.TREE) ? true : false;
}

function isTile(x, y, tile_char) {
    var cell = getTile(x, y);
    return (cell == tile_char) ? true : false;
}

function isWater(x, y) {
    return isTile(x, y, tile_chars.WATER) ? true: false
}


function isFire(x, y) {
    return (isTile(x, y, tile_chars.FIRE) || isTile(x, y, tile_chars.FLAME)) ? true : false;
}

// Count neighbors for a CA
function getNeighbors(x, y, isLive) {
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

// That grass
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
    /* 
     * Core cellular automaton logic
     */

    tile = getTile(x, y);
    if (tile == tile_chars.FLAME) {
        // Check if forest fire
        if (Math.random() < Math.log( fire_lifetimes[[x, y]] + 1 )) {
            return CAstates.DIRT;
        }
        fire_lifetimes[[x, y]] += 1;
        return CAstates.FLAME;
    }
    c_water = getNeighbors(x, y, isWater);
    c_tree = getNeighbors(x, y, isTree);
    c_fire = getNeighbors(x, y, isFire);
    c_grass = getNeighbors(x, y, isGrass);
    c_grass_tree = c_grass + c_tree;
    if (c_tree == 5 && Math.random() < 1 || c_tree > 0 && c_fire > 0 || tile == tile_chars.GRASS && c_fire > 0) {
//      console.log("Fire is lit");
        fire_lifetimes[[x, y]] = 0;
        return CAstates.FIRE;
    }
    
    underPopulated = healthy = overPopulated = born = spawn_tree = false;
    if (tile == tile_chars.TREE) {
        if (c_fire > 3) {
            fire_lifetimes[[x, y]] = 0;
            return CAstates.FIRE;
        }
        return CAstates.TREE;
    }
    if (tile == tile_chars.GRASS) {
        underPopulated = isUnderPopulated(c_grass_tree);
        healthy = isHealthy(c_grass_tree);
        overPopulated = isOverPopulated(c_grass_tree);
        spawn_tree = isSpawnTree(c_grass_tree);
    } else {
        born = isBorn(c_grass_tree);
    }
    if (underPopulated || overPopulated) {
        return CAstates.DIRT;
    }
    if (spawn_tree) {
        return CAstates.TREE;
    }
    if (healthy || born) {
        return CAstates.GRASS;
    }
}
