var FrogManager = function() {
    init_frog = Game._createBeing(Frog, freeCells);
    this.frogs = [init_frog];
}

FrogManager.prototype.act = function () {
    for (i = 0; i < this.frogs.length; i++) {
        this.frogs[i].act();
    }
}




var Frog = function(x, y) {
    this._x = x;
    this._y = y;
    this._x_t = Game.player.getX();
    this._y_t = Game.player.getY();
    this.building = false;  // if the frog is on its way to build something
    this._draw();
    this._move_ticker = 0
}

Frog.prototype.getSpeed = function() { return 100; }


Frog.prototype.act = function() {
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
                curr_build = build_orders[(x, y)];
                if (curr_build == build_items.WALL) {
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
                else if (curr_build == build_items.DOOR) {
                    displayText("build a door");
                    displayText("Frogman builds the door.");
                    setTile(x, y, tile_chars.DOOR);
                    drawTile(x, y);
                }
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
    return "frogman acted";
}

Frog.prototype._draw = function() {
    Game.display.draw(this._x, this._y, "GG", "green");
}
