///////////      GLOBAL VARIABLES       ///////////////////

//swap between canvas and iframe
var mainScreen=document.getElementById('gameArea');
var combatScreen=document.getElementById('combatDefense');
var combatWallScreen=document.getElementById('combatWall');

var sideScreen=document.getElementById('gameSide');
//var attackScreen=document.getElementById('combatAttack');

// Combina harvest and attack orders into "orders" for the sake of UI
const order_info = Object.assign({}, harvest_info, attack_info);
const orderImgs = Object.assign({}, harvestImgs, attackImgs, build_imgs);

/*document.getElementById("swapScreen").onclick=function(){
  swapCanvases();
};*/

swapCanvases();

function swapCanvases(){
  if(mainScreen.style.visibility=='visible'){
    mainScreen.style.visibility='hidden';
    sideScreen.style.visibility='hidden';
    combatScreen.style.visibility='visible';

  }else{
    mainScreen.style.visibility='visible';
    sideScreen.style.visibility='visible';
    combatScreen.style.visibility='hidden';

  }
}

function showMain(){
	//localStorage.setItem("combatType", "atk");
	mainScreen.style.visibility='visible';
  sideScreen.style.visibility='visible';
  combatScreen.style.visibility='hidden';
  combatWallScreen.style.visibility='hidden';
}

function showCombat(){
	//localStorage.setItem("combatType", "def");
	mainScreen.style.visibility='hidden';
  sideScreen.style.visibility='hidden';
  combatScreen.style.visibility='visible';
  combatWallScreen.style.visibility='hidden';
}

function showWallCombat(){
	mainScreen.style.visibility='hidden';
  sideScreen.style.visibility='hidden';
  combatScreen.style.visibility='hidden';
	combatWallScreen.style.visibility='visible';
}

//main game
var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");
canvas.width = 640;
canvas.height = 640;
canvas.onmousemove = function(e){drawGhostOrder(e)}

//minimap canvas
var miniCanvas = document.getElementById("minimapCanvas");
var mtx = minimapCanvas.getContext("2d");
miniCanvas.width = 332;
miniCanvas.height = 300;

//overwrite sprites
var player2 = new Image();
player2.src = "imgs/player_barb_king.png";
var player3 = new Image();
player3.src = "imgs/player_grass_king.png";
var player4 = new Image();
player4.src = "imgs/player_super_king.png";

var kingBarb = new Image();
kingBarb.src = "imgs/king.png";

var kingWallSpr = new Image();
kingWallSpr.src = "imgs/kingWall.png";

//highlight sprites
var playHighL = new Image();
playHighL.src = "imgs/player_highlight.png";

var frogHighL = new Image();
frogHighL.src = "imgs/frog_highlight.png";

//minimap icons
var playerIcon = new Image();
playerIcon.src = "imgs/sprites/player_icon.png";
var playerBarbKingIcon = new Image();
playerBarbKingIcon.src = "imgs/sprites/player_king1.png";
var playerGrassKingIcon = new Image();
playerGrassKingIcon.src = "imgs/sprites/player_king2.png";
var playerSuperKingIcon = new Image();
playerSuperKingIcon.src = "imgs/sprites/player_super_king.png";

var frogIcon = new Image();
frogIcon.src = "imgs/sprites/frog_icon.png";

var barbIcon = new Image();
barbIcon.src = "imgs/sprites/barbarian_icon.png";

var kingIcon = new Image();
kingIcon.src = "imgs/sprites/king2.png"

//get transparent blueprint tiles
var alphaImgs = {};

for (let item in build_imgs) {
    alphaImg = new Image();
    alphaImg.src = "imgs/processed/alpha_" + item + ".png";
    alphaImgs[item] = alphaImg;
}

