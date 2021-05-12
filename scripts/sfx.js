var sfxAud = {
	"drink_water": new Audio("sfx/drink_water2.ogg"),
	"plant_seeds": new Audio("sfx/plant_seeds2.ogg"),
	"low_health": new Audio("sfx/danger4.wav"),
	"low_hunger": new Audio("sfx/danger2.wav"),
	"low_thirst": new Audio("sfx/danger5.wav"),
	"barb_idle": new Audio("sfx/barb_near.ogg"),
	"barb_laugh": new Audio("sfx/barb_laugh.ogg"),
	"barb_laugh2": new Audio("sfx/barb_laugh2.ogg"),
	"build": new Audio("sfx/build3.ogg"),
	"break_wall":new Audio("sfx/break_wall.ogg"),
	"harvest":new Audio("sfx/harvest.ogg")

}

var muteSFX = false;

function playSFX(name,vol=0.3){
	if(muteSFX)
		return;
	sfxAud[name].volume = vol;
	sfxAud[name].play();
}	