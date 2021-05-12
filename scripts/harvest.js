var await_harvest_select = false;
var await_harvest_location = false;
var harvest_orders = {}

var built_something = false;

const harvest_items = {
    NONE: "none",
    CHOP: "chop",
    CUT: "cut",
    DEMOLISH: "demolish",
}

//var next_harvest = harvest_items.NONE

//temp harvest item descriptions
const harvest_info = {
	"chop": "Chop the forest.",
    "cut": "Cut the grass.",
    "demolish": "Demolish the structure.",
}

const harvestImgs = {}

harvest_to_img = {
    "chop": "axe",
    "cut": "sickle",
    "demolish": "hammer",
}

for (let key in harvest_info) {
    harvestImgs[key] = "imgs/" + harvest_to_img[key] + ".png";
}
console.log("harvestImgs dict: ");
console.log(harvestImgs);

// For when the player is selecting an order to give, will be used to enter a harvest_order (x, y): harvest_type pair

function harvestSelect(code) {
    await_build_select = false;
    await_build_location = false;
    await_attack_select = false;
    await_attack_location = false;
    if (code == 71) {
        console.log('grass');
        displayText('Cut grass. Select location.');
        next_order = harvest_items.CUT;
    }
    else if (code == 72) {
        console.log('hammer');
        displayText('Hammer the structure to dust. Select location.');
        next_order = harvest_items.DEMOLISH;
    }
    else if (code == 84) {
        console.log('tree');
        displayText('Chop tree. Select location.');
        next_order = harvest_items.CHOP;
    }
    await_harvest_select = false;
    await_harvest_location = true;
    return;
}

function orderHarvest(action, x, y) {
  //console.log('Order harvest item '+ item);
    curr_tile = getTile(x, y)
    if (!(action == harvest_items.CHOP && curr_tile == tile_chars.TREE ||
          action == harvest_items.CUT && curr_tile == tile_chars.GRASS)) {
        return 
    }
    displayText('Ordered harvest ' + action + ' at: ('+x+", "+y+")");
    harvest_orders[[x, y]] = action;
    drawHarvestOverlay(action, x, y);
//    await_harvest_location = false;
    // TODO: check all frogs, assign one closest to harvest?
    assigned = false;
    for (i = 0; i < Game.frog_manager.frogs.length; i ++) {
        frog = Game.frog_manager.frogs[i];
        // Look for idle frog
        if (frog.wandering && (getTile(x, y) == "..")) {
          //console.log('assign frog');
           // Set the frog's targets
           orderFrogHarvest(frog, action, x, y);
           //reset menu colors
           assigned = true;
           displayText('Assigned frog ' + frog.name + ' harvest ' + action + ' at (' + x +', ' + y + ')');
           break;
        }
    }
    if (!assigned) {
        displayText('Harvest order is in the queue.');
//      console.log('Harvest order is in the queue.');
    }
   //resetHarvestItemsColor();
}

////cancel current harvest
//function cancelHarvest(){
//	next_harvest = "none";
//	await_harvest_select = false;
//    await_harvest_location = false;
////  resetHarvestItemsColor();
//}

function orderFrogHarvest(frog, action, x, y) {
    frog._x_t = x;
    frog._y_t = y;
    frog.isHarvesting = true;
    frog.wandering = false;
}


function harvest(frog, x, y) {
    curr_harvest = harvest_orders[[x, y]];
    delete harvest_orders[[x, y]];
    frog.isHarvesting = false;
    frog.wandering = true;
    switch(curr_harvest) {
        case harvest_items.CHOP:
            displayText("Frog chops the wood.");
            setTile(x, y, tile_chars.DIRT);
            Game.player.wood += 10;
            harvested_something = true;
            break
        case harvest_items.CUT:
            displayText("Frog cuts the grass.");
            setTile(x, y, tile_chars.DIRT);
            harvested_something = true;
            Game.player.seeds += 3;
            break;
        default:
            displayText("Frog fails to harvest " + curr_harvest)
            console.log("invalid harvest item");
    }
}