for (let item in harvestImgs) {
    harvestImg = new Image();
    harvestImg.src = "imgs/" + harvest_to_img[item] + ".png";
    //console.log(harvestImg.src);
    harvestImgs[item] = harvestImg;
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
    Game.log_display.drawText(0, 3, str);
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

//convert time to next day to coordinates for a clock
function dayTickCoords(){
	let curTick = Game.gameTicks % Game.ticksPerDay;
	let angle = Math.round((curTick * 360) / (Game.ticksPerDay))-90;
	angle *= Math.PI / 180;
	let d = 20;
	return [Math.floor(d*Math.cos(angle)),Math.floor(d*Math.sin(angle))];
}

//var displayHUD = function() {
function displayHUD() {
  //general player info
  /*
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
  */
  //new resource ui (with status bars)
  let rtx = Game.resource_display.getContext("2d");
  rtx.clearRect(0,0,Game.resource_display.width,Game.resource_display.height)


  //ui bars
  rtx.strokeStyle = "#ffffff";
  rtx.lineWidth = 1

  rtx.strokeRect(15,20,100,20);
  rtx.strokeRect(15,50,100,20);
  rtx.strokeRect(15,80,100,20);

  rtx.fillStyle = "#C01616";
  rtx.fillRect(16,21,98*(Math.max(Game.player.getHealth(),0)/Game.player.maxHealth),18);
  rtx.fillStyle = "#1F77ED";
  rtx.fillRect(16,51,98*(Game.player.getThirst()/100),18);
  rtx.fillStyle = "#29B519";
  rtx.fillRect(16,81,98*(Game.player.getHunger()/100),18);

  rtx.font = "14px monospace";
  rtx.fillStyle = "#ffffff";
  rtx.textAlign = "center";
  rtx.fillText("HEALTH", 65,35);
  rtx.fillText("THIRST", 65,65);
  rtx.fillText("HUNGER", 65,95);

  //clock for time of day
  rtx.font = "12px monospace";
  rtx.fillText("Day " + Game.days.toString(), 170,20);
  rtx.beginPath();
  rtx.lineWidth = 2
  rtx.arc(170, 65, 25, 0, 2 * Math.PI);
  rtx.stroke();
  rtx.beginPath();
  rtx.moveTo(170,65);
  let c = dayTickCoords();
  rtx.lineTo(170+c[0],65+c[1]);
  rtx.stroke();
  rtx.fillRect(169,45,2,6);

  //resources
  rtx.textAlign = "left";
  rtx.fillText("Seeds: " + Game.player.seeds.toString(), 220, 35);
  rtx.fillText("Wood : " + Game.player.wood.toString(), 220, 50);
  rtx.fillText("Meat : " + Game.player.meat.toString(), 220, 65);
  rtx.fillText("Frogs: " + Game.frog_manager.frogs.length, 220, 80);

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
	if(Game == null || Game.curState == "start")
		return;

	//dead
	else if(Game.curState == "end"){
		drawDeath();
	}else{
		drawMain();
  		drawMiniMap();
	}
}

//switches focus to a point clicked on the minimap
function camFocusPt(p){
	camera.focus = {_x:p[0], _y:p[1]};
	camera.focusChar = null;
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

//draw ghost of build item on the map when hovered over
let ghostBuild = {active:false, x:0,y:0,img:null}
ghostBuild.img = new Image();
function drawGhostBuild(e){
	//not in build mode? ignore
	if(!await_build_location || await_build_select){
		ghostBuild.active = false;
		return;
	}

	//get raw pixel location relative to the canvas
    let rect = e.target.getBoundingClientRect();
    let mx = Math.floor(Math.round(e.clientX - rect.left)/tw);
    let my = Math.floor(Math.round(e.clientY - rect.top)/th);

    ghostBuild.active = true;
    ghostBuild.x = mx;
    ghostBuild.y = my;
    ghostBuild.img.src = build_imgs[next_build];

}

//draw ghost of order item on the map when hovered over
let ghostOrder = {active:false, x:0,y:0,img:null}
ghostOrder.img = new Image();
function drawGhostOrder(e){
	//not in harvest/attack mode? ignore
	if (!(await_harvest_location || await_attack_location || await_build_location || await_harvest_select || await_attack_select || await_build_select)){
		ghostOrder.active = false;
		return;
	}
//  console.log("ghost image debug");
//  console.log(next_order);
//  console.log(orderImgs);

	//get raw pixel location relative to the canvas
    let rect = e.target.getBoundingClientRect();
    let mx = Math.floor(Math.round(e.clientX - rect.left)/tw);
    let my = Math.floor(Math.round(e.clientY - rect.top)/th);

    ghostOrder.active = true;
    ghostOrder.x = mx;
    ghostOrder.y = my;
    ghostOrder.img.src = orderImgs[next_order];

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
    mapCtx = gameMapCanvas.getContext("2d");
    for (let key in build_orders) {
        [x, y] = key.split(",");
        img = alphaImgs[build_orders[key]];
        tw = Game.display.getOptions().tileWidth;
        th = Game.display.getOptions().tileHeight;
        mapCtx.drawImage(img, x*tw, y*th, tw, th);
    }

    for (let key in harvest_orders) {
        [x, y] = key.split(",");
        img = harvestImgs[harvest_orders[key]];
        tw = Game.display.getOptions().tileWidth;
        mapCtx.drawImage(img, x*tw, y*th, tw, th);
    }


	//draw part of the map based on the current focal point
	ctx.drawImage(gameMapCanvas,
		camera.x,camera.y,canvas.width/camera.zoom,canvas.height/camera.zoom,
		0,0,canvas.width,canvas.height);

	//draw any overwritten sprites
	if(Game.king_barbarian != null)
		overwriteChar(Game.king_barbarian,kingBarb, mapCtx);
		//king player
	if(Game.king_barbarian == null && !grassLand20)
		overwriteChar(Game.player, player2, mapCtx);
	else if(Game.king_barbarian != null && grassLand20)
		overwriteChar(Game.player, player3, mapCtx);
	else if(Game.king_barbarian == null && grassLand20)
		overwriteChar(Game.player, player4, mapCtx);

	if(Game.kingWall && Game.kingWall.intact)
		overwriteChar(Game.kingWall,kingWallSpr,mapCtx)


	//draw ghost build for hover mouse if active
	if(ghostBuild.active){
		ctx.globalAlpha = 0.5;
		ctx.drawImage(ghostBuild.img, ghostBuild.x*tw, ghostBuild.y*th, tw,th);
		ctx.globalAlpha = 1.0;
	}
	if(ghostOrder.active){
		ctx.globalAlpha = 0.5;
		ctx.drawImage(ghostOrder.img, ghostOrder.x*tw, ghostOrder.y*th, tw,th);
		ctx.globalAlpha = 1.0;
    }
	

	//sprite highlight
	if(camera.focusChar == Game.player && playHighL.width > 0){
		overwriteChar(camera.focusChar,playHighL,mapCtx)
	}
	else if(camera.focusChar != null && frogHighL.width > 0)
		overwriteChar(camera.focusChar,frogHighL,mapCtx)

	//ctx.restore();
}

//overwrite the character coordinates with this sprite
function overwriteChar(c,o,tx){
	if(o.width > 0){
		tx.drawImage(o, 0,0,32,32,c._x*tw, c._y*th, tw,th);
	}
}

// draw a tile on the main map
function drawAlphaTile(img, x, y){
    img = alphaImgs[img];
    ctx.drawImage(img, x, y, 16, 16);
}

function drawHarvestOverlay(img, x, y) {
    img = harvestImgs[img];
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
	let pi = playerIcon;
	if(Game.king_barbarian == null && !grassLand20)
		pi = playerBarbKingIcon;
	else if(Game.king_barbarian != null && grassLand20)
		pi = playerGrassKingIcon;
	else if(Game.king_barbarian == null && grassLand20)
		pi = playerSuperKingIcon;
	mtx.drawImage(pi, 0,0,16,16, (Game.player._x*scw)-(iconSize/3), (Game.player._y*sch)-(iconSize/2), iconSize,iconSize);
	

	let frogs = Game.frog_manager.frogs;
	for(let f=0;f<frogs.length;f++){
		let frog = frogs[f];
		mtx.drawImage(frogIcon, 0,0,16,16, (frog._x*scw)-(iconSize/3), (frog._y*sch)-(iconSize/2), iconSize,iconSize);
	}
	let barbs = Game.barbarians
	for(let b=0;b<barbs.length;b++){
		let barb = barbs[b];
		mtx.drawImage((barb.is_king ? kingIcon : barbIcon), 0,0,16,16, (barb._x*scw)-(iconSize/3), (barb._y*sch)-(iconSize/2), iconSize,iconSize);
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
	document.getElementById("order_opt").style.display = "none";
	document.getElementById("minimapCanvas").style.display = "none";
	document.getElementById("user_settings").style.display = "none";
	document.getElementById("text_log").style.display = "none";
	document.getElementById("obj_list").style.display = "none";

	document.getElementById("tutorial").style.display = "none";
	document.getElementById("stats").style.display = "block";
	objDivShown = false;

	if(sec == "minimap"){
		document.getElementById("minimapCanvas").style.display = "block";
	}else if(sec == "build"){
		document.getElementById("build_opt").style.display = "block";
    }else if(sec == "order"){
        document.getElementById("order_opt").style.display = "block";
	}else if(sec == "settings"){
		document.getElementById("user_settings").style.display = "block";
	}else if(sec == "log"){
		document.getElementById("text_log").style.display = "block";
	}else if(sec == "obj"){
		setObjsDiv();
		document.getElementById("obj_list").style.display = "block";
		objDivShown = true;

		document.getElementById("stats").style.display = "none";
		document.getElementById("tutorial").style.display = "block";

		cancelObjTab();
	}

}


// BUILD MENU

//shows icon and build description in build tab when hovered over
function showBuildDesc(b){
	//set description and icon based on item
	document.getElementById("buildDesc").innerHTML = build_info[b];
	document.getElementById("buildIcon").src = build_imgs[b];
}

//shows icon and order description in build tab when hovered over
function showOrderDesc(b){
	//set description and icon based on item
	document.getElementById("orderDesc").innerHTML = order_info[b];
	document.getElementById("orderIcon").src = orderImgs[b];
}



//select item to build from the menu selection
function selectBuildDiv(code,r){
	resetBuildItemsColor();
	r.style.backgroundColor = "#ECCE0E";

	//set build item
	buildSelect(code)
	//displayText('Build ' + r.innerHTML.toUpperCase() + '. Select location.');
}

//select order item to build from the menu selection
function selectOrderDiv(code,r,atk=false){
//  console.log(code);
    resetOrderItemsColor();
	r.style.backgroundColor = "#ECCE0E";
	//set order item
    if (atk){
      //console.log('attack');
        attackSelect(code);
    }
    else {
      //console.log('harvest');
        harvestSelect(code);
    }
	//displayText('Build ' + r.innerHTML.toUpperCase() + '. Select location.');
}

//reset colors of build item tabs
function resetOrderItemsColor(){
	//set background color
	let allTabs = document.getElementsByClassName("orderItem");
	for(let t=0;t<allTabs.length;t++){
		if(allTabs[t].id != "cancelOrder")
			allTabs[t].style.backgroundColor = "#dedede";
	}
}

//reset colors of build item tabs
function resetBuildItemsColor(){
	//set background color
	let allTabs = document.getElementsByClassName("buildItem");
	for(let t=0;t<allTabs.length;t++){
		if(allTabs[t].id != "cancelBuild")
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


//switch focus from one character to another on the main game screen
function camFocusChar(b){
	let ent = Game.player;

	//player
	if(b.id == "player"){
		ent = Game.player;
		camera.focusChar = Game.player;
	}

	//get frog in the array of frogs
	else if(b.id && b.id.includes("frog")){
		let fi = parseInt(b.id.replace("frog",""));
		if(fi < Game.frog_manager.frogs.length){
			ent = Game.frog_manager.frogs[fi];
			camera.focusChar = Game.frog_manager.frogs[fi];
		}
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

//latin frog names based on ordinance
function getFrogName(index){
	let names = ["Primus", "Secondus", "Tertius", "Quartus", "Quintus", "Sextus", "Septimus", "Octonus", "Novemus", "Decemus"]
	return (index < names.length ? names[index] : names[index%names.length] + " " + roman(Math.floor(index/names.length)));
} 

//roman numeral
function roman(n){
	let num = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];	//i doubt someone will have more than 100 frogs at once
	return num[n]
}

//adds a new clickable frog from the list to the index ui
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
	Game.frog_manager.frogs[index].name = getFrogName(index) + " the Frog";

	//input
	let edittxt = document.createElement("input");
	edittxt.type = "text";
	edittxt.classList.add("nameEdit");
	edittxt.onblur = function(){saveCharName(txtdiv);}
	txtdiv.appendChild(edittxt);

	//frog commands
	let commandDiv = document.createElement("div");
	commandDiv.classList.add("commands");
	let frogComms = ["Build", "Attack", "Harvest", "Auto"];
	for(let c=0;c<frogComms.length;c++){
		let but = document.createElement("button");
		but.innerHTML = frogComms[c]
		but.onclick = function(){frogCommand(but);}
		commandDiv.appendChild(but);
	}
	txtdiv.appendChild(commandDiv);



	//add it all together
	d1.appendChild(txtdiv);
	charDiv.appendChild(d1)

}

//change a character's name
var editingName = false;
var changedName = false;

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

	//player changed name
	if(e.id == "playerSideStats")
		changedName = true;
	//changed frog name
	else{
		let fi = parseInt(e.id.replace("frog","").replace("SideStats",""));
		Game.frog_manager.frogs[fi].name = intxt.value;
	}
}


//give a frog a command
function frogCommand(e){
	//set frog mode
	let command = e.innerHTML.toLowerCase();
	let frogId = parseInt(e.parentNode.parentNode.parentNode.id.replace("frog",""));
	Game.frog_manager.frogs[frogId].command = command;


	//reset colors
	let buttons = e.parentNode.getElementsByTagName("button");
	for(let b=0;b<buttons.length;b++){
		buttons[b].style.backgroundColor = "#efefef";
	}
	e.style.backgroundColor = "#24B12D";

}

/////////////////    END SCREEN VISUALS   ////////////////

var deathCanvas = document.getElementById("deathScreen");
var dtx = deathCanvas.getContext("2d");
deathCanvas.width = 640;
deathCanvas.height = 640;

var grave = new Image();
grave.src = "imgs/gravestone.png";

function drawDeath(){
	dtx.clearRect(0,0,deathCanvas.width,deathCanvas.height);

	//background
	dtx.fillStyle = "#000";
	dtx.fillRect(0,0,deathCanvas.width,deathCanvas.height);

	//show Cause of Death
	dtx.fillStyle = "#fff";
	dtx.font = "24px Dwarf";
	dtx.textAlign = "center";
	let mesparts = Game.player.cod.split("\n");
	for(let p=0;p<mesparts.length;p++)
		dtx.fillText(mesparts[p], deathCanvas.width/2,20*p+220);

	//show grave
	if(grave.width > 0)
		dtx.drawImage(grave, 0, 0, 31, 31, (canvas.width/2)-32, 280, 64, 64);
}

function setAchievements(){
	let ach = "";
	//go through all of the stats and show them
	ach += "Seeds planted: " + GameStats.seedsPlanted + "<br>";
	ach += "Grass Eaten: " + GameStats.grassEaten + "<br>";
	ach += "Fires started: " + GameStats.fireStarted + "<br>";
	ach += "Frogs spawned: " + GameStats.frogsSpawned + "<br>";
	ach += "Orders given: " + GameStats.ordersGiven + "<br>";
	ach += "Barbarians killed: " + GameStats.barbariansKilled;


	document.getElementById("achievements").innerHTML = ach;
}

render();

