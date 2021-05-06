var await_attack_select = false;
var await_attack_location = false;
var attack_orders = {}

var built_something = false;

const attack_items = {
    NONE: "none",
    CHOP: "chop",
    CUT: "cut",
}

var next_attack = attack_items.NONE

//temp attack item descriptions
const attack_info = {
	"chop": "Chop the forest.",
    "cut": "Cut the grass.",
}

const attack_imgs = {}

attack_to_img = {
    "chop": "axe",
    "cut": "sickle",
}

for (let key in attack_info) {
    attack_imgs[key] = "imgs/" + attack_to_img[key] + ".png";
}

// For when the player is selecting an order to give, will be used to enter a attack_order (x, y): attack_type pair

function attackSelect(code) {
    if (code == 71) {
        displayText('Cut barbarian. Select barbarian.');
        next_attack = attack_items.CUT;
    }
    else if (code == 84) {
        displayText('Chop barbarian. Select barbarian.');
        next_attack = attack_items.CHOP;
    }
    await_attack_select = false;
    await_attack_location = true;
    return;
}

function orderAttack(action, x, y) {
//  console.log('Order attack item '+ item);
    curr_tile = getTile(x, y)
    console.log(curr_tile);
    if (!([x, y] in barb_locs)) {
        displayText("You can't attack not a barbarian!");
        return 
    }
    barb_id = barb_locs[[x, y]];
    displayText('Ordered attack ' + action + ' barbarian ' + barb_id);
    attack_orders[barb_id] = action;
//  drawAttackOverlay(action, barb_id);
//    await_attack_location = false;
    // TODO: check all frogs, assign one closest to attack?
    assigned = false;
    for (i = 0; i < Game.frog_manager.frogs.length; i ++) {
        frog = Game.frog_manager.frogs[i];
        // Look for idle frog
        if (frog.wandering) {
          //console.log('assign frog');
           // Set the frog's targets
           orderFrogAttack(frog, action, barb_id);
           //reset menu colors
           assigned = true;
           displayText('Assigned frog ' + frog.name + ' attack ' + action + ' barbarian ' + barb_id +')');
           break;
        }
    }
    if (!assigned) {
        displayText('Attack order is in the queue.');
//      console.log('Harvest order is in the queue.');
    }
   //resetHarvestItemsColor();
}

//cancel current attack
function cancelAttack(){
	next_attack = "none";
	await_attack_select = false;
    await_attack_location = false;
//  resetAttackItemsColor();
}

function orderFrogAttack(frog, action, barb_id) {
    barb = barbarians[barb_id];
    x = barb._x;
    y = barb._y
    frog._x_t = x;
    frog._y_t = y;
    frog.trg_barb = barb_id;
    frog.isAttacking = true;
    frog.wandering = false;
}


function attack(frog, barb_id) {
    curr_attack = attack_orders[barb_id];
    frog.isAttacking = false;
    frog.wandering = true;
    switch(curr_attack) {
        case attack_items.CHOP:
            displayText("Frog chops the barbarian.");
            setTile(x, y, tile_chars.DIRT);
            Game.player.wood += 10;
            attacked_something = true;
            break
        case attack_items.CUT:
            displayText("Frog cuts the barbarian.");
            setTile(x, y, tile_chars.DIRT);
            attacked_something = true;
            Game.player.grass += 3;
            break;
        default:
            displayText("Frog fails to attack " + curr_attack)
            console.log("invalid attack item");
    }
    // Check if we killed the barb
    if (!(barb_id in barbarians)) {
        delete attack_orders[barb_id];
    }
}

