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
    this.isBuilding = false;  // if the frog is on its way to build something
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
        //drawTile(this._x, this._y);
        this._x = newX;
        this._y = newY;
        Game.log_display.drawText(0, 4, "Idle frog wanders.");
        // random build
        pending_builds = Object.keys(build_orders);
      //if (pending_builds.length > 0) {
      //    key = pending_builds[Math.floor(pending_builds.length * Math.random())];
      //    val = build_orders[key];
      //    console.log('key'+ key[0] + key[1]);
      //    console.log(this, val);
      //    orderFrogBuild(this, val, key[0], key[1]);
      //    console.log('been ordered');
      //}
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
            console.log('frog try build');
            console.log(tile, this.isBuilding);
            if ((tile == ".." || tile == "gg") && this.isBuilding) {
                console.log('frog build');
                build(this, x, y);
            }
        }
        if (/*path.length == 1 ||*/ path.length == 0) {
            Game.log_display.drawText(0, 4, "Frog arrives.");
            // automatically harvest wood
            if (tile == "**"){
                Game.player.wood += 5;
                setTile(x, y, tile_chars.EMPTY);
            }
            this.wandering = true;
        }
        else {
            x = path[0][0];
            y = path[0][1];
            //Game.display.draw(this._x, this._y, Game.map[this._x+","+this._y]);
            this._x = x;
            this._y = y;
        }
    }
    //this._draw();
//  console.log("frogman acted");
}

Frog.prototype._draw = function() {
    Game.display.draw(this._x, this._y, "GG", "green");
}
