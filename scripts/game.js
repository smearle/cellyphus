var map_width = 40;
var map_height = 40;
var tileSet = document.createElement("img");

tileSet.src = "tileset.png";

const tile_chars = {
    WALL: "|",
    GRASS: "gg",
    PLAYER: "@",
    EMPTY: "..",
    FROGMAN: "GG",
    WATER: "ww",
    TREE: "**",
}

impassable = [tile_chars.WALL, tile_chars.WATER, tile_chars.FROGMAN]

var display_options = {
    layout: "tile",
    bg: "transparent",
    tileWidth: 32,
    tileHeight: 32,
    tileSet: tileSet,
    tileMap: {
        "@": [0, 0],
        "..": [32, 0],
        "gg": [64, 0],
        "**": [96, 0],
        "GG": [160, 0],
        "HH": [64, 0],
        "SS": [288, 0],
        "mm": [64, 0],
        "ww": [128, 0],
        "|": [256, 0],
    },
    width: map_width,
    height: map_height,
    spacing: 1.1,
}

var Game = {
    display: null,
    map: {},
    engine: null,
    player: null,
    mouse: null,
    hawk: null,
    ananas: null,

    gameTicks: 0,
    ticksPerDay: 3,
    days: 0,
    //combatSubjects: {"None": 1, "Barbarian": 2},
    combatTarget: null,

    init: function() {
        this.display = new ROT.Display(display_options);
        this.resource_display = new ROT.Display({width:map_width, height:8})
        document.body.appendChild(this.resource_display.getContainer());
        this.log_display = new ROT.Display({width:map_width, height:8})
        document.body.appendChild(this.log_display.getContainer());

        this.log_combat = new ROT.Display({width:map_width, height:8})
        document.body.appendChild(this.log_combat.getContainer());

        const div = document.createElement("div");
        document.body.appendChild(div);
        document.body.appendChild(this.display.getContainer());

        this._generateMap();

        var scheduler = new ROT.Scheduler.Simple();
        scheduler.add(this.player, true);
        //scheduler.add(this.mouse, true);
        scheduler.add(this.grasshopper, true);
        scheduler.add(this.barbarian, true);
        //scheduler.add(this.hawk, true);

        this.engine = new ROT.Engine(scheduler);
        this.scheduler = scheduler;
        //this.tick = 0;
        this.combatTarget = "None";
        this.engine.start();
    },

    simulateGrass: function() {
      if (!(Game.gameTicks % 5 == 0)) {
        return;
      }
      live = [];
      trees = [];
      dead = [];
      for (var iy = map_width - 1; iy >= 0; iy--) {
        for (var ix = map_height - 1; ix >= 0; ix--) {
            var key = ix+","+iy;
            // check for grass on valid tiles
            cur_tile = getTile(ix, iy);
            if (this.map[key] == "gg" || this.map[key] == "..") {

                next_state = census(ix, iy);
                console.log(next_state);
                if (next_state == 1) {
    //          live.push(key);
                    live.push([ix, iy]);
    //            live.push({
    //              x: ix,
    //              y: iy,
    //            });
                }
                else if (next_state == 2) {
                    trees.push([ix, iy]);
                }
                else {
                    if (cur_tile == tile_chars.TREE && Math.Random() < 0.2) {
                        dead.push([ix, iy]);
                    }
                    else {
                         dead.push([ix, iy]);
                    }
                }
            }
          }
        }
        for (var i = 0; i < live.length; i++) {
              [x, y] = live[i];
              var key = x+","+y;
              this.map[key] = "gg";
              this.display.draw(x, y, this.map[key]);
        }
        for (var i = 0; i < trees.length; i++) {
              [x, y] = trees[i];
              setTile(x, y, tile_chars.TREE);
              drawTile(x, y);
        }
        for (var i = 0; i < dead.length; i++) {
            [x, y] = dead[i];
            var key = x+","+y;
            this.map[key] = "..";
            this.display.draw(x, y, this.map[key]);
        }
      },
    //  toggle(cell.x, cell.y, 'next');

    _generateCellMap: function() {
        var freeCells = [];
        var map = new ROT.Map.Cellular(map_width, map_height, {
            born: [4, 5, 6, 7, 8],
            survive: [2, 3, 4, 5],
        })
        map.randomize(0.9);
        for (var i = 10; i>=0; i--) {
            map.create(i ? null: this.display.DEBUG);
        }
        for (x=0; x<map_width; x++) {
            for (y=0; y<map_height; y++) {
                if (!(map._map[x][y])) {
                    var key = x+","+y;
                    freeCells.push(key);
                    this.map[key] = "..";
                    }
                else {
                    var key = x+","+y;
                    this.map[key] = "ww";
                }

                }
            }
        return freeCells;
    },


    _generateDigMap: function() {
        var digger = new ROT.Map.Digger();
        var freeCells = [];

        var digCallback = function(x, y, value) {
            if (value) { return; }

            var key = x+","+y;
            this.map[key] = "..";
            freeCells.push(key);
        }
        digger.create(digCallback.bind(this));
    },

    _generateMap: function() {
        freeCells = this._generateCellMap();

        this._generateBoxes(freeCells);
        this._generateGrass(freeCells);
        this._drawWholeMap();

        this.player = this._createBeing(Player, freeCells);
        //this.mouse = this._createBeing(Cow, freeCells);
        //this.hawk = this._createBeing(Hawk, freeCells);
        this.grasshopper = this._createBeing(Grasshopper, freeCells);
        this.barbarian = this._createBeing(Barbarian, freeCells);

        this.freeCells = freeCells;
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
            this.map[key] = "**";
            if (!i) { this.ananas = key; } /* first box contains an ananas */
        }
    },

    _generateGrass: function(freeCells) {
        for (var i=0;i<130;i++) {
            var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
            var key = freeCells.splice(index, 1)[0];
            this.map[key] = "gg";
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
//    return (x+","+y in Game.map);
      key = x+","+y;
      tile_type = Game.map[key];
      var passable = (!(impassable.indexOf(tile_type) >= 0));
      return passable;
}


var frogPassableCallback = function(x, y) {
//    return (x+","+y in Game.map);
      key = x+","+y;
      tile_type = Game.map[key];
      var passable = ((!(impassable.indexOf(tile_type)) >= 0) || (tile_type == tile_chars.WATER));
      return passable;
}

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
    this.wood = 0;
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
    //window.addEventListener("click", this);
    window.addEventListener("click", this);
    window.addEventListener("keydown", this);
}

