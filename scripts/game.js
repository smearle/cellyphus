
// Will the barbarian come for you?
var BARBARIAN = true;

// Will you die of any cause?
var PLAYER_DEATH = false;

var setFire = false;
var grassLand20 = false;
var spawnedFrog = false;
var arsonicFrogMade = false;

var map_width = 64;
var map_height = 64;
var tileSet = document.createElement("img");

tileSet.src = "tileset.png";


const tile_chars = {
    WALL: "|",
    REDWALL: "||",
    GRASS: "gg",
    PLAYER: "@",
    DIRT: "..",
    FROGMAN: "GG",
    BARBARIAN: "SS",
    WATER: "ww",
    TREE: "**",
    DOOR: "dd",
    FIRE: "ff",
    BED: "bb",
    BRIDGE: "br",
    FLAME: "fl",
    ANT: "an",
    REDBRICK: "||",
}


frog_impassable = [tile_chars.TREE, tile_chars.WALL, tile_chars.FROGMAN, tile_chars.PLAYER, tile_chars.BARBARIAN, tile_chars.REDBRICK]
barb_impassable = [tile_chars.TREE, tile_chars.WALL, tile_chars.WATER, tile_chars.FROGMAN, tile_chars.PLAYER, tile_chars.WATER, tile_chars.DOOR, tile_chars.BARBARIAN, tile_chars.REDBRICK]
player_impassable = [tile_chars.TREE, tile_chars.WALL, tile_chars.WATER, tile_chars.FROGMAN, tile_chars.BARBARIAN, tile_chars.REDBRICK]

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
        "mm": [64, 0],
        "HH": [64, 0],
        "**": [96, 0],
        "ww": [128, 0],
        "GG": [160, 0],
        "|": [8*tileWidth, 0],
        "SS": [9*tileWidth, 0],
        "dd": [10*tileWidth, 0],
        "bb": [11*tileWidth, 0],
        "ff": [12*tileWidth, 0],
        "br": [13*tileWidth, 0],
        "fl": [14*tileWidth, 0],
        "||": [15*tileWidth, 0],
        "an": [16*tileWidth, 0],
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
    kingWall:null,

    gameTicks: 0,
    curState: "start",
    ticksPerDay: 150,
    days: 0,
    tickPerSec: 800,
    game_mode: 'real',
    st : 0,
    //combatSubjects: {"None": 1, "Barbarian": 2},
    combatTarget: null,

    setup:function(){
        ///  top console  ///
        this.display = new ROT.Display(display_options);

        //this.resource_display = new ROT.Display({width:28, height:8, fontSize:14})
        //document.getElementById("consoleArea").appendChild(this.resource_display.getContainer());
        this.resource_display = document.createElement("canvas");
        this.resource_display.width = 310;
        this.resource_display.height = 112;
        document.getElementById("consoleArea").appendChild(this.resource_display);

        this.log_display = new ROT.Display({width:32, height:8, fontSize:14})
        document.getElementById("consoleArea").appendChild(this.log_display.getContainer());

        this.log_combat = new ROT.Display({width:42, height:8, fontSize:14})
        document.getElementById("consoleArea").appendChild(this.log_combat.getContainer());
    },

    init: function() {
        

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

        //set objectives
        initializeObjectives();

        //clear log
        txtLog = [];
    },

    //TODO: factor this out, into vegetation code
    simulateGrass: function() {
      if (!(Game.gameTicks % 5 == 0)) {
        return;
      }
      live = [];
      trees = [];
      dead = [];
      flames = [];
      dirt = 0;
      // Iterate through all tiles on the map and determine its next state based on CA-like rules
      // For grass it is dumb GoL. For trees it is ...
      // For fire it is...
      for (var iy = map_width - 1; iy >= 0; iy--) {
        for (var ix = map_height - 1; ix >= 0; ix--) {
            var key = ix+","+iy;
            // check for grass on valid tiles
            cur_tile = getTile(ix, iy);
            if ([tile_chars.GRASS, tile_chars.FLAME, tile_chars.TREE, tile_chars.DIRT].indexOf(this.map[key]) >= 0) {

                if(this.map[key] == tile_chars.DIRT)
                    dirt++;

                next_state = census(ix, iy);
                if (next_state == CAstates.GRASS) {
                    live.push([ix, iy]);
                }
                else if (next_state == CAstates.TREE) {
                    trees.push([ix, iy]);
                }
                else if (next_state == CAstates.FIRE) {
                    flames.push([ix, iy]);
                    setFire = true;
                }
                else if (next_state == CAstates.DIRT) {
                    dead.push([ix, iy]);
                }
            }
          }
        }
        for (var i = 0; i < live.length; i++) {
              [x, y] = live[i];
              var key = x+","+y;
              this.map[key] = "gg";
        }
        for (var i = 0; i < trees.length; i++) {
              [x, y] = trees[i];
              setTile(x, y, tile_chars.TREE);
        }
        for (var i = 0; i < dead.length; i++) {
            [x, y] = dead[i];
            var key = x+","+y;
            this.map[key] = "..";
        }
        for (var i = 0; i < flames.length; i++) {
            [x, y] = flames[i];
            var key = x+","+y;
            this.map[key] = tile_chars.FLAME;
        }
        //console.log("fire: " + flames.length)

        //spawn a new frog at the 7th flame
        if(flames.length >= 5 && !arsonicFrogMade){
            [x, y] = flames[4];
            Game.spawnFrogAt(x,y)
            arsonicFrogMade = true;
            displayText("A new frog is created from the ashes of the earth! @ (" + x + "," + y +")");
            //console.log("fire frog boy!")
        }
        else if(flames.length == 0){        //reset whether a new arson frog can be made
            arsonicFrogMade = false;
        }

        //add all together to determine ratio of foliage to dirt
        let foliage = live.length + trees.length;
        let non_foliage = dirt;

        console.log(foliage + " / " + non_foliage + " = " + (foliage/non_foliage))
        //20% of the map covered in foliage
        if(foliage/non_foliage >= 0.2){
            grassLand20 = true;
        }


      },
    //  toggle(cell.x, cell.y, 'next');

    _generateCellMap: function() {
        var freeCells = [];
        var m = new ROT.Map.Cellular(map_width, map_height, {
            born: [4, 5, 6, 7, 8],
            survive: [2, 3, 4, 5],
        })
        m.randomize(0.9);
        for (var i = 10; i>=0; i--) {
            m.create(i ? null: this.display.DEBUG);
        }
        for (x=0; x<map_width; x++) {
            for (y=0; y<map_height; y++) {
                if (!(m._map[x][y])) {
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

        
        //this.mouse = this._createBeing(Cow, freeCells);
        //this.hawk = this._createBeing(Hawk, freeCells);
        this.frog_manager = new FrogManager();
//      this.spawnFrog();
//      this.spawnFrog();
        this.barbarians = [];
        barb_0 = this._createBarbarian()
        this.barbarians.push(barb_0);      
        barbarians[barb_id] = barb_0;
        barb_1 = this._createBarbarian()
        this.barbarians.push(barb_1);   
        barbarians[barb_id] = barb_1;
        this.king_barbarian = this._createKingBarbarian();
        this.barbarians.push(this.king_barbarian);
        barbarians[barb_id] = this.king_barbarian;

        this.freeCells = freeCells;

        this.player = this._createBeing(Player, freeCells);
    },

    _createBeing: function(what, freeCells) {
        var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
        var key = freeCells.splice(index, 1)[0];
        var parts = key.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);
        return new what(x, y);
    },

    //generate a barbarian from the black (red) lodge
    _createBarbarian: function(){
        // TODO: reset this at some point I guess to prevent overflow
        barb_id ++;
        return new Barbarian(this.blackLodge._x, this.blackLodge._y, this.blackLodge, barb_id);
    },

    //create special king barbarian
    _createKingBarbarian: function(){
        barb_id++;
        let x = this.blackLodge._x;
        let y = this.blackLodge._y-3;
        let kb = new Barbarian(x,y,{_x:x, _y:y}, barb_id, true);

        //modify properties
        kb.fullHealth = 200;
        kb.health = 200;
        kb.power = 10;

        return kb;
    },

    //destroy the king wall
    _destroyWall:function(){
        this.kingWall.intact = false;
        let key = (this.kingWall._x+","+this.kingWall._y);
        this.map[key] = tile_chars.DIRT;
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
        let x = Math.floor(Math.random()*(map_width-25))+10;
        let y = Math.floor(Math.random()*(map_height-25))+10;

        //set base of the black lodge
        this.blackLodge = {_x:x+4, _y:y+4};

        //build (black) walls around it
        let lodge = [
        [0,0,0,1,1,1,0,0,0],
        [0,0,0,1,0,1,0,0,0],
        [1,1,1,1,2,1,1,1,1],
        [1,0,1,0,0,0,1,0,1],
        [1,0,1,0,0,0,1,0,1],
        [0,0,1,1,0,1,1,0,0],
        [0,0,0,0,0,0,0,0,0]
        ]
        for(let r=0;r<lodge.length;r++){
            for(let c=0;c<lodge[0].length;c++){
                let nkey = ((x+c)+","+(y+r));
                if(lodge[r][c] == 1){
                    this.map[nkey] = tile_chars.REDBRICK;
                }else if(lodge[r][c] == 2){
                    this.map[nkey] = tile_chars.REDWALL;
                    this.kingWall = {_x:x+c,_y:y+r,intact:true}
                }else{
                    this.map[nkey] = tile_chars.DIRT;
                }
            }
        }



    },

    _generateGrass: function(freeCells) {
        for (var i=0;i<170;i++) {
            var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
            var key = freeCells.splice(index, 1)[0];
            this.map[key] = "gg";
        }
        this.simulateGrass();
    },

    _newGrass: function(){
        for (x=0; x<map_width; x++) {
            for (y=0; y<map_height; y++) {
                var key = x+","+y;
                if (this.map[key] == ".." && Math.random()>=0.9){
                    this.map[key] = tile_chars.GRASS;
                }
            }
        }
        displayText("The frog gods have gifted you with bountiful grass!")
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
        spawnedFrog = true;
        freeCells = this._getFreeFrogSpawnCells();
        new_frog = this._createBeing(Frog, freeCells);
        this.frog_manager.frogs.push(new_frog);
        addNewFrogUI(this.frog_manager.frogs.length-1);
    },

    spawnFrogAt: function(x, y) {
        spawnedFrog = true;
        new_frog = this._createBeing(Frog, [x+","+y]);
        this.frog_manager.frogs.push(new_frog);
        addNewFrogUI(this.frog_manager.frogs.length-1);
    },

    //check if movable entities at current position
    entityAtPos: function(e,x,y){
        return e._x == x && e._y == y;
    },
    anyAtPos: function(x,y){
        if(this.entityAtPos(this.player,x,y))
            return true;

        let frogs = this.frog_manager.frogs;
        for(let f=0;f<frogs.length;f++){
            if(this.entityAtPos(frogs[f],x,y))
                return true;
        }

        let barbs = this.barbarians;
        for(let b=0;b<barbs.length;b++){
            if(this.entityAtPos(barbs[b],x,y))
                return true;
        }

        return false;
    }
};

function drawMap() {

    //DRAW EVERYTHING HERE ALL AT ONCE
    Game._drawWholeMap();                                       //draw map

    Game.player._draw();                                          //draw player

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


/// set game speed and mode

//repeat the step (allow for change in tick-per-sec)
function repeatStep(){
    Game.event_handler.step(null);
    Game.st = setTimeout(repeatStep, Game.tickPerSec);
}
//reset the timeout (prevent double actions)
function resetStep(){
    clearTimeout(Game.st);
    Game.st = 0;
    Game.st = setTimeout(repeatStep, Game.tickPerSec);
}

//start screens
function startUpScreen(){
    Game.setup();
    titleScreen();
}
function titleScreen(){
    Game.curState = "start";
    document.getElementById("titleScreen").style.display = "block";
    document.getElementById("startMenu").style.display = "block";
    document.getElementById("gameSide").style.display = "none";
    document.getElementById("game").style.display = "none";
    drawTitle();
    startTitleAnim();
    Game.log_display.drawText(12, 1, "A game by:\n\nSam Earle\nDaniel Tse\nM Charity");
}

//reset map and properties
function resetGame(){
    //remove frog divs
    if(Game.frog_manager != null){
        let old_frogs = Game.frog_manager.frogs;
        for(let f=1;f<old_frogs.length;f++){
            document.getElementById("frog"+f).remove();
        }
    }
    

    //reset properties
    Game.map = {};
    Game.engine = null;
    Game.player = null;
    Game.event_handler = null;
    Game.frog_manager = null;
    Game.barbarians = [];
    Game.blackLodge = null;
    Game.kingWall = null;
    Game.days = 0;
    Game.gameTicks = 0;

    Game.init();
    Game.curState = "game";
    
    //localStorage.clear();
    localStorage.setItem("damageDealt", 0);
    localStorage.setItem("damageTaken", 0);
    localStorage.setItem("damageRegistered", false);

    //set to real-time or turn based time
    if(localStorage.stepMode)
        Game.game_mode = localStorage.stepMode;
    else
        localStorage.stepMode = Game.game_mode;

    toggleGameStep(Game.game_mode);
    document.getElementById("gameModeSelect").value = Game.game_mode;
}


//start the entire game (main game)
function startGame(){
    document.getElementById("titleScreen").style.display = "none";
    document.getElementById("startMenu").style.display = "none";
    document.getElementById("deathScreen").style.display = "none";
    document.getElementById("endMenu").style.display = "none";
    document.getElementById("gameSide").style.display = "block";
    document.getElementById("game").style.display = "block";
    resetGame();
    stopTitleAnim();
}

function quickStartGame(){
    Game.setup();
    startGame();
}

function whichGameMode(){
    if(!localStorage.startType || localStorage.startType == null){
        localStorage.startType = "title";
    }

    if(localStorage.startType && localStorage.startType == "game"){
        quickStartGame();
    }else if(localStorage.startType && localStorage.startType == "title"){
        startUpScreen();
    }
}

//change game step (realtime or turn based)
function toggleGameStep(v){
    Game.game_mode = v;
    if(v == "turn"){
        clearTimeout(Game.st);
        Game.st = 0;
        document.getElementById("game_speed").disabled = true;
        localStorage.stepMode = "turn";
    }else{
        Game.st = setTimeout(repeatStep, Game.tickPerSec);
        document.getElementById("game_speed").disabled = false;
        localStorage.stepMode = "real";
    }
}

//show death screen for the player with stats
function showDeathScreen(){
    Game.curState = "end";
    document.getElementById("deathScreen").style.display = "block";
    document.getElementById("endMenu").style.display = "block";
    document.getElementById("gameSide").style.display = "none";
    document.getElementById("game").style.display = "none";

    document.getElementById("objCompPerc").innerHTML = "Objectives Completed:<br>" + objCompleted() + "%";
    Game.log_display.drawText(0, 6, "");
    Game.log_combat.drawText(0, 6, "");
    let rtx = Game.resource_display.getContext("2d");
    rtx.clearRect(0,0,Game.resource_display.width,Game.resource_display.height)
}




//prevent scrolling with the game
window.addEventListener("keydown", function(e) {
    // space and arrow keys
    if(([37, 38, 39, 40].indexOf(e.keyCode) > -1)){
        e.preventDefault();
    }
    if((e.keyCode == 32) && (!editingName)){
        e.preventDefault();
    }
    //enter name
    if((e.keyCode == 13) && (editingName)){
        document.activeElement.blur();
        editingName = false;
    }
    //cancel current build
    if((e.keyCode == 27)){
        cancelBuild();
    }

    //title or game on start
    if((e.keyCode == 191)){
        if(localStorage.startType && localStorage.startType == "title"){
            alert("Switching to game mode on start");
            localStorage.startType = "game";
        }else if(localStorage.startType && localStorage.startType == "game"){
            alert("Switching to title mode on start");
            localStorage.startType = "title";
        }
    }

    //immortality
    if(e.keyCode == 220){
        Game.player.immortal = true;
        alert("You are blessed with immortality from the game dev gods!")
    }

    //inifnite seeds
    if(e.keyCode == 190){
        Game.player.seeds = 1000;
    }


}, false);

//Game.init();
