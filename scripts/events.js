var EventHandler = function() {
}

var deadBarbie = false;
var ateGrass = false;
var drankWater = false;
var plantedSeeds = false;
var playerInBase = false;

//main game loop
EventHandler.prototype.step = function(e) {
    //make inCombat boolean when barbarian comes
    // if (inCombat)
    //     return

    //ignore input while editing name
    if(editingName)
        return

    var validUpdate = false;

    player = Game.player;

    var code = null;

    if(e == null){
        code = 32;          //simulate a space press
    }else{
        code = e.keyCode;
        if(Game.game_mode == "real")
            resetStep();
    }

    //clear console outputs
    Game.log_display.clear();
    Game.log_combat.clear();

    ///////////////        SHORTCUT KEYS        //////////////

    // debug command for spawning a new frog
    if (code == 78) {
        console.log("spwan a frwag (debug)");
        Game.spawnFrog();
        validUpdate = true;
    }

    // we need to detect [b]ed before [b]uild
    // TODO: refactor this harder forever
    if (await_build_select) {
        return buildSelect(code);
    }

    // detect "[b]uild" command
    if (code == 66) {
        Game.log_display.drawText(0, 0, "Build: [w]all, [d]oor, [f]ire, [b]ed.");
        await_build_select = true;


        //open build menu
        changeSection("build",document.getElementById("buildTab"));

        // go ahead and wait for another event
        return
    };

    // detect "[m]ap" command
    if (code == 77) {
        //open build menu
        changeSection("minimap",document.getElementById("minimapTab"));

        // go ahead and wait for another event
        return
    };


    ///////////   COMBAT UPDATE    ///////////////


    if (Game.combatTarget != null) {
        //freeze movement
        rand = Math.floor(Math.random() * 101);
        did_combat = true;

        //add attack for number press
        switch(code) {
            case 49: //pressed 1: slam
                if (rand <= Game.player.slamChance()){
                    Game.combatTarget.health -= Game.player.slamDmg;
                    Game.player.health -= 1;
                    combatTextPlayer("You body slammed doing " + Game.player.slamDmg +" damage");
                }else{
                    combatTextPlayer("You slammed the air!");
                }
                validUpdate = true;
                
                break;
            case 50: //pressed 2: kick
                if (rand <= Game.player.kickChance()){
                    Game.combatTarget.health -= Game.player.kickDmg;
                    Game.player.thirst -= 2;
                    combatTextPlayer("You kicked hard doing " + Game.player.kickDmg +" damage");
                }else{
                    combatTextPlayer("You kicked the dust!");
                }
                validUpdate = true;

                break;
            case 51: //pressed 3: punch
                if (rand <= Game.player.punchChance()){
                    Game.combatTarget.health -= Game.player.punchDmg;
                    Game.player.hunger -= 2;
                    combatTextPlayer("You landed your punch for " + Game.player.punchDmg +" damage");
                }else{
                    combatTextPlayer("You swung and missed!");
                }
                validUpdate = true;

                break;
            default: //default to ignoring the barb
                combatTextPlayer("You ignore the barbarian and it slaps you in the head, in disbelief.");
                did_combat = false;  // this will allow player to take a non-combat action
        }


        //enemy has died
        if (Game.combatTarget.getHealth() <= 0)
        {
            Game.combatTarget.health = 0;
            combatTextPlayer("You defeated the enemy");
            Game.scheduler.remove(Game.combatTarget)
            let i = Game.barbarians.indexOf(Game.combatTarget);
            if (i > -1){
                Game.barbarians.splice(i,1);
            }
            Game.combatTarget = null;
            deadBarbie = true;
        }

        newX = player._x;
        newY = player._y;

    }
    else {
        did_combat = false;
    }


    /////////////  NON-COMBAT UPDATE  /////////////


    //outside combat
    if (!did_combat) 
    {
        //runs if mouse click
        if (typeof code === 'undefined')
        {
            var x = -1;
            var y = -1;

            //main map
            if (e.target.id == 'game') {
                //get raw pixel location relative to the canvas
                let rect = e.target.getBoundingClientRect();
                let rx = Math.round(e.clientX - rect.left);
                let ry = Math.round(e.clientY - rect.top);

                //convert to map coordinates based on windowed main screen
                [x,y] = pix2Map([rx,ry]);

//              console.log("Main Screen: (" + rx + "," + ry + ")  -->  (" + x + "," + y + ")");

                //direct build location on the map
                if (await_build_location) {
                    orderBuild(next_build, x, y)
                }
            }

            //minimap
            else if (e.target.id == 'minimapCanvas') {
                //get raw pixel location relative to the canvas
                let rect = e.target.getBoundingClientRect();
                let rx = Math.round(e.clientX - rect.left);
                let ry = Math.round(e.clientY - rect.top);

                //convert to map coordinates based on minimap
                [x,y] = pix2Minimap([rx,ry]);

//              console.log("Minimap: (" + rx + "," + ry + ")  -->  ("+  x + "," + y + ")");

                //move camera to location clicked on map
                camFocusPt([x,y]);
            }


            //all other clicks are outside the map bounds
            //if(x == -1 && y == -1)
                //console.log("Out of bounds!");

            document.getElementById("clickedCoords").innerHTML = [x,y];
            newX = player._x;
            newY = player._y;

        }
        //runs if button press (and player is not fighting barbarian)
        else
        {

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

            // WASD
            keyMap[65] = 6;
            keyMap[68] = 2;
            keyMap[87] = 0;
            keyMap[83] = 4;
            
            /* one of numpad directions? */
            if (!(code in keyMap))
            {   
                //dont move if invalid keypress
                newX = player._x;
                newY = player._y;

                // Q to plant seeds
                if (code == 81) {
                    if (Game.player.seeds > 0) {
                        Game.log_display.drawText(0, 0, "You plant seeds.");
                        var[seed_x, seed_y] = getPlantTile(player._x, player._y);
                        setTile(seed_x, seed_y, tile_chars.GRASS);
                        plantedSeeds = true;
                        Game.player.seeds--;
                    }
                    else {
                        Game.log_display.drawText(0, 0, "You have no seeds to plant.");
                    }
                    validUpdate = true;
                }
                // SPACE = wait key
                else if(code == 32){
                    validUpdate = true;
                }
            }


            //arrow key = movement
            else
            {
                //move player if available
                var dir = ROT.DIRS[8][keyMap[code]];
                newX = player._x + dir[0];
                newY = player._y + dir[1];
                trg_tile = getTile(newX, newY);

                //if next to water, drink it
                if (player_impassable.indexOf(trg_tile) >= 0) {
                    newX = player._x;
                    newY = player._y;
                    if (trg_tile == tile_chars.WATER) {
                        player.thirst = Math.min(100, player.thirst + 25);
                        drankWater = true;
                    }
                }

                if(!playerInBase && newX == Game.blackLodge._x && newY == Game.blackLodge._y)
                    playerInBase = true;

                validUpdate = true;
                player.moved = true;
            }

        }
    }    

    /////////////////      PLAYER UPDATES       /////////////////

    //no need to update game. (player?)
    if(!validUpdate)
        return;

    //// PLAYER UPDATES

    // Move the player
    player._x = newX;
    player._y = newY;

    //eat grass if on the tile
    curr_tile = Game.map[player._x+","+player._y];
    if (curr_tile == "gg") {
        Game.log_display.drawText(0, 0, "You eat grass.")
        player.hunger = Math.min(100, player.hunger + 25);
        setTile(player._x, player._y, "..");
        //drawTile(player._x, player._y);
        player.seeds += 1;
        ateGrass = true;

    }

    //decrease player hunger, thirst, and health
    if (player.hunger == 0 && player.thirst == 0) {
        player.health--;
    }
    player.hunger = Math.max(player.hunger-1, 0);
    player.thirst = Math.max(player.thirst-1, 0);


    ///// AI UPDATES
    let fgs = Game.frog_manager.frogs;
    for(let f=0;f<fgs.length;f++){
        fgs[f].act();
    }

    let bbs = Game.barbarians;
    for(let b=0;b<bbs.length;b++){
        bbs[b].act();
    }

    //former EVENTHANDLER.ACT() function - update the game state and ticks
    Game.gameTicks += 1;

    if(Game.gameTicks % Game.ticksPerDay == 0) 
    {
        //new day
        Game.days += 1;

        //generate new barbarians on a new day if king is not dead
        if (Game.gameTicks % Game.ticksPerDay == 0 && Game.kingBarbarian != null) {
            let newBarbie = Game._createBarbarian();
            Game.barbarians.push(newBarbie); 
            Game.scheduler.add(newBarbie, true);
        }
    }


    // Tick grass and tree cellular automata
    Game.simulateGrass()


    //redraw everything and update map for ROT.Js and status messages
    displayHUD();
    drawMap();


    //update objectives once completed
    if(objDivShown){
        setObjsDiv()
    }

    //render();
    //panCamera();

    
}

/*Game.init();*/