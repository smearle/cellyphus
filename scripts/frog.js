var FrogManager = function() {

    init_frog = Game._createBeing(Frog, freeCells);
    init_frog.mortal = false;                           //primus the immortal
    this.frogs = [init_frog];
}

FrogManager.prototype.act = function () {
    for (i = 0; i < this.frogs.length; i++) {
//      console.log('act frog ' + i);
        this.frogs[i].act();
    }
}



var Frog = function(x, y) {
    this._x = x;
    this._y = y;
    this._x_t = this._x;
    this._y_t = this._y;
//  this._x_t = Game.player.getX();
//  this._y_t = Game.player.getY();
    this.isBuilding = false;  // if the frog is on its way to build something
    this.isHarvesting = false;
    this._draw();
    this._move_ticker = 0
    this.command = "auto";
    this.mortal = true;
    this.trg_barb = -1;
    this.name = "Primus the Immortal Frog";
}

Frog.prototype.getSpeed = function() { return 100; }
Frog.prototype.canMove = function(x,y){return !Game.anyAtPos(x,y);}


Frog.prototype.act = function() {
//  console.log('frog tick');

    if (!(this._move_ticker == 0)) {
        this._move_ticker += 1;
        return
    }
    this._move_ticker = 0;
    // Wander about
    if (this.trg_barb != -1) {
        console.log("frog's trg_barb: "+this.trg_barb);
        console.log("global barbarios: ");
        console.log(barbarians);
        this._x_t = barbarians[this.trg_barb]._x;
        this._y_t = barbarians[this.trg_barb]._y;
    }
    if (this.wandering) {
        // Randomly move to a valid tile
        var newX;
        var newY;
        [newX, newY] = getWanderTile(this._x, this._y);
        this._x = newX;
        this._y = newY;
//      console.log('start', this._x, this._y);
        drawTile(this._x, this._y);
//      console.log('end', this._x, this._y);

      //Game.log_display.drawText(0, 4, "Idle frog wanders.");
      //// random build
        if (this.command == 'auto' || this.command == 'build') {
            pending_builds = Object.keys(build_orders);
            if (pending_builds.length > 0 && !frog_impassable.includes(getTile(this._x, this._y))) {
                key = pending_builds[Math.floor(pending_builds.length * Math.random())].split(",");
                build_x = parseInt(key[0]);
                build_y = parseInt(key[1]);
                val = build_orders[key];
                orderFrogBuild(this, val, build_x, build_y);
            }
        }
        if (this.command == 'auto' || this.command == 'harvest') {
            pending_harvests = Object.keys(harvest_orders);
            if (pending_harvests.length > 0 && !frog_impassable.includes(getTile(this._x, this._y))) {
                key = pending_harvests[Math.floor(pending_harvests.length * Math.random())].split(",");
                harvest_x = parseInt(key[0]);
                harvest_y = parseInt(key[1]);
                val = harvest_orders[key];
                orderFrogHarvest(this, val, harvest_x, harvest_y);
            }
        }
        if (this.command == 'auto' || this.command == 'attack') {
            pending_attacks = Object.keys(attack_orders);
            if (pending_attacks.length > 0 && !frog_impassable.includes(getTile(this._x, this._y))) {
                key = pending_attacks[Math.floor(pending_attacks.length * Math.random())].split(",");
                attack_x = parseInt(key[0]);
                attack_y = parseInt(key[1]);
                val = attack_orders[key];
                orderFrogAttack(this, val, attack_x, attack_y);
            }
        }
    }

    // Head to some target
    else {
        var astar = new ROT.Path.AStar(this._x_t, this._y_t, frogPassableCallback, {topology:4});

        var path = [];
        var pathCallback = function(x, y) {
            path.push([x, y]);
        }
        astar.compute(this._x, this._y, pathCallback);

        path.shift();
        tile = getTile(x, y);
        if (path.length == 1) {
            if ((tile == ".." || tile == "gg" || (tile == "ww" && (build_orders[[this._x_t, this._y_t]] == 'bridge'))) && this.isBuilding) {
                build(this, this._x_t, this._y_t);
            }
            else if (this.isHarvesting) {
                harvest(this, this._x_t, this._y_t);
            }
            else if (this.isAttacking) {
                // FIXME: will attack anyone even if not the original target
                if ([this._x_t, this._y_t] in barb_locs) {
                    barb_id = barb_locs[[this._x_t, this._y_t]];
                    attack(this, barb_id);
                }
                else {
                    // FIXME: do this more often no?
                    barb = barbarians[this.trg_barb];
                    this._x_t = barb._x;
                    this._y_t = barb._y;
                }
            }
            else {
                delete build_orders[[this._x_t, this._y_t]];
            }
        }
        if (/*path.length == 1 ||*/ path.length == 0) {
            Game.log_display.drawText(0, 4, "Frog arrives.");
            // automatically harvest wood
//          if (tile == "**"){
//              Game.player.wood += 5;
//              setTile(this._x_t, this._y_t, tile_chars.EMPTY);
//          }
            delete attack_orders[this.trg_barb];
            this.wandering = true;
            this.trg_barb = -1;
            this.isAttacking = false;
            console.log(attack_orders);
        }
        else {
            x = path[0][0];
            y = path[0][1];
            //Game.display.draw(this._x, this._y, Game.map[this._x+","+this._y]);
            if(this.canMove(x,y)){
                this._x = x;
                this._y = y;
            }
        }
    }
    //this._draw();
//  console.log("frogman acted");
}

Frog.prototype._draw = function() {
    Game.display.draw(this._x, this._y, "..");
    Game.display.draw(this._x, this._y, "GG", "green");
}

