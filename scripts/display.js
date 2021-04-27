///////////      GLOBAL VARIABLES       ///////////////////

//main game
var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");
canvas.width = 640;
canvas.height = 640;

//minimap canvas
var miniCanvas = document.getElementById("minimapCanvas");
var mtx = minimapCanvas.getContext("2d");
miniCanvas.width = 332;
miniCanvas.height = 300;

//minimap icons
var playerIcon = new Image();
playerIcon.src = "imgs/sprites/player_icon.png";

var frogIcon = new Image();
frogIcon.src = "imgs/sprites/frog_icon.png";

var barbIcon = new Image();
barbIcon.src = "imgs/sprites/barbarian_icon.png";

//get transparent blueprint tiles
var alphaImgs = {};

for (let item in build_imgs) {
    alphaImg = new Image();
    alphaImg.src = "imgs/processed/alpha_" + item + ".png";
    alphaImgs[item] = alphaImg;
}

render_tiles = [];
var Imgs = {};

var iconSize = 12;


//rot.js map to redraw on the canvas
var gameMapCanvas = null;

//sizing
var tw = null;
var th = null;
var scw = null;
var sch = null;


//camera
var camera = {
  x : 0,
  y : 0,
  focus : {_x : 0, _y : 0},
  zoom : 1
};

//store console logs 
var maxTxtLog = 100;
var txtLog = []

var objDivShown = false;



/////////     TEXT CONSOLE CODE       /////////////


//var displayText = function(str) {
function displayText(str) {
    Game.log_display.drawText(0, 6, str);
    addToLog(str)
}

//var combatTextPlayer = function(str) {
function combatTextPlayer(str) {
    var empty = "                                                                                      "
    Game.log_combat.drawText(1, 6, empty);
    Game.log_combat.drawText(1, 6, str);
    addToLog(str)
}

//var combatTextEnemy = function(str) {
function combatTextEnemy(str) {
    var empty = "                                                                                      "
    Game.log_combat.drawText(1, 7, empty);
    Game.log_combat.drawText(1, 7, str);
    addToLog(str)
}

//var displayHUD = function() {
function displayHUD() {
  //general player info
  day_str = "Day: " + Game.days.toString().padStart(6, " ");
  health_str = "Health: " + Game.player.getHealth().toString().padStart(3, " ");
  hunger_str = "Hunger: " + Game.player.getHunger().toString().padStart(3, " ");
  thirst_str = "Thirst: " + Game.player.getThirst().toString().padStart(3, " ");
  seed_str = "Seeds: " + Game.player.seeds.toString().padStart(3, " ");
  wood_str = "Wood:  " + Game.player.wood.toString().padStart(3, " ");
  meat_str = "Meat:  " + Game.player.meat.toString().padStart(3, " ");
  Game.resource_display.drawText(0, 0, day_str);
  Game.resource_display.drawText(0, 2, health_str);
  Game.resource_display.drawText(0, 3, thirst_str);
  Game.resource_display.drawText(0, 4, hunger_str);
  Game.resource_display.drawText(15, 2, seed_str);
  Game.resource_display.drawText(15, 3, wood_str);
  Game.resource_display.drawText(15, 4, meat_str);
  //combat info
  if (Game.combatTarget == null) {
  		let name = "None";
      target_str = "Combat: " + name.padStart(8, " ");
      Game.log_combat.drawText(0, 0, target_str);
  }
  else{
  		let name = "Barbarian"
      target_str = "Combat: " + name.padStart(10, " ") + "  " + Game.combatTarget.getHealth() + "HP";
      slam_str = "1.(" + Game.player.slamDmg +"atk)Body Slam: " + Game.player.slamChance().toString().padStart(3, " ") + "%";
      kick_str = "2.(" + Game.player.kickDmg +"atk)Kick: " + Game.player.kickChance().toString().padStart(8, " ") + "%";
      punch_str = "3.(" + Game.player.punchDmg +"atk) Punch: " + Game.player.punchChance().toString().padStart(7, " ") + "%";

      //work on these
      Game.log_combat.drawText(0, 0, target_str);
      Game.log_combat.drawText(0, 2, slam_str);
      Game.log_combat.drawText(0, 3, kick_str);
      Game.log_combat.drawText(0, 4, punch_str);
  }  
}


