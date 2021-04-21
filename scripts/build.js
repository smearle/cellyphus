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
let next_build = build_items.NONE;

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

function build(x, y) {
    curr_build = build_orders[[x, y]];
    switch(curr_build) {

        case build_items.WALL:
//  if (curr_build == build_items.WALL) {
            console.log('it is wall');
            if (Game.player.wood > 0) {
                displayText("Frog builds the wall.");
                setTile(x, y, tile_chars.WALL);
                drawTile(x, y);
                Game.player.wood -= 1;
            }
            else {
                displayText("No wood, no wall.");
            }
            this.building = false;
            this.wandering = true;
            break;

        case build_items.DOOR:
            console.log('it is door');

            displayText("build a door");
            displayText("Frog builds the door.");
            setTile(x, y, tile_chars.DOOR);
            drawTile(x, y);
            break;
        case build_items.BED:
            setTile(x, y, tile_chars.BED);
            drawTile(x, y);
            break;
        case build_items.FIRE:
            setTile(x, y, tile_chars.FIRE);
            drawTile(x, y);
            break;
        default:
            console.log("invalid build item my guy");
    }
}