Player.prototype.handleEvent = function(e) {
    var code = e.keyCode;

    Game.log_display.clear();
    Game.log_combat.clear();

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
        Game.engine.lock();
        displayText(message);
    }

    if (Game.combatTarget != "None") {
        //freeze movement
        rand = Math.floor(Math.random() * 101);
//      console.log("random: " + rand);

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
            default: //default to punch
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
    else 
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
                Game.grasshopper._x_t = x;
                Game.grasshopper._y_t = y;
//              console.log("this coords: " + this._x + ", " + this._y);
                if (getTile(x, y) == "..") {
                    Game.grasshopper.building = true;
                }
            Game.grasshopper.wandering = false;
            }
        }
        else //runs if button press
        {
        Game.simulateGrass();

        var keyMap = {};
        keyMap[38] = 0;
        keyMap[33] = 1;
        keyMap[39] = 2;
        keyMap[34] = 3;
        keyMap[40] = 4;
        keyMap[35] = 5;
        keyMap[37] = 6;
        keyMap[36] = 7;

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
        }

        else
        {
            /* is there a free space? */
            var dir = ROT.DIRS[8][keyMap[code]];
//          console.log("dir: " + dir);
            var newX = this._x + dir[0];
            var newY = this._y + dir[1];
            trg_tile = getTile(newX, newY);
            if (impassable.indexOf(trg_tile) >= 0) {
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
}

Player.prototype._draw = function() {
    Game.display.draw(this._x, this._y, "@", "#ff0");
}

//AI stuff

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




window.onload = function() {
    Game.init();
}



//Game.init();

