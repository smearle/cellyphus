var await_build_select = false;
var await_build_location = false;
var build_orders = {}

const build_items = {
    NONE: "none",
    WALL: "wall",
    DOOR: "door",
    FIRE: "fire",
    BED: "bed",
}

var next_build = build_items.NONE

//temp build item descriptions
const build_info = {
	"wall": "Prevents movement from all characters",
	"door" : "Only allows the player and frogs to enter",
	"fire" : "For a bit of arson ;)",
	"bed" : "Replenish health and pass time"
}

const build_imgs = {
	"wall": "imgs/wall.png",
	"door": "imgs/door.png",
	"fire": "imgs/fire.png",
	"bed": "imgs/bed.png"
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
    await_build_select = false;
    await_build_location = true;
    return;
}

function orderBuild(item, x, y) {
//  console.log('Order build item '+ item);
    displayText('Ordered build ' + item + ' at: ('+x+", "+y+")");
    build_orders[[x, y]] = item;
    drawAlphaTile(item, x, y);
    console.log(build_orders.toString());
//    await_build_location = false;
    // TODO: check all frogs, assign one closest to build?
    assigned = false;
    for (i = 0; i < Game.frog_manager.frogs.length; i ++) {
        frog = Game.frog_manager.frogs[i];
        // Look for idle frog
        if (!(frog.isBuilding) && (getTile(x, y) == "..")) {
            console.log('assign frog');
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
   resetBuildItemsColor();
}

// TODO use this item name?
function orderFrogBuild(frog, item, x, y) {
   frog._x_t = x;
   frog._y_t = y
// console.log('order frog build');
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
            }
            else {
                displayText("No wood, no wall.");
            }

            break;

        case build_items.DOOR:
            displayText("Frog builds the door.");
            setTile(x, y, tile_chars.DOOR);
            drawTile(x, y);
            break;
        case build_items.BED:
            displayText("Frog builds the bed.");
            setTile(x, y, tile_chars.BED);
            drawTile(x, y);
            break;
        case build_items.FIRE:
            displayText("Frog builds the fire.");
            setTile(x, y, tile_chars.FIRE);
            drawTile(x, y);
            break;
        default:
            displayText("Frog fails to build " + curr_build)
            console.log("invalid build item");
    }
}

