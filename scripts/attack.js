var await_attack_select = false;
var await_attack_location = false;
var attack_orders = {}

var built_something = false;

const attack_items = {
    NONE: "none",
    CHOP: "chop",
    CUT: "cut",
    HAMMER: "demolish",
}

//var next_attack = attack_items.NONE

//temp attack item descriptions
const attack_info = {
	"chop_atk": "Chop the enemy.",
    "cut_atk": "Cut the enemy.",
    "demolish_atk": "Demolish the enemy.",
}

const attackImgs = {}

attack_to_img = {
    "chop_atk": "axe",
    "cut_atk": "sickle",
    "demolish_atk": "hammer",
}

for (let key in attack_info) {
    attackImgs[key] = "imgs/" + attack_to_img[key] + ".png";
}

// For when the player is selecting an order to give, will be used to enter a attack_order (x, y): attack_type pair

function attackSelect(code) {
    await_build_select = false;
    await_build_location = false;
    await_harvest_select = false;
    await_harvest_location = false;
    if (code == 71) {
        displayText('Cut barbarian. Select barbarian.');
        next_order = attack_items.CUT;
    }
    else if (code == 84) {
        displayText('Chop barbarian. Select target.');
        next_order = attack_items.CHOP;
    }
    else if (code == 72) {
        displayText('Hammer barbarian. Select victim.');
        next_order = attack_items.HAMMER;
    }
    await_attack_select = false;
    await_attack_location = true;
    return;
}

function orderAttack(action, x, y) {
    console.log('Order attack action '+ action);
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
           displayText('Assigned ' + frog.name + ' to ' + action + ' barbarian ' + barb_id +'.');
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
	next_order = "none";
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
    if (Game.tick % 2 == 0) {
        return;
    }
    curr_attack = attack_orders[barb_id];
    barb = barbarians[barb_id];
    frog.isAttacking = false;
    frog.wandering = true;
    switch(curr_attack) {
        case attack_items.HAMMER:
            displayText(frog.name+" busts up part of barbarian "+barb_id+"'s body with a hammer.");
            if (Math.random() < 0.4) {
                barbarians[barb_id].health -= 13;
            }
            attacked_something = true;
        case attack_items.CHOP:
            displayText("Frog chops barbarian " + barb_id +".");
            if (Math.random() < 0.6) {
                barbarians[barb_id].health -= 7;
            }
            attacked_something = true;
            break
        case attack_items.CUT:
            displayText("Frog cuts barbarian " + barb_id + ".");
            barbarians[barb_id].health -= 3;
            attacked_something = true;
            break;
        default:
            displayText("Frog fails to " + curr_attack + " the enemy")
            console.log("invalid attack item");
    }
    // Check if we killed the barb
    if (barb.health <= 0) {
        killBarbarian(barb);
    }
}