////////      MAP CONVERSION CODE      ////////

//gets a point relative to the map in pixels 
//ex. ([3,9] = 3 tiles from the left, 9 tiles from the top -> [3*tw,9*th]) 
function map2Pix(p){
	return [p[0]*tw,p[1]*th];
}
//same as above but for 1d value on a specific axis (x,y)
function map2PixAx(pi,axis){
	return (axis == "x" ? pi*tw : pi*th);
}

//convert raw pixel point on canvas to map tile location (offset by camera)
function pix2Map(p){
	return [(camera.x/(tw*camera.zoom))+Math.floor(p[0]/(tw*camera.zoom)),(camera.y/(th*camera.zoom))+Math.floor(p[1]/(th*camera.zoom))];
}

//convert raw pixel point on canvas to minimap tile location
function pix2Minimap(p){
	return [Math.floor(p[0]/scw),Math.floor(p[1]/sch)];
}


//////////////     MAP FUNCTIONS     //////////////////


//draw everything (copies from the ROT.display output to the canvas shown on the screen)
function render(){
	//draw always
	requestAnimationFrame(render);

	//game not set yet
	if(Game == null)
		return;

  	drawMain();
  	drawMiniMap();

}

//switch focus from one character to another on the main game screen
function camFocusChar(b){
	let ent = Game.player;

	//player
	if(b.id == "player")
		ent = Game.player;

	//get frog in the array of frogs
	else if(b.id.includes("frog")){
		let fi = parseInt(b.id.replace("frog",""));
		if(fi < Game.frog_manager.frogs.length)
			ent = Game.frog_manager.frogs[fi];
	}

	camera.focus = ent;
	panCamera();

	//set highlight
	let icons = document.getElementsByClassName("charItem");
	for(let i =0;i<icons.length;i++){
		icons[i].style.backgroundColor = "#ffffff00";
	}
	b.style.backgroundColor = "#ECCE0E";
}

//switches focus to a point clicked on the minimap
function camFocusPt(p){
	camera.focus = {_x:p[0], _y:p[1]};
	panCamera();

	//set highlight
	let icons = document.getElementsByClassName("charItem");
	for(let i =0;i<icons.length;i++){
		icons[i].style.backgroundColor = "#ffffff00";
	}
}

//move the camera 
function panCamera(){
	//game object not set yet
	if(Game == null || Game.display == null)
		return;

	//center the camera on the focus point
	let t = map2Pix([camera.focus._x,camera.focus._y]);
	camera.x = t[0] - ((canvas.width/camera.zoom)/(2));
	camera.y = t[1] - ((canvas.height/camera.zoom)/(2));

	let mw = Game.display.getContainer().width;
	let mh = Game.display.getContainer().height;
	
	//if out of bounds, lock it
	if(camera.x < 0)
		camera.x = 0;
	else if (camera.x > (mw - canvas.width/camera.zoom))
		camera.x = (mw - canvas.width/camera.zoom)

	if(camera.y < 0)
		camera.y = 0;
	else if (camera.y > (mh - canvas.height/camera.zoom))
		camera.y = (mh - canvas.height/camera.zoom)
}

//draw the main game screen (camera focuses on a certain point)
function drawMain(){
	if(Game == null || Game.display == null)		//wait until game object is available
		return;

	//set the canvas if available and not already set 
	if(gameMapCanvas == null){
	   gameMapCanvas = Game.display.getContainer()
	}

	//reset
	//ctx.save();
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	//set background "ocean"
	ctx.fillStyle = "#4B97AA";
	ctx.fillRect(0,0,canvas.width,canvas.height);

	//move camera if needed
	panCamera();
    
    // Draw all the blueprints as transparent versions of the items that are planned for building
    for (let key in build_orders) {
        [x, y] = key.split(",");
        img = alphaImgs[build_orders[key]];
        tw = Game.display.getOptions().tileWidth;
        th = Game.display.getOptions().tileHeight;
        mapCtx = gameMapCanvas.getContext("2d");
        mapCtx.drawImage(img, x*tw, y*th, tw, th);
    }

    // Not using rn. In case there's additional layers of tiles we want to render separately from rot.js
    for (let key in render_tiles) {
        [x, y] = key.split(",");
        img = Imgs[render_tiles[key]];
        tw = Game.display.getOptions().tileWidth;
        th = Game.display.getOptions().tileHeight;
        mapCtx = gameMapCanvas.getContext("2d");
        mapCtx.drawImage(img, x*tw, y*th, tw, th);
    }


	//draw part of the map based on the current focal point
	ctx.drawImage(gameMapCanvas,
		camera.x,camera.y,canvas.width/camera.zoom,canvas.height/camera.zoom,
		0,0,canvas.width,canvas.height);



	//ctx.restore();
}

