var Game = {
    display: null,
    map: {},
    engine: null,
    player: null,
    mouse: null,
    hawk: null,
    ananas: null,

    init: function() {
        this.display = new ROT.Display({width:80, height:27, spacing:1.1});
        document.body.appendChild(this.display.getContainer());

        this._generateMap();

        var scheduler = new ROT.Scheduler.Simple();
        scheduler.add(this.player, true);
        scheduler.add(this.mouse, true);
        scheduler.add(this.grasshopper, true);
        scheduler.add(this.snake, true);
        scheduler.add(this.hawk, true);

        this.engine = new ROT.Engine(scheduler);
        this.engine.start();
        this.scheduler = scheduler;
    },

    _generateMap: function() {
        var digger = new ROT.Map.Digger();
        var freeCells = [];

        var digCallback = function(x, y, value) {
            if (value) { return; }

            var key = x+","+y;
            this.map[key] = ".";
            freeCells.push(key);
        }
        digger.create(digCallback.bind(this));

        this._generateBoxes(freeCells);
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
            this.map[key] = "*";
            if (!i) { this.ananas = key; } /* first box contains an ananas */
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
    return (x+","+y in Game.map);
}

var displayText = function(str) {
    var empty = "                                                    "
    Game.display.drawText(5, 25, empty);
    Game.display.drawText(5, 25, str);
}

var Player = function(x, y) {
    this._x = x;
    this._y = y;
    this._draw();
}

Player.prototype.getSpeed = function() { return 100; }
Player.prototype.getX = function() { return this._x; }
Player.prototype.getY = function() { return this._y; }

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
    if (!(newKey in Game.map)) { return; }

    Game.display.draw(this._x, this._y, Game.map[this._x+","+this._y]);
    this._x = newX;
    this._y = newY;
    this._draw();
    window.removeEventListener("keydown", this);
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
    Game.display.draw(this._x, this._y, "m", "grey");
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
    Game.display.draw(this._x, this._y, "S", "blue");
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
        Game.engine.lock();
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
    Game.display.draw(this._x, this._y, "G", "green");
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
    Game.display.draw(this._x, this._y, "H", "brown");
}





Game.init();

