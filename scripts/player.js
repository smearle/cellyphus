
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
    this.seeds = 0;
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
    Game.gameTicks += 1;

    if(Game.gameTicks % Game.ticksPerDay == 0) 
    {
        Game.days += 1;
        if (Game.barbarian === null && Game.days % 5 == 0) {
            Game.barbarian = Game._createBeing(Barbarian, freeCells);
            Game.scheduler.add(Game.barbarian, true);
        }
    }

    Game.engine.lock();
    window.addEventListener("click", this);
    window.addEventListener("keydown", this);
}

//main game loop
Player.prototype.handleEvent = function(e) {
    var code = e.keyCode;

    Game.log_display.clear();
    Game.log_combat.clear();

    if (await_build_select) {
        if (code == 87) {
            displayText('Build wall. Select location.');
            next_build = build_items.WALL;
        }
        else if (code == 68) {
            displayText('Build door. Select location.');
            next_build = build_items.DOOR;
        }
        else if (code == 70) {
            displayText('Build fire. Select location.');
            next_build = build_items.FIRE;
        }
        else if (code == 66) {
            displayText('Build bed. Select location.');
            next_build = build_items.BED;
        }
        await_build_select = false;
        await_build_location = true;
    }
    else if (await_build_location) {
        if (typeof code === 'undefined') {
            var[x,y] = Game.display.eventToPosition(e);
            displayText('Ordered build at: ('+x.toString()+", "+y.toString()+")");
            build_orders[(x, y)] = next_build;
            console.log(build_orders.toString());
        }
//    await_build_location = false;
    }

    if (Game.player.getHealth() <= 0 || Game.player.getThirst() <= 0 || Game.player.getHunger() <= 0)
    {
        var message = "You survived " + Game.days + " days. ";
        if (Game.player.getHealth() <= 0)
        {
            message += "You lost all your health!";
        }
        else if (Game.player.getThirst() <= 0)
        {
            message += "You died from dehydration!";
        }
        if (Game.player.getHunger() <= 0)
        {
            message += "You starved to death!";
        }
        if (PLAYER_DEATH) {
            Game.engine.lock();
        }
        displayText(message);
    }

    if (Game.combatTarget != "None") {
        //freeze movement
        rand = Math.floor(Math.random() * 101);
//      console.log("random: " + rand);
        did_combat = true;

        //add attack for number press
        switch(code) {
            case 49: //pressed 1: slam
                if (rand <= Game.player.slamChance())
                {
                    Game.barbarian.health -= Game.player.slamDmg;
                    Game.player.health -= 1;
                    combatTextPlayer("You body slammed doing " + Game.player.slamDmg +" damage");
                }
                else
                {
                    combatTextPlayer("You slamed the air!");
                }
                
                break;
            case 50: //pressed 2: kick
                if (rand <= Game.player.kickChance())
                {
                    Game.barbarian.health -= Game.player.kickDmg;
                    Game.player.thirst -= 2;
                    combatTextPlayer("You kicked hard doing " + Game.player.kickDmg +" damage");
                }
                else
                {
                    combatTextPlayer("You kicked the dust!");
                }
                break;
            case 51: //pressed 3: punch
                if (rand <= Game.player.punchChance())
                {
                    Game.barbarian.health -= Game.player.punchDmg;
                    Game.player.hunger -= 2;
                    combatTextPlayer("You landed your punch for " + Game.player.punchDmg +" damage");
                }
                else
                {
                    combatTextPlayer("You swung and missed!");
                }
                break;
            default: //default to ignoring the barb
                combatTextPlayer("You ignore the barbarian and it slaps you in the head, in disbelief.");
                did_combat = false;  // this will allow player to take a non-combat action
        }


        //deal damage to 

        //add attack for enemy

        //enemy has died
        if (Game.barbarian.getHealth() <= 0)
        {
            Game.barbarian.health = 0;
            combatTextPlayer("You defeated the enemy");
            Game.scheduler.remove(Game.barbarian)
            Game.barbarian = null;
            Game.combatTarget = "None";
        }

        var newX = this._x;
        var newY = this._y;

    }
    else {
        did_combat = false;
    }

    if (!did_combat) 
    {
        //runs if mouse click
        if (typeof code === 'undefined')
        {
            var[x,y] = Game.display.eventToPosition(e);
            document.getElementById("clickedCoords").innerHTML = [x,y];
            var newX = this._x;
            var newY = this._y;
            if(x >= 0 && y >=0)
            {
                Game.frog._x_t = x;
                Game.frog._y_t = y;
//              console.log("this coords: " + this._x + ", " + this._y);
                if (getTile(x, y) == "..") {
                    Game.frog.building = true;
                }
            Game.frog.wandering = false;
            }
        }
        else //runs if button press (and player is not fighting barbarian)
        {
        Game.simulateGrass();

        var keyMap = {};
        // mapping keys to directions
        // arrow keys
        keyMap[38] = 0;
        keyMap[33] = 1;
        keyMap[39] = 2;
        keyMap[34] = 3;
        keyMap[40] = 4;
        keyMap[35] = 5;
        keyMap[37] = 6;
        keyMap[36] = 7;

        // WASE
        keyMap[65] = 6;
        keyMap[68] = 2;
        keyMap[87] = 0;
        keyMap[83] = 4;
        
        /* one of numpad directions? */
        if (!(code in keyMap))
        {   
            //dont move if invalid keypress
            newX = this._x;
            newY = this._y;
            // spacebar to plant seeds
            if (code == 32) {
                if (Game.player.seeds > 0) {
                    Game.log_display.drawText(0, 0, "You plant seeds.");
                    var[seed_x, seed_y] = getPlantTile(this._x, this._y);
//                  var[seed_x, seed_y] = [this._x, this._y];
                    setTile(seed_x, seed_y, tile_chars.GRASS);
                    drawTile(seed_x, seed_y);
                }
                else {
                    Game.log_display.drawText(0, 0, "You have no seeds to plant.");
                }

            }
            // detect "[b]uild" command
            else if (code == 66) {
                Game.log_display.drawText(0, 0, "Build: [w]all, [d]oor, [f]ire, [b]ed.");
                await_build_select = true;
                };

        }

        else
        {
            /* is there a free space? */
            var dir = ROT.DIRS[8][keyMap[code]];
//          console.log("dir: " + dir);
            var newX = this._x + dir[0];
            var newY = this._y + dir[1];
            trg_tile = getTile(newX, newY);
            if (player_impassable.indexOf(trg_tile) >= 0) {
                newX = this._x;
                newY = this._y;
                if (trg_tile == tile_chars.WATER) {
                    this.thirst = Math.min(100, this.thirst + 25);
                }
            }
        }

    }
}    

    Game.display.draw(this._x, this._y, Game.map[this._x+","+this._y]);
    // Move the player
    this._x = newX;
    this._y = newY;
    window.removeEventListener("keydown", this);
    
    displayHUD();
    //Game.tick ++;
    if (this.hunger == 0 && this.thirst == 0) {
        this.health--;
    }
    this.hunger = Math.max(this.hunger-1, 0);
    this.thirst = Math.max(this.thirst-1, 0);
    curr_tile = Game.map[this._x+","+this._y];
    if (curr_tile == "ww") {
        }
    else if (curr_tile == "gg") {
        Game.log_display.drawText(0, 0, "You eat grass.")
        this.hunger = Math.min(100, this.hunger + 25);
        setTile(this._x, this._y, "..");
        drawTile(this._x, this._y);
        this.seeds += 1;

    }
    this._draw();
    Game.engine.unlock();

    /*
    //draw ui
    panCamera();
    render();
    */
}
