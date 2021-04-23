
// Will the barbarian come for you?
var BARBARIAN = true;
// Will you die of any cause?
var PLAYER_DEATH = false;

var map_width = 64;
var map_height = 64;
var tileSet = document.createElement("img");

tileSet.src = "tileset.png";

const tile_chars = {
    WALL: "|",
    GRASS: "gg",
    PLAYER: "@",
    EMPTY: "..",
    FROGMAN: "GG",
    BARBARIAN: "SS",
    WATER: "ww",
    TREE: "**",
    DOOR: "dd",
    FIRE: "ff",
    BED: "bb",
    BRIDGE: "br",
}


frog_impassable = [tile_chars.WALL, tile_chars.WATER, tile_chars.FROGMAN, tile_chars.PLAYER, tile_chars.WATER, tile_chars.BARBARIAN]
barb_impassable = [tile_chars.WALL, tile_chars.WATER, tile_chars.FROGMAN, tile_chars.PLAYER, tile_chars.WATER, tile_chars.DOOR, tile_chars.BARBARIAN]
player_impassable = [tile_chars.WALL, tile_chars.WATER, tile_chars.FROGMAN, tile_chars.BARBARIAN]

tileWidth = 32;
var display_options = {
    layout: "tile",
    bg: "transparent",
    tileWidth: tileWidth,
    tileHeight: tileWidth,
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
        "dd": [320, 0],
        "ff": [12*tileWidth, 0],
        "bb": [11*tileWidth, 0],
        "br": [13*tileWidth, 0],
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
    event_handler: null,
    mouse: null,
    hawk: null,
    ananas: null,
    frog_manager: null,
    barbarians: [],
    blackLodge: null,

    gameTicks: 0,
    ticksPerDay: 300,
    days: 0,
    tickPerSec: 800,
    //combatSubjects: {"None": 1, "Barbarian": 2},
    combatTarget: null,

    init: function() {
        ///  top console  ///
        this.display = new ROT.Display(display_options);
        this.resource_display = new ROT.Display({width:28, height:8, fontSize:14})
        document.getElementById("consoleArea").appendChild(this.resource_display.getContainer());
        this.log_display = new ROT.Display({width:32, height:8, fontSize:14})
        document.getElementById("consoleArea").appendChild(this.log_display.getContainer());
        this.log_combat = new ROT.Display({width:42, height:8, fontSize:14})
        document.getElementById("consoleArea").appendChild(this.log_combat.getContainer());

        /// game area  ///
        //document.body.appendChild(this.display.getContainer());

        this._generateMap();
        this.event_handler = new EventHandler();
        window.addEventListener("click", this.event_handler.step);
        window.addEventListener("keydown", this.event_handler.step);

        var scheduler = new ROT.Scheduler.Simple();
        //make instance of game loop to run game loop stuff
        scheduler.add(this.event_handler, true);
        scheduler.add(this.player, true);
        scheduler.add(this.frog_manager, true);
        //TODO: multi-barbis!
        if (BARBARIAN) {
            for(let b=0;b<this.barbarians.length;b++){
                scheduler.add(this.barbarians[b], true);
            }
        }
        //scheduler.add(this.hawk, true);

      //this.engine = new ROT.Engine(scheduler);
        this.scheduler = scheduler;
        //this.tick = 0;
        this.combatTarget = null;
      //this.engine.start();


        //reset camera UI
        camera.focus = this.player;
        panCamera();
        render();
    },

    //TODO: factor this out, into vegetation code
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
    //          console.log(next_state);
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
        this._generateBlackLodge();
        this._drawWholeMap();

        this.player = this._createBeing(Player, freeCells);
        //this.mouse = this._createBeing(Cow, freeCells);
        //this.hawk = this._createBeing(Hawk, freeCells);
        this.frog_manager = new FrogManager();
//      this.spawnFrog();
//      this.spawnFrog();
        this.barbarians.push(this._createBarbarian());

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

    //generate a barbarian from the black lodge
    _createBarbarian: function(){
        return new Barbarian(this.blackLodge._x, this.blackLodge._y,this.blackLodge);
    },

    _generateBoxes: function(freeCells) {
        for (var i=0;i<10;i++) {
            var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
            var key = freeCells.splice(index, 1)[0];
            this.map[key] = "**";
            if (!i) { this.ananas = key; } /* first box contains an ananas */
        }
    },

    //create the base for the barbarians
    _generateBlackLodge: function(){
        var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
        var key = freeCells.splice(index, 1)[0].split(",");
        let x = parseInt(key[0]);
        let y = parseInt(key[1]);

        //set base of the black lodge
        this.blackLodge = {_x:x+4, _y:y+4};

        //build (black) walls around it
        let lodge = [
        [0,0,0,1,1,1,0,0,0],
        [0,0,0,1,0,1,0,0,0],
        [1,1,1,1,1,1,1,1,1],
        [1,0,1,0,0,0,1,0,1],
        [1,0,1,0,0,0,1,0,1],
        [0,0,1,1,0,1,1,0,0],
        ]
        for(let r=0;r<lodge.length;r++){
            for(let c=0;c<lodge[0].length;c++){
                let nkey = ((x+c)+","+(y+r));
                if(lodge[r][c] == 1){
                    this.map[nkey] = "|";
                }
            }
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
    },

    // Iterate through tiles in the map and return a set consisting of valid spawn points for a new frog
    _getFreeFrogSpawnCells: function() {
        freeCells = [];
        for (x=0; x<map_width; x++) {
            for (y=0; y<map_height; y++) {
                var key = x+","+y;
                if (this.map[key] == ".."){
                    freeCells.push(key);
                }
            }
        }
        return freeCells;
    },

    spawnFrog: function() {
        freeCells = this._getFreeFrogSpawnCells();
        new_frog = this._createBeing(Frog, freeCells);
        this.frog_manager.frogs.push(new_frog);
    }
};

function drawMap() {

    //DRAW EVERYTHING HERE ALL AT ONCE
    Game._drawWholeMap();                                       //draw map

    Game.player._draw();                                             //draw player

    let barbSet = Game.barbarians;                               //draw bararians
    for(let b=0;b<barbSet.length;b++){barbSet[b]._draw();}


    let frogSet = Game.frog_manager.frogs;                      //draw frogs
    for(let f=0;f<frogSet.length;f++){frogSet[f]._draw();}


    /*
    //draw ui
    panCamera();
    render();
    */
}
/*
async function mainLoop() {
    Game.init();
    while (1) {
        let actor = Game.scheduler.next();
        if (!actor) { break; }
        await actor.act();
        console.log(output.join(""));
    }
}

let scheduler = new ROT.Scheduler.Simple();
let output = [];

window.onload = function() {
  //Game.init();
    mainLoop();
}
*/
window.onload = function(){
    Game.init();
}

//prevent scrolling with the game
window.addEventListener("keydown", function(e) {
    // space and arrow keys
    if(([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1)){
        e.preventDefault();
    }
}, false);

//Game.init();
