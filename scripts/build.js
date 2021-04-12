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

// For when the player is selecting an order to give, will be used to enter a build_order (x, y): build_type pair
let next_build = build_items.NONE;


// NOT USING THIS YET //////////////////////////////////////
var BuildManager = function() {
}

BuildManager.prototype.handleEvent = function(e) {
    var code = e.keyCode;

    if (keycode == 66) {
        alert("dummi message for tweedle-don'ts");
    }
}
