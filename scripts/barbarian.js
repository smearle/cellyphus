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