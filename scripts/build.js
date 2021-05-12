var await_build_select = false;
var await_build_location = false;
var build_orders = {}

var built_something = false;
var made_house = false;

const build_items = {
    NONE: "none",
    WALL: "wall",
    DOOR: "door",
    FIRE: "fire",
    BED: "bed",
    BRIDGE: "bridge",
    SEED: "grass",
}

var next_order = build_items.NONE

//temp build item descriptions
const build_info = {
	"wall": "Prevents movement from all characters",
	"door" : "Only allows the player and frogs to enter",
	"fire" : "For a bit of arson ;)",
	"bed" : "Replenish health",
	"bridge": "Walk across water.",
}

const build_imgs = {}

for (let key in build_info) {
    build_imgs[key] = "imgs/" + key + ".png";
}

// For when the player is selecting an order to give, will be used to enter a build_order (x, y): build_type pair

function buildSelect(code) {
    await_harvest_select = false;
    await_harvest_location = false;
    await_attack_select = false;
    await_attack_location = false;
    if (code == 87) {
        displayText('Build wall. Select location.');
        next_order = build_items.WALL;
    }
    else if (code == 68) {
        displayText('Build door. Select location.');
        next_order = build_items.DOOR;
    }
    else if (code == 70) {
        displayText('Build fire. Select location.');
        next_order = build_items.FIRE;
    }
    else if (code == 66) {
        displayText('Build bed. Select location.');
        next_order = build_items.BED;
    }
    else if (code == 82) {
        displayText('Build bridge. Select location.');
        next_order = build_items.BRIDGE;
    }
    await_build_select = false;
    await_build_location = true;
    return;
}

function orderBuild(item, x, y) {
//  console.log('Order build item '+ item);
    displayText('Ordered build ' + item + ' at: ('+x+", "+y+")");
    build_orders[[x, y]] = item;
    drawAlphaTile(item, x, y);
//    await_build_location = false;
    // TODO: check all frogs, assign one closest to build?
    assigned = false;
    for (i = 0; i < Game.frog_manager.frogs.length; i ++) {
        frog = Game.frog_manager.frogs[i];
        // Look for idle frog
        if (frog.wandering && (getTile(x, y) == "..")) {
          //console.log('assign frog');
           // Set the frog's targets
           orderFrogBuild(frog, item, x, y);
           //reset menu colors
           assigned = true;
           displayText('Assigned frog ' + frog.name + ' build ' + item + ' at (' + x +', ' + y + ').');
           break;
        }
    }
    if (!assigned) {
        displayText('Build order is in the queue.');
//      console.log('Build order is in the queue.');
    }
    GameStats.ordersGiven++;
   //resetBuildItemsColor();
}

//cancel current build
function cancelOrder(){
	next_order = "none";
//  next_harvest = "none";
//  next_attack = "none";
	await_build_select = false;
    await_harvest_select = false;
    await_attack_select = false;
    await_build_location = false;
    await_harvest_location = false;
    await_attack_location = false;
    resetBuildItemsColor();
    resetOrderItemsColor();
  //ghostBuild.active = false;
    ghostOrder.active = false;
}

// TODO use this item name? <--- WHAT?
function orderFrogBuild(frog, item, x, y) {
   frog._x_t = x;
   frog._y_t = y
   frog.isBuilding = true;
   frog.wandering = false;
}

function build(frog, x, y) {
    curr_build = build_orders[[x, y]];
    delete build_orders[[x, y]];
    frog.isBuilding = false;
    frog.wandering = true;
    playSFX("build",0.25)
    switch(curr_build) {

        case build_items.WALL:
//  if (curr_build == build_items.WALL) {
            if (Game.player.wood > 0) {
                displayText("Frog builds the wall.");
                setTile(x, y, tile_chars.WALL);
                drawTile(x, y);
                Game.player.wood -= 1;
                built_something = true;
            }
            else {
                displayText("No wood, no wall. Chop a trunk or two, why don't you.");
            }

            break;

        case build_items.DOOR:
            if (Game.player.wood > 1) {
                displayText("Frog builds the door.");
                setTile(x, y, tile_chars.DOOR);
                drawTile(x, y);
                Game.player.wood -= 2;
                built_something = true;
            }
            else {
                displayText("Not enough wood for the door. Get that lumber.");
            }
            break
        case build_items.BED:
            if (Game.player.wood > 2) {
                displayText("Frog builds the bed.");
                setTile(x, y, tile_chars.BED);
                drawTile(x, y);
                Game.player.wood -= 3;
                built_something = true;
                if (isSheltered(x, y)) {
                    Game.spawnFrogAt(x, y);
                    made_house = true;
                }
            }
            else {
                displayText("Not enough wood for the bed. Chop some trees");
            }
            break;
        case build_items.FIRE:
            if (Game.player.wood > 2) {
                displayText("Frog builds the fire.");
                setTile(x, y, tile_chars.FIRE);
                drawTile(x, y);
                Game.player.wood -= 3;
                built_something = true;
            }
            else {
                displayText("Nothing to burn! Collect some firewood.")
            }
            break;
        case build_items.BRIDGE:
            if (Game.player.wood > 0) {
                displayText("Frog builds the " + curr_build + ".");
                setTile(x, y, tile_chars.BRIDGE);
                drawTile(x, y);
                Game.player.wood -= 1;
                built_something = true;
            }
            else {
                displayText("No wood with which to build a bridge! Deforest a lil' sumthin' sumthin'.")
            }
            break;

        default:
            displayText("Frog fails to build " + curr_build)
            console.log("invalid build item");
    }
}

function isSheltered(x, y) {
    /* 
     * Is it sheltered?
     */ 
    i = 0;
    var [x0, y0] = [x, y];
    visiting = {};
    visiting[[x, y]] = true;
//  console.log("starting at " + x + "," + y);
//  console.log("starting at " + x0 + "," + y0);
    visited = {};
    while (Object.keys(visiting).length > 0) {
        i++;
//      console.log("visiting");
//      console.log(visiting);
//      console.log(Object.keys(visiting)[0]);
        var [x, y] = Object.keys(visiting)[0].split(",");
        x = parseInt(x);
        y = parseInt(y);
//      console.log("visiting " + x + "," + y);
        delete visiting[[x, y]];
        if ([x, y] in visited) {
            continue;
        }
        if (x < 0 || x > map_width || y < 0 || y> map_height){
            return false;
        }
        if (i > 1000) {
            return false;
        }
      //console.log("visited");
      //console.log(visited);
        // TODO: check for edge of the map?
        isOpen = !(isTile(x, y, tile_chars.WALL) || isTile(x, y, tile_chars.DOOR) || Math.abs(x0-x) > 10 || Math.abs(y0-y));
        if (isOpen) {
            // Cue surrounding tiles for search
            visiting[[x+1, y]] = true;
            visiting[[x, y+1]] = true;
            visiting[[x-1, y]] = true;
            visiting[[x, y-1]] = true;
        }
        visited[x, y] = true;
    }
    return true;

}


