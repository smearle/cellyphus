var EventHandler = function() {
}

var deadBarbie = false;
var ateGrass = false;
var drankWater = false;
var plantedSeeds = false;
var playerInBase = false;

var attackFlavor = ["You body slammed the barbarian", "You round-housed kicked the barbarian!", "You landed your punch!", "You bit the barbarian", "You headbutt the barbarian!"]
var defenseFlavor = ["The barbarian slapped you!", "The barbarian sliced at your guts!", "The barbarian spit in your face!", "The barbarian punched your face", "The barbarian kicked you in the shins"]

//always step
function combatStep(){
    

    if (combatScreen.style.visibility == 'visible') {

        //i lived bitch
        if((localStorage.enemyHP <= 0  || localStorage.combatType == 'esc')){
            let diffTargHealth = Game.combatTarget.health - localStorage.getItem("enemyHP");
            let diffMyHealth = Game.player.health - localStorage.getItem("playerHP");

            //flavor text for the log
            for(let f=0;f<parseInt(diffMyHealth/5);f++){
                addToLog(defenseFlavor[Math.floor(Math.random()*defenseFlavor.length)]);
            }
            for(let f=0;f<parseInt(diffTargHealth/4);f++){
                let astr = attackFlavor[Math.floor(Math.random()*attackFlavor.length)];
                addToLog(astr);
            }


            Game.combatTarget.health = localStorage.getItem("enemyHP");
            Game.player.health = localStorage.getItem("playerHP");
            
            console.log("we have escaped combat");

            




            Game.combatTarget.disengage = false;
            localStorage.combatType = 'atk';

            //enemy has died
            if (Game.combatTarget.getHealth() <= 0)
            {
                Game.combatTarget.health = 0;
                combatTextPlayer("You defeated the enemy");
                Game.scheduler.remove(Game.combatTarget)
                let i = Game.barbarians.indexOf(Game.combatTarget);
                if (i > -1){
                    Game.barbarians.splice(i,1);

                    //ding dong the bitch is dead
                    if(Game.combatTarget == Game.king_barbarian)
                        Game.king_barbarian = null;

                    GameStats.barbariansKilled++;
                }
                Game.combatTarget = null;
                deadBarbie = true;
            }


            Game.combatTarget = null
            showMain();
        }
        //guess i'll die
        else if(localStorage.playerHP <= 0){
            showMain();
            localStorage.combatType = 'atk';
            Game.combatTarget = null;
            Game.player.health = localStorage.playerHP;
            Game.player.act();
        }

    }

    else if (Game.combatTarget != null && combatScreen.style.visibility == 'hidden') {
        localStorage.setItem("enemyHP", Game.combatTarget.getHealth());
        localStorage.setItem("playerHP", Game.player.getHealth());
        localStorage.setItem("playerThirst", Game.player.getThirst());
        localStorage.setItem("playerHunger", Game.player.getHunger());
        showCombat();
        console.log("fight club!");
    }

}

var combatInterval = setInterval(function(){
    combatStep();
},200);

