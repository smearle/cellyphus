var map_width = 40;
var map_height = 40;
var tileSet = document.createElement("img");
tileSet.src = "tileset.png";

var display_options = {
    layout: "tile",
    bg: "transparent",
    tileWidth: 32,
    tileHeight: 32,
    tileSet: tileSet,
    tileMap: {
        "@": [0, 0],
        "..": [32, 0],
        "gg": [64, 0],
        "**": [96, 0],
        "GG": [64, 0],
        "HH": [64, 0],
        "SS": [64, 0],
        "mm": [64, 0],
        "ww": [128, 0],
    },
    width: map_width,
    height: map_height,
    spacing: 1.1,
}

var Game = {
    display: null,
    map: {},
    engine: null,
    player: null,
    mouse: null,
    hawk: null,
    ananas: null,

    init: function() {
        this.display = new ROT.Display(display_options);
        this.log_display = new ROT.Display({width:map_width, height:5})
        document.body.appendChild(this.log_display.getContainer());
        const div = document.createElement("div");
        document.body.appendChild(div);
        document.body.appendChild(this.display.getContainer());

        this._generateMap();

        var scheduler = new ROT.Scheduler.Simple();
        scheduler.add(this.player, true);
        scheduler.add(this.mouse, true);
        scheduler.add(this.grasshopper, true);
        scheduler.add(this.snake, true);
        scheduler.add(this.hawk, true);

        this.engine = new ROT.Engine(scheduler);
        this.scheduler = scheduler;
        this.tick = 0;
        this.engine.start();
    },

    simulateGrass: function() {
      live = [];
      dead = [];
      for (var iy = map_width - 1; iy >= 0; iy--) {
        for (var ix = map_height - 1; ix >= 0; ix--) {
            var key = ix+","+iy;
            if (this.map[key] == "gg" || this.map[key] == "..") {

                if (census(ix, iy)) {
    //          live.push(key);
                    live.push([ix, iy]);
    //            live.push({
    //              x: ix,
    //              y: iy,
    //            });
                }
                else {
                  dead.push([ix, iy]);
                }
            }
          }
        }
        for (var i = 0; i < live.length; i++) {
              [x, y] = live[i];
              var key = x+","+y;
              this.map[key] = "gg";
              this.display.draw(x, y, this.map[key]);
        }
        for (var i = 0; i < dead.length; i++) {
            [x, y] = dead[i];
            var key = x+","+y;
            this.map[key] = "..";
            this.display.draw(x, y, this.map[key]);
        }
      },
    //  toggle(cell.x, cell.y, 'next');

    _generateCellMap: function() {
        var freeCells = [];
        var map = new ROT.Map.Cellular(map_width, map_height, {
            born: [4, 5, 6, 7, 8],
            survive: [3, 4, 5],
        })
        map.randomize(0.9);
        for (var i = 9; i>=0; i--) {
            map.create(i ? null: this.display.DEBUG);
        }
        for (x=0; x<map_width; x++) {
            for (y=0; y<map_height; y++) {
                if (!(map._map[x][y])) {
                    var key = x+","+y;
                    freeCells.push(key);
                    this.map[key] = "..";
                    }
                else {
                    var key = x+","+y;
                    this.map[key] = "ww";
                }

                }
            }
        return freeCells;
    },


    _generateDigMap: function() {
        var digger = new ROT.Map.Digger();
        var freeCells = [];

        var digCallback = function(x, y, value) {
            if (value) { return; }

            var key = x+","+y;
            this.map[key] = "..";
            freeCells.push(key);
        }
        digger.create(digCallback.bind(this));
    },

    _generateMap: function() {
        freeCells = this._generateCellMap();

        this._generateBoxes(freeCells);
        this._generateGrass(freeCells);
        this._drawWholeMap();

        this.player = this._createBeing(Player, freeCells);
        this.mouse = this._createBeing(Mouse, freeCells);
        this.hawk = this._createBeing(Hawk, freeCells);
        this.grasshopper = this._createBeing(Grasshopper, freeCells);
        this.snake = this._createBeing(Snake, freeCells);
    },

    _createBeing: function(what, freeCells) {
        var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
        var key = freeCells.splice(index, 1)[0];
        var parts = key.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);
        return new what(x, y);
    },

    _generateBoxes: function(freeCells) {
        for (var i=0;i<10;i++) {
            var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
            var key = freeCells.splice(index, 1)[0];
            this.map[key] = "**";
            if (!i) { this.ananas = key; } /* first box contains an ananas */
        }
    },

    _generateGrass: function(freeCells) {
        for (var i=0;i<200;i++) {
            var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
            var key = freeCells.splice(index, 1)[0];
            this.map[key] = "gg";
        }
    },

    _drawWholeMap: function() {
        for (var key in this.map) {
            var parts = key.split(",");
            var x = parseInt(parts[0]);
            var y = parseInt(parts[1]);
            this.display.draw(x, y, this.map[key]);
        }
    }
};


var passableCallback = function(x, y) {
//    return (x+","+y in Game.map);
      key = x+","+y;
      tile_type = Game.map[key];
      return (tile_type != "ww");
}



var displayText = function(str) {
    var empty = "                                                                                      "
    Game.log_display.drawText(5, 4, empty);
    Game.log_display.drawText(5, 4, str);
}

var Player = function(x, y) {
    this._x = x;
    this._y = y;
    this.health = 100;
    this.thirst = 100;
    this.hunger = 100;
    this._draw();
}

Player.prototype.getSpeed = function() { return 100; }
Player.prototype.getX = function() { return this._x; }
Player.prototype.getY = function() { return this._y; }
Player.prototype.getHealth = function() { return this.health; }
Player.prototype.getHunger = function() { return this.hunger; }
Player.prototype.getThirst = function() { return this.thirst; }

Player.prototype.act = function() {
    Game.engine.lock();
    window.addEventListener("keydown", this);
}

Player.prototype.handleEvent = function(e) {
    var code = e.keyCode;
    if (code == 13 || code == 32) {
        this._checkBox();
        return;
    }
    Game.simulateGrass();

    var keyMap = {};
    keyMap[38] = 0;
    keyMap[33] = 1;
    keyMap[39] = 2;
    keyMap[34] = 3;
    keyMap[40] = 4;
    keyMap[35] = 5;
    keyMap[37] = 6;
    keyMap[36] = 7;

    /* one of numpad directions? */
    if (!(code in keyMap)) { return; }

    /* is there a free space? */
    var dir = ROT.DIRS[8][keyMap[code]];
    var newX = this._x + dir[0];
    var newY = this._y + dir[1];
    var newKey = newX + "," + newY;
    e.preventDefault();
    if (!(newKey in Game.map)) { return; }

    Game.display.draw(this._x, this._y, Game.map[this._x+","+this._y]);
    // Move the player
    this._x = newX;
    this._y = newY;
    this._draw();
    window.removeEventListener("keydown", this);
    displayHUD();
    Game.tick ++;
    if (this.hunger == 0 && this.thirst == 0) {
        this.health--;
    }
    this.hunger = Math.max(this.hunger-1, 0);
    this.thirst = Math.max(this.thirst-1, 0);
    curr_tile = Game.map[this._x+","+this._y];
    if (curr_tile == "ww") {
        this.thirst = Math.min(100, this.thirst + 25);
        }
    else if (curr_tile == "gg") {
        this.hunger = Math.min(100, this.hunger + 25);
    }
    Game.engine.unlock();
}

Player.prototype._draw = function() {
    Game.display.draw(this._x, this._y, "@", "#ff0");
}

Player.prototype._checkBox = function() {
    var key = this._x + "," + this._y;
    if (Game.map[key] != "*") {
        displayText("There is no box here!");
    } else if (key == Game.ananas) {
        displayText("Hooray! You found an ananas and won this game.");
        Game.engine.lock();
        window.removeEventListener("keydown", this);
    } else {
        displayText("This box is empty :-(");
    }
}


var displayHUD = function() {
    health_str = "Health: " + Game.player.getHealth().toString().padStart(3, " ");
    hunger_str = "Hunger: " + Game.player.getHunger().toString().padStart(3, " ");
    thirst_str = "Thirst: " + Game.player.getThirst().toString().padStart(3, " ");
    Game.log_display.drawText(0, 0, health_str);
    Game.log_display.drawText(0, 1, thirst_str);
    Game.log_display.drawText(0, 2, hunger_str);
}

var Mouse = function(x, y) {
    this._x = x;
    this._y = y;
    this._draw();
}

Mouse.prototype.getSpeed = function() { return 100; }

Mouse.prototype.act = function() {
    if (!Game.grasshopper) {
        this._draw();
        return
    }

    var x = Game.grasshopper._x;
    var y = Game.grasshopper._y;

    var astar = new ROT.Path.AStar(x, y, passableCallback, {topology:4});

    var path = [];
    var pathCallback = function(x, y) {
        path.push([x, y]);
    }
    astar.compute(this._x, this._y, pathCallback);

    path.shift();
    if (path.length == 1 || path.length == 0) {
    //  Game.engine.lock();
        displayText("Grasshopper captured by Mouse!");
        Game.display.draw(Game.grasshopper._x, Game.grasshopper._y, Game.map[Game.grasshopper._x+","+ Game.grasshopper._y]);
        Game.scheduler.remove(Game.grasshopper);
        Game.grasshopper = null;
    }
    else if (path.length == 0)
    {
    }
    else {
        x = path[0][0];
        y = path[0][1];
        Game.display.draw(this._x, this._y, Game.map[this._x+","+this._y]);
        this._x = x;
        this._y = y;
        this._draw();
    }
}