// draw a tile on the main map
function drawAlphaTile(img, x, y){
    img = alphaImgs[img];
    ctx.drawImage(img, x, y, 16, 16);
}

//draw entire map as a minimap on the sidebar
function drawMiniMap(){
	if(Game == null || Game.display == null)		//wait until game object is available
		return;

	//set ui variables if Game object is available
	if(gameMapCanvas == null || tw == null || th == null || scw == null || sch == null){
	   gameMapCanvas = Game.display.getContainer();		//set the canvas if available (Game object set)

	   //scale down (this would normally be calculated by the map size relative to the canvas size)
		tw = Game.display.getOptions().tileWidth;
		th = Game.display.getOptions().tileHeight;
		scw = miniCanvas.width/(Game.display.getOptions().width);
		sch = miniCanvas.height/(Game.display.getOptions().height);
	}

	//reset
	//mtx.save();
	mtx.clearRect(0, 0, miniCanvas.width, miniCanvas.height);

	//draw entire map from the game onto the minimap
	mtx.drawImage(gameMapCanvas, 0,0,miniCanvas.width,miniCanvas.height);

	//maybe add icons for the characters?
	mtx.drawImage(playerIcon, 0,0,16,16, (Game.player._x*scw)-(iconSize/2), (Game.player._y*sch)-(iconSize/2), iconSize,iconSize);
	let frogs = Game.frog_manager.frogs;
	for(let f=0;f<frogs.length;f++){
		let frog = frogs[f];
		mtx.drawImage(frogIcon, 0,0,16,16, (frog._x*scw)-(iconSize/2), (frog._y*sch)-(iconSize/2), iconSize,iconSize);
	}
	let barbs = Game.barbarians
	for(let b=0;b<barbs.length;b++){
		let barb = barbs[b];
		mtx.drawImage(barbIcon, 0,0,16,16, (barb._x*scw)-(iconSize/2), (barb._y*sch)-(iconSize/2), iconSize,iconSize);
	}



	//draw camera box on minimap
	let cw = (tw*camera.zoom);
	let ch = (th*camera.zoom)

	mtx.strokeStyle = "#fff";
	mtx.strokeRect((camera.x/tw)*scw,(camera.y/th)*sch,((canvas.width/camera.zoom)/tw)*scw,((canvas.height/camera.zoom)/tw)*sch)
}


/////////////////////       MENU ITEMS       ////////////////////////


//TAB MENU


//change menu section (minimap - build)
function changeSection(sec,tab){
	//set background color
	let allTabs = document.getElementsByClassName("tabs");
	for(let t=0;t<allTabs.length;t++){
		allTabs[t].style.backgroundColor = "#dedede";
	}
	tab.style.backgroundColor = "#ECCE0E";

	document.getElementById("build_opt").style.display = "none";
	document.getElementById("minimapCanvas").style.display = "none";
	document.getElementById("user_settings").style.display = "none";
	document.getElementById("text_log").style.display = "none";
	document.getElementById("obj_list").style.display = "none";
	objDivShown = false;

	if(sec == "minimap"){
		document.getElementById("minimapCanvas").style.display = "block";
	}else if(sec == "build"){
		document.getElementById("build_opt").style.display = "block";
	}else if(sec == "settings"){
		document.getElementById("user_settings").style.display = "block";
	}else if(sec == "log"){
		document.getElementById("text_log").style.display = "block";
	}else if(sec == "obj"){
		setObjsDiv();
		document.getElementById("obj_list").style.display = "block";
		objDivShown = true;
	}

}


// BUILD MENU

//shows icon and build description in build tab when hovered over
function showBuildDesc(b){
	//set description and icon based on item
	document.getElementById("buildDesc").innerHTML = build_info[b];
	document.getElementById("buildIcon").src = build_imgs[b];
}

//select item to build from the menu selection
function selectBuildDiv(code,r){
	resetBuildItemsColor();
	r.style.backgroundColor = "#ECCE0E";

	//set build item
	buildSelect(code)
	displayText('Build ' + r.innerHTML.toUpperCase() + '. Select location.');
}

//reset colors of build item tabs
function resetBuildItemsColor(){
	//set background color
	let allTabs = document.getElementsByClassName("buildItem");
	for(let t=0;t<allTabs.length;t++){
		allTabs[t].style.backgroundColor = "#dedede";
	}
}


//TEXT LOGGER

//adds console txt to the log and updates the screen accordingly
function addToLog(txt){
	//add to the log
	txtLog.push(txt);
	if(txtLog.length > maxTxtLog){
		txtLog.shift();
	}

	//update the screen
	let logger = document.getElementById("text_log");
	document.getElementById("text_log").innerHTML = " - " + txtLog.join("<br> - ");
	document.getElementById("text_log").scrollTop = logger.scrollHeight;

}


//OBJECTIVES

//set whether the objectives are active or not for the div
function setObjsDiv(){
	//check if any new ones are active
	let act_objs = objectiveList.activation;
	for(let a=0;a<act_objs.length;a++){
		if(!objectiveList.completed[a])
			objectiveList.completed[a] = act_objs[a]();
	}
	
	//update inner html of divs
	let objs = objectiveList.completed;
	for(let o=0;o<objs.length;o++){
		document.getElementById("obj_"+o+"_check").innerHTML = (objs[o] ? '&#x2611;' : '&#x2610;');
	}
}


//SETTINGS

//changes the zoom value on the minimap and the map screen
function changeZoom(v){
	camera.zoom = parseFloat(v);
}

//change minimap icon size
function changeIconSize(v){
	iconSize = parseInt(v);
}

function changeGameSpeed(v){
	Game.tickPerSec = 1200 - v;
}

// CHARACTER CONTROLS

function getFrogName(index){
	let names = ["Primus", "Secondus", "Tertius", "Quartus", "Quintus", "Sextus", "Septimus", "Octonus", "Novemus", "Decemus"]
	return (index < names.length-1 ? names[index] : names[index%names.length] + " II");
} 

function addNewFrogUI(index){
	let charDiv = document.getElementById("stats");

	//main div
	let d1 = document.createElement("div");
	d1.id = "frog"+index;
	d1.classList.add("charItem");
	d1.onclick = function(){camFocusChar(d1);}

	//icon
	let icon = document.createElement("img");
	icon.src = "imgs/sprites/frog.png";
	icon.classList.add("charItemIMG");
	d1.appendChild(icon);

	//text div
	let txtdiv = document.createElement("div");
	txtdiv.classList.add("charItemStats");
	txtdiv.id = "frog"+index+"SideStats";

	//text
	let txt = document.createElement("div");
	txt.classList.add("charName");
	txt.ondblclick = function(){editCharName(txtdiv);}
	txt.innerHTML = getFrogName(index) + " the Frog";
	txtdiv.appendChild(txt);

	//input
	let edittxt = document.createElement("input");
	edittxt.type = "text";
	edittxt.classList.add("nameEdit");
	edittxt.onblur = function(){saveCharName(txtdiv);}
	txtdiv.appendChild(edittxt);

	//add it all together
	d1.appendChild(txtdiv);
	charDiv.appendChild(d1)

}

//change a character's name
var editingName = false;
function editCharName(e){
	//hide og text
	let txt = e.getElementsByClassName("charName")[0];
	txt.style.display = "none";

	//show input field
	let intxt = e.getElementsByTagName("input")[0];
	intxt.value = txt.innerHTML;
	intxt.style.display = "block";
	intxt.focus();

	editingName = true;
}

//save the name for the character
function saveCharName(e){
	//show input field
	let intxt = e.getElementsByTagName("input")[0];
	intxt.style.display = "none";

	//hide og text
	let txt = e.getElementsByClassName("charName")[0];
	txt.innerHTML = intxt.value;
	txt.style.display = "block";

	editingName = false;
}

render();
