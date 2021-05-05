var await_build_select = false;
var await_build_location = false;
var build_orders = {}

var built_something = false;

const build_items = {
    NONE: "none",
    WALL: "wall",
    DOOR: "door",
    FIRE: "fire",
    BED: "bed",
    BRIDGE: "bridge",
    SEED: "grass",
}

var next_build = build_items.NONE

//temp build item descriptions
const build_info = {
	"wall": "Prevents movement from all characters",
	"door" : "Only allows the player and frogs to enter",
	"fire" : "For a bit of arson ;)",
	"bed" : "Replenish health and pass time",
	"bridge": "Walk on water.",
}

const build_imgs = {}

for (let key in build_info) {
    build_imgs[key] = "imgs/" + key + ".png";
}

// For when the player is selecting an order to give, will be used to enter a build_order (x, y): build_type pair

function buildSelect(code) {
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
    else if (code == 82) {
        displayText('Build bridge. Select location.');
        next_build = build_items.BRIDGE;
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
        if (!(frog.isBuilding) && (getTile(x, y) == "..")) {
          //console.log('assign frog');
           // Set the frog's targets
           orderFrogBuild(frog, item, x, y);
           //reset menu colors
           assigned = true;
           displayText('Assigned frog ' + frog.name + ' build ' + item + ' at (' + x +', ' + y + ')');
           break;
        }
    }
    if (!assigned) {
        displayText('Build order is in the queue.');
//      console.log('Build order is in the queue.');
    }
   //resetBuildItemsColor();
}

//cancel current build
function cancelBuild(){
	next_build = "none";
	await_build_select = false;
    await_build_location = false;
    resetBuildItemsColor();
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
                displayText("No wood, no wall.");
            }

            break;

        case build_items.DOOR:
            displayText("Frog builds the door.");
            setTile(x, y, tile_chars.DOOR);
            built_something = true;
            break
        case build_items.BED:
            displayText("Frog builds the bed.");
            setTile(x, y, tile_chars.BED);
            built_something = true;
            if (isSheltered(x, y)) {
                Game.spawnFrogAt(x, y);
            }
            break;
        case build_items.FIRE:
            displayText("Frog builds the fire.");
            setTile(x, y, tile_chars.FIRE);
            built_something = true;
            break;
        case build_items.BRIDGE:
            displayText("Frog builds the " + curr_build + ".");
            setTile(x, y, tile_chars.BRIDGE);
            built_something = true;
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

    // Dummy function for now: is there a wall next to us?
    return isTile(x+1, y, tile_chars.WALL);
}