Mouse.prototype._draw = function() {
    Game.display.draw(this._x, this._y, "mm", "grey");
}

var Snake = function(x, y) {
    this._x = x;
    this._y = y;
    this._draw();
}

Snake.prototype.getSpeed = function() { return 100; }

Snake.prototype.act = function() {
    if (!Game.mouse) {
        this._draw();
        return
    }
    var x = Game.mouse._x;
    var y = Game.mouse._y;

    var astar = new ROT.Path.AStar(x, y, passableCallback, {topology:4});

    var path = [];
    var pathCallback = function(x, y) {
        path.push([x, y]);
    }
    astar.compute(this._x, this._y, pathCallback);

    path.shift();
    if (path.length == 1 || path.length == 0) {
//      Game.engine.lock();
        displayText("Mouse captured by snake!");
        Game.display.draw(Game.mouse._x, Game.mouse._y, Game.map[Game.mouse._x+","+ Game.mouse._y]);
        Game.scheduler.remove(Game.mouse)
        Game.mouse = null;
    }
    else {
        x = path[0][0];
        y = path[0][1];
        Game.display.draw(this._x, this._y, Game.map[this._x+","+this._y]);
        this._x = x;
        this._y = y;
        this._draw();
    }
}

Snake.prototype._draw = function() {
    Game.display.draw(this._x, this._y, "SS", "blue");
}


var Grasshopper = function(x, y) {
    this._x = x;
    this._y = y;
    this._draw();
    this._move_ticker = 0
}

Grasshopper.prototype.getSpeed = function() { return 100; }

Grasshopper.prototype.act = function() {
    var x = Game.player.getX();
    var y = Game.player.getY();

    if (!(this._move_ticker == 0)) {
        this._move_ticker += 1;
        return
    }
    this._move_ticker = 0;

    var astar = new ROT.Path.AStar(x, y, passableCallback, {topology:4});

    var path = [];
    var pathCallback = function(x, y) {
        path.push([x, y]);
    }
    astar.compute(this._x, this._y, pathCallback);

    path.shift();
    if (path.length == 1 || path.length == 0) {
//      Game.engine.lock();
        displayText("You, grass, were eaten by a Grasshopper! Game over!");
    } 
    else {
        x = path[0][0];
        y = path[0][1];
        Game.display.draw(this._x, this._y, Game.map[this._x+","+this._y]);
        this._x = x;
        this._y = y;
        this._draw();
    }
}

Grasshopper.prototype._draw = function() {
    Game.display.draw(this._x, this._y, "GG", "green");
}


var Hawk = function(x, y) {
    this._x = x;
    this._y = y;
    this._draw();
}

Hawk.prototype.getSpeed = function() { return 50; }

Hawk.prototype.act = function() {
    if (!Game.snake) {
        Game.display.draw(this._x, this._y, Game.map[this._x+","+this._y]);
        this._draw()
        return
    }
    var x = Game.snake._x;
    var y = Game.snake._y;

  //SHOW(Game.display.getContainer());


    var astar = new ROT.Path.AStar(x, y, passableCallback, {topology:4});

    var path = [];
    var pathCallback = function(x, y) {
        path.push([x, y]);
    }
    astar.compute(this._x, this._y, pathCallback);

    path.shift();
    if (path.length == 1 || path.length == 0) {
//      Game.engine.lock();
    //  alert("Snake captured by Hawk!");
    //  var str = "Goodbye %c{red}cr%b{blue}u%b{}el %c{}world"
        displayText("Snake captured by Hawk!");
        Game.display.draw(Game.snake._x, Game.snake._y, Game.map[Game.snake._x+","+ Game.snake._y]);
        Game.scheduler.remove(Game.snake);
        Game.snake = null;
    } 
    else {
        x = path[0][0];
        y = path[0][1];
        Game.display.draw(this._x, this._y, Game.map[this._x+","+this._y]);
        this._x = x;
        this._y = y;
        this._draw();
    }
}

Hawk.prototype._draw = function() {
    Game.display.draw(this._x, this._y, "HH", "brown");
}


/*
 * Logic
 */

function coinFlip() {
  return (Math.floor(Math.random() * 2) == 0);
}

function isLive(x, y) {
  var key = x+","+y;
  var cell = Game.map[key];
  return (cell == "gg") ? true : false;
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

function census(x, y) {
  c = getNeighbors(x, y);
  underPopulated = healthy = overPopulated = born = false;
  if (isLive(x, y)) {
    underPopulated = isUnderPopulated(c);
    healthy = isHealthy(c);
    overPopulated = isOverPopulated(c);
  } else {
    born = isBorn(c);
  }
  if (underPopulated || overPopulated) {
    return false;
  }
  if (healthy || born) {
    return true;
  }
}


window.onload = function() {
    Game.init();
    }



//Game.init();

