//change to barbarian class
//var Barbarian = function(x, y) {
function Barbarian(x, y,lodge) {
    this._x = x;
    this._y = y;
    this.health = 100;
    this.fullHealth = 100;
    this.power = 5;
    this.radar = 25;
    this.speed = 100;
    this.base = lodge;
    this.at_base = true;
    this.recharge = 0;
    this._draw();
}

Barbarian.prototype.getSpeed = function() { return this.speed; }
Barbarian.prototype.getHealth = function() { return this.health; }

Barbarian.prototype.act = function() {
//  console.log('barbarian tick');

    //strong enough to fight
    if(this.health > 30){
        //within range? chase the player or flee
        if(this.getDistance(Game.player) < this.radar){
            this.chase();
        }
        //quarantined? go outside
        else if(this.getDistance(this.base) < 10){
            this.leaveHome();
        }
        //wander around
        else{
            this.idle();
        }
    }
    //run away back to the base
    else if(!this.at_base){
        this.flee();
    }

    //regain health
    if(this.at_base && this.health < this.fullHealth){
        this.recharge++;
        if(this.recharge >= 10){
            this.health += 5;
            this.recharge = 0;
        }   
    }

    //Game.display.draw(this._x, this._y, Game.map[this._x+","+this._y]);
    //this._draw();
}

//return Manhattan distance from this to another object
Barbarian.prototype.getDistance = function(other){
    return Math.abs(other._x - this._x) + Math.abs(other._y - this._y);
}

//chase after the player if within range
Barbarian.prototype.chase = function(){
    var x = Game.player.getX();
    var y = Game.player.getY();

    var astar = new ROT.Path.AStar(x, y, barbPassableCallback, {topology:4});

    var path = [];
    var pathCallback = function(x, y) {
        path.push([x, y]);
    }
    astar.compute(this._x, this._y, pathCallback);

    path.shift();

    //engage in combat
    if (path.length == 1 || path.length == 0) {
        if (Math.abs(this._x - x) > 1 || Math.abs(this._y - y) > 1) {
            //this._draw();
        }
        else {
            Game.combatTarget = this;
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

            console.log("he attac")
        }
    }
    //move towards player
    else {
        if (Game.combatTarget == this) {Game.combatTarget = null;}

        x = path[0][0];
        y = path[0][1];
        //Game.display.draw(this._x, this._y, Game.map[this._x+","+this._y]);
        this._x = x;
        this._y = y;
        //this._draw();
        console.log("why are you running?! WHY ARE YOU RUNNING!?!?")
    }
}

//Random movement for idle behavior
Barbarian.prototype.idle = function(){
    let random_dirs = [[-1,0],[1,0],[0,0],[0,-1],[0,1]];
    let d = random_dirs[Math.floor(Math.random()*random_dirs.length)];

    let x = this._x + d[0];
    let y = this._y + d[1];
    

    //valid spot to move to
    if(barbPassableCallback(x,y)){
        //Game.display.draw(this._x, this._y, Game.map[this._x+","+this._y]);
        this._x = x;
        this._y = y;
        //this._draw();
        console.log("head empty... ")
    }else{
        console.log('oof')
    }
}

//go to a random place
Barbarian.prototype.leaveHome = function(){
    var index = Math.floor(ROT.RNG.getUniform() * Game.freeCells.length);
    var key = Game.freeCells.splice(index, 1)[0].split(",");
    let x = parseInt(key[0]);
    let y = parseInt(key[1]);

    var astar = new ROT.Path.AStar(x, y, barbPassableCallback, {topology:4});

    var path = [];
    var pathCallback = function(x, y) {
        path.push([x, y]);
    }
    astar.compute(this._x, this._y, pathCallback);

    path.shift();

    //engage in combat
    if (path.length == 0) {
        return
    }
    //move towards location
    else {
        x = path[0][0];
        y = path[0][1];
        this._x = x;
        this._y = y;
        //this._draw();
        console.log("omw. leaving in 5 min")
    }
}

//have barbarian run back to its base
Barbarian.prototype.flee = function(){
    //ET go home
    if(this.base != null && !this.at_base){
        var x = this.lodge._x;
        var y = this.lodge._y;

        var astar = new ROT.Path.AStar(x, y, barbPassableCallback, {topology:4});

        var path = [];
        var pathCallback = function(x, y) {
            path.push([x, y]);
        }
        astar.compute(this._x, this._y, pathCallback);

        path.shift();

        //home safe - recharge health
        if (path.length == 0) {
            this.at_base = true;
        }
        //run forrest run!
        else{
            if (Game.combatTarget == this) {Game.combatTarget = null;}

            x = path[0][0];
            y = path[0][1];
            //Game.display.draw(this._x, this._y, Game.map[this._x+","+this._y]);
            this._x = x;
            this._y = y;
            //this._draw();
        }

        console.log("screw you guys! i'm going home")
    }
    //hopeless, just run around
    else if(this.base == null){
        this.idle();
        console.log("welp, guess i'll die")
    }
    //"what do we do now?" "nothing"
    else{
        console.log("magic conch shell!")
        return;
    }
}

Barbarian.prototype._draw = function() {
    Game.display.draw(this._x, this._y, "..", "transparent");
    Game.display.draw(this._x, this._y, "SS", "transparent");
}
