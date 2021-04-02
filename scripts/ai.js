var Grasshopper = function(x, y) {
    this._x = x;
    this._y = y;
    this._x_t = Game.player.getX();
    this._y_t = Game.player.getY();
    this.building = false;  // if the grasshopper is on its way to build something
    this._draw();
    this._move_ticker = 0
}

Grasshopper.prototype.getSpeed = function() { return 100; }

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
        if (!(impassable.indexOf(tile_type) >= 0) || (tile_type == tile_chars.WATER)) {
            return [x1, y1];
        }
    }
    return [x, y];

}


function getPlantTile(x, y) {
    var dirs = [[0, 1], [1, 0], [-1,0], [0,-1]]
    for (i=0; i<dirs.length; i++) {
//      console.log(x, y);
        var dx;
        var dy;
        [dx, dy] = dirs[i];
//      console.log(dx, dy);
        var x1 = x + dx
        var y1 = y + dy;
        var tile_type = getTile(x1, y1);
        if (!(impassable.indexOf(tile_type) >= 0) && !(tile_type == tile_chars.GRASS)) {
            return [x1, y1];
        }
    }
    return [x, y];
}


Grasshopper.prototype.act = function() {
    var x = this._x_t;
    var y = this._y_t;

    if (!(this._move_ticker == 0)) {
        this._move_ticker += 1;
        return
    }
    this._move_ticker = 0;

    // Wander about
    if (this.wandering) {
        // Randomly move to a valid tile
        var newX;
        var newY;
        [newX, newY] = getWanderTile(this._x, this._y);
        drawTile(this._x, this._y);
        console.log(newX, newY);
        this._x = newX;
        this._y = newY;
        Game.log_display.drawText(0, 4, "Idle Frogman wanders.");
    }

    // Head to some target
    else {
        var astar = new ROT.Path.AStar(x, y, frogPassableCallback, {topology:4});

        var path = [];
        var pathCallback = function(x, y) {
            path.push([x, y]);
        }
        astar.compute(this._x, this._y, pathCallback);

        path.shift();
        tile = getTile(x, y);
        if (path.length == 1) {
            if (tile == ".." && this.building) {
                if (Game.player.wood > 0) {
                    displayText("Frogman builds the wall.");
                    setTile(x, y, tile_chars.WALL);
                    drawTile(x, y);
                    Game.player.wood -= 1;
                }
                else {
                    displayText("Cannot build wall without wood.");
                }
                this.building = false;
            this.wandering = true;
            }
        }
        if (/*path.length == 1 ||*/ path.length == 0) {
            Game.log_display.drawText(0, 4, "Frogman has arrived at their destination.");
            if (tile == "**"){
                Game.player.wood += 5;
                setTile(x, y, tile_chars.EMPTY);
            }
            this.wandering = true;
        }
        else {
            x = path[0][0];
            y = path[0][1];
            Game.display.draw(this._x, this._y, Game.map[this._x+","+this._y]);
            this._x = x;
            this._y = y;
        }
    }
    this._draw();
}

Grasshopper.prototype._draw = function() {
    Game.display.draw(this._x, this._y, "GG", "green");
}

var Barbarian = function(x, y) {
    this._x = x;
    this._y = y;
    this.health = 100;
    this.power = 5;
    this._draw();
}

Barbarian.prototype.getSpeed = function() { return 100; }
Barbarian.prototype.getHealth = function() { return this.health; }

Barbarian.prototype.act = function() {
    
    var x = Game.player.getX();
    var y = Game.player.getY();

    var astar = new ROT.Path.AStar(x, y, passableCallback, {topology:4});

    var path = [];
    var pathCallback = function(x, y) {
        path.push([x, y]);
    }
    astar.compute(this._x, this._y, pathCallback);

    path.shift();
    if (path.length == 1 || path.length == 0) {
        if (Math.abs(this._x - x) > 1 || Math.abs(this._y - y) > 1) {
            this._draw();
        }
        else {
            Game.combatTarget = "Barbarian";
    //      Game.engine.lock();
            //do text based combat here

            //attack player
    //      console.log("Barbarian attack, health: " + this.getHealth());
            if (this.getHealth() > 0)
            {
                var atk = Math.floor(Math.random() * this.power) + 1; //random damage between 0 to power
    //          console.log("attack: " + atk);
                Game.player.health -= atk;

                combatTextEnemy("The Barbarian bashed you for " + atk + " damage!");
            }

            //remove barbarian from game after player wins
            //End game if player loses
            //Game.scheduler.remove(Game.mouse)
            //Game.mouse = null;
        }
    }
    else {
        if (Game.combatTarget == "Barbarian") {Game.combatTarget = "None";}

        x = path[0][0];
        y = path[0][1];
        Game.display.draw(this._x, this._y, Game.map[this._x+","+this._y]);
        this._x = x;
        this._y = y;
        this._draw();
    }
}

Barbarian.prototype._draw = function() {
    Game.display.draw(this._x, this._y, "SS", "blue");
}


var Cow = function(x, y) {
    this._x = x;
    this._y = y;
    this.wandering = true;
    this._draw();
}

Cow.prototype.getSpeed = function() { return 100; }

Cow.prototype.act = function() {
    // Wander about
    if (this.wandering) {
        // Randomly move to a valid tile
        var newX;
        var newY;
        [newX, newY] = getWanderTile(this._x, this._y);
        drawTile(this._x, this._y);
        console.log(newX, newY);
        this._x = newX;
        this._y = newY;
    }

}

Cow.prototype._draw = function() {
    Game.display.draw(this._x, this._y, "mm", "grey");
}

//text writing functions
var displayText = function(str) {
    Game.log_display.drawText(0, 6, str);
}

var combatTextPlayer = function(str) {
    var empty = "                                                                                      "
    Game.log_combat.drawText(1, 6, empty);
    Game.log_combat.drawText(1, 6, str);
}

var combatTextEnemy = function(str) {
    var empty = "                                                                                      "
    Game.log_combat.drawText(1, 7, empty);
    Game.log_combat.drawText(1, 7, str);
}