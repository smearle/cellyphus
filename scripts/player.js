
//change to player class
var Player = function(x, y) {
    this._x = x;
    this._y = y;
    this.maxHealth = 100;
    this.maxThirst = 100;
    this.maxHunger = 100;

    this.health = 100;
    this.thirst = 100;
    this.hunger = 100;
    this.seeds = 30;
    this.wood = 30;
    this.meat = 0;

    this.punchDmg = 7;
    this.kickDmg = 10;
    this.slamDmg = 20;

    this._draw();
}

Player.prototype.getSpeed = function() { return 100; }
Player.prototype.getX = function() { return this._x; }
Player.prototype.getY = function() { return this._y; }
Player.prototype.getHealth = function() { return this.health; }
Player.prototype.getHunger = function() { return this.hunger; }
Player.prototype.getThirst = function() { return this.thirst; }

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

//calls main game loop
Player.prototype.act = function() {
//  console.log('player tick');
    if (this.getHealth() <= 0 || Game.player.getThirst() <= 0 || Game.player.getHunger() <= 0)
    {
        var message = "You survived " + Game.days + " days. ";
        if (this.getHealth() <= 0)
        {
            message += "You lost all your health!";
        }
        else if (this.getThirst() <= 0)
        {
            message += "You died from dehydration!";
        }
        if (this.getHunger() <= 0)
        {
            message += "You starved to death!";
        }
        if (PLAYER_DEATH) {
            Game.engine.lock();
        }
        displayText(message);
    }
}

Player.prototype._draw = function() {
    Game.display.draw(this._x, this._y, tile_chars.DIRT, "transparent");
    Game.display.draw(this._x, this._y, "@", "transparent");
}