//main game loop
EventHandler.prototype.step = function(e) {

    //don't bother when in combat
    if(combatScreen.style.visibility == 'visible'){
        return;
    }
    
    //ignore input while editing name
    if(editingName)
        return

    //player is dead, why bother
    if(Game.player.dead){
        showDeathScreen();
        clearTimeout(Game.st);
        Game.st = 0;
        return;
    }

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
    /*
    if (code == 78) {
        console.log("spwan a frog (debug)");
        Game.spawnFrog();
        validUpdate = true;
    }
    */

    // we need to detect [b]ed before [b]uild
    // TODO: refactor this harder forever
    if (await_build_select && [82,87,68,70,66].indexOf(code) != -1) {
        return buildSelect(code);
    }
    if (await_harvest_select) {
        return harvestSelect(code);
    }
    if (await_attack_select) {
        return attackSelect(code);
    }

    // detect "[b]uild" command
    if (code == 66) {
        Game.log_display.drawText(0, 0, "Build: [w]all, [d]oor, [f]ire, [b]ed, b[r]idge.");
        await_build_select = true;

        //open build menu
        changeSection("build",document.getElementById("buildTab"));

        // go ahead and wait for another event
        return
    };

    // detect "[h]arvest" command
    if (code == 72) {
        Game.log_display.drawText(0, 0, "Harvest: [g]rass, [t]ree.");
        await_harvest_select = true;

        //open build menu
//      changeSection("harvest",document.getElementById("harvestTab"));

        // go ahead and wait for another event
        return
    };

    if (code == 75) {
        Game.log_display.drawText(0, 0, "Attack: [g]cut [t]chop.");
        await_attack_select = true;
        return
    }

    // detect "[m]ap" command
    if (code == 77) {
        //open build menu
        changeSection("minimap",document.getElementById("minimapTab"));

        // go ahead and wait for another event
        return
    };


    ///////////   COMBAT UPDATE    ///////////////
    if (localStorage.getItem("isKingWallBrkn") == "true"){
        Game._destroyWall();
        showMain();
    }

    if (Game.combatTarget != null) {

        localStorage.setItem("isEscape", false);

        // change to turn only on combat
        //toggleGameStep("turn");



        // pull enemy and player stats pre combat

        

        //console.log("enemyHP: " + localStorage.getItem("enemyHP") + " playerHP: " + localStorage.getItem("playerHP"));

        //swap to combat window
        Game.combatTarget.health = localStorage.getItem("enemyHP");



        //register damage dealt
        //Game.combatTarget.health -= localStorage.getItem("damageDealt");

        //reset damage counter to 0
        //localStorage.setItem("damageDealt", 0);


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
                else if (await_harvest_location) {
                    orderHarvest(next_harvest, x, y)
                }
                else if (await_attack_location) {
                    orderAttack(next_attack, x, y);
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

                // V to plant seeds
                if (code == 86) {
                    if (Game.player.seeds > 0) {
                        Game.log_display.drawText(0, 0, "You plant seeds.");
                        var[seed_x, seed_y] = getPlantTile(player._x, player._y);
                        setTile(seed_x, seed_y, tile_chars.GRASS);
                        plantedSeeds = true;
                        Game.player.seeds--;
                        GameStats.seedsPlanted++;
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
                    if(trg_tile == tile_chars.REDWALL && newX == Game.kingWall._x && newY == Game.kingWall._y){
                        console.log("combat");
                        showWallCombat();
                    }

                    newX = player._x;
                    newY = player._y;
                    console.log("player: " + newX + ", " + newY);
                    console.log("wall: " + Game.kingWall._x + ", " + Game.kingWall._y);
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

    Game.player.act(newX, newY);

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
        if (Game.king_barbarian != null) {
            let newBarbie = Game._createBarbarian();
            Game.barbarians.push(newBarbie); 
            barbarians[barb_id] = newBarbie;
            Game.scheduler.add(newBarbie, true);

            //add another on the second day to make up for the lack of barbarians on the first day
            if(Game.days == 1){
                let newBarbie2 = Game._createBarbarian();
                Game.barbarians.push(newBarbie2); 
                barbarians[barb_id] = newBarbie2;
                Game.scheduler.add(newBarbie2, true);
            }
        }

        Game.player.seeds += 7;     //some seeds from the gods
        displayText("A new day ("  + Game.days + ") has started! The frog gods gift you 7 seeds for your endurance.")


    }

    //new grass on the island
    if((Game.days > 0) && (Game.days % 3 == 0) && (Game.gameTicks % Game.ticksPerDay == 1)){
        Game._newGrass();
    }

    // Tick grass and tree cellular automata
    Game.simulateGrass();


    //redraw everything and update map for ROT.Js and status messages
    displayHUD();
    drawMap();


    //update objectives once completed
    checkObj();
    if(objDivShown){
        setObjsDiv()
    }


    //render();
    //panCamera();

    
}

/*Game.init();*/
