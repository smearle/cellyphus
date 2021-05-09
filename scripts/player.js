
//change to player class
var Player = function(x, y) {
    this._x = x;
    this._y = y;
    this.maxHealth = 100;
    this.maxThirst = 100;
    this.maxHunger = 100;

    this.dead = false;
    this.immortal = false;
    this.cod = "Here lies the player.\nCause of death: Being a dumbass";          //cause of death

    this.health = 100;
    this.thirst = 100;
    this.hunger = 100;
    this.thirstDecay = 0;
    this.hungerDecay = 0;


    this.seeds = 20;
    this.wood = 30;
    this.meat = 0;

    this.punchDmg = 7;
    this.kickDmg = 10;
    this.slamDmg = 20;

    this.moved = false;

    this._draw();
}


Player.prototype.getSpeed = function() { return 100; }
Player.prototype.getX = function() { return this._x; }
Player.prototype.getY = function() { return this._y; }
Player.prototype.getHealth = function() { return this.health; }
Player.prototype.getHunger = function() { return this.hunger; }
Player.prototype.getThirst = function() { return this.thirst; }
Player.prototype.takeDamage = function(dmg) { this.health -= dmg; }
Player.prototype.healDamage = function(dmg) { this.health += dmg; }
Player.prototype.canMove = function(x,y){return !Game.anyAtPos(x,y);}

//combat functions
Player.prototype.punchChance = function() //percent chance to hit punch
{ 
    var pctHunger = this.hunger / this.maxHunger;
    var chance = Math.floor(80 + pctHunger * 20);
    return chance; 
} 
Player.prototype.kickChance = function() //percent chance to hit kick
{ 
    var pctThirst = this.thirst / this.maxThirst;
    var chance = Math.floor(50 + pctThirst * 50);
    return chance;
} 
Player.prototype.slamChance = function() //integer percent chance to hit slam
{ 
    var diff = this.maxHealth - this.health;
    var chance = Math.floor(1.25 * diff);

    if (chance > 100) { chance = 100; }
    return chance;
}
Player.prototype.defend = function() //changes to defend minigame and registers damage taken
{
    localStorage.setItem("damageRegistered", true);
    let dmg =  localStorage.getItem("damageTaken");
    console.log("damage: " + dmg); 
    this.takeDamage(dmg);
    localStorage.setItem("damageTaken", 0);
} 

//increase hunger by a certain rate
Player.prototype.incHunger = function(rate) {
    this.hungerDecay++;
    if(this.hungerDecay >= rate){
        this.hunger = Math.max(this.hunger-1, 0);
        this.hungerDecay = 0;
    }
};

//increase thirst by a certain rate
Player.prototype.incThirst = function(rate){
    this.thirstDecay++;
    if(this.thirstDecay >= rate){
        this.thirst = Math.max(this.thirst-1, 0);
        this.thirstDecay = 0;
    }
}

//calls main game loop
Player.prototype.act = function(newX, newY) {
    curr_tile = getTile(this._x, this._y);
    if (curr_tile == tile_chars.BED) {
        this.health = Math.min(this.maxHealth, this.health+1);
    }
    else {
        this.incHunger(Math.ceil(Game.ticksPerDay*3/this.maxHunger));       //3 days to starvation
        this.incThirst(Math.ceil((Game.ticksPerDay/2)/this.maxThirst));     //half a day to dehydration
    }

    //// PLAYER UPDATES

    //test defend ->it shouldnt actually be here
    this.defend();

    // Move the player
    if(this.canMove(newX,newY)){
        this._x = newX;
        this._y = newY;
    }
    

    //eat grass if on the tile
    curr_tile = Game.map[this._x+","+player._y];
    if (curr_tile == "gg") {
        Game.log_display.drawText(0, 0, "You eat grass.")
        this.hunger = Math.min(100, this.hunger + 25);
        setTile(this._x, this._y, "..");
        //drawTile(player._x, player._y);
//      player.seeds += 1;
        ateGrass = true;

    }

    //decrease player health if at quarter hunger or thirst every third tick
    if (((this.hunger <= (this.maxHunger/4)) || (this.thirst <= (this.maxThirst/4)))) {
        if((Game.gameTicks % 2 == 0))
            this.health = Math.max(0, this.health-1);
    }
    else if((Game.gameTicks % 10 == 0)){
        this.health = Math.min(this.maxHealth, this.health+1);
    }


    
//  console.log('player tick');
    if (!this.immortal && (this.getHealth() <= 0 || this.getThirst() <= 0 || this.getHunger() <= 0))
    {
        var message = "You survived " + Game.days + " days.";
        if (this.getHealth() <= 0)
        {
            message += "\nYou lost all your health!";
        }
        else if (this.getThirst() <= 0)
        {
            message += "\nYou died from dehydration!";
        }
        if (this.getHunger() <= 0)
        {
            message += "\nYou starved to death!";
        }
        /*
        if (PLAYER_DEATH) {
            Game.engine.lock();
        }
        displayText(message);
        */
        this.cod = message;
        this.dead = true;

        showDeathScreen();
        clearTimeout(Game.st);
        Game.st = 0;
    }
}

Player.prototype._draw = function() {
    Game.display.draw(this._x, this._y, tile_chars.DIRT, "transparent");
    Game.display.draw(this._x, this._y, "@", "transparent");
}
