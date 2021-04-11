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
