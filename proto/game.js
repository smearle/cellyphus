//set up the canvas(es)

//main game
var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");
canvas.width = 640;
canvas.height = 640;

//minimap canvas
var miniCanvas = document.getElementById("minimapCanvas");
var mtx = minimapCanvas.getContext("2d");
miniCanvas.width = 320;
miniCanvas.height = 300;

//text console (rogue-like stats)
var txtConsole = document.getElementById("console");
var ttx = txtConsole.getContext("2d");
txtConsole.width = 980;
txtConsole.height = 96;

var size = 32;

//camera
var camera = {
	x : 0,
	y : 0,
	focus : null
};

//KEYS

// directionals
var upKey = 38;     //[Up]
var leftKey = 37;   //[Left]
var rightKey = 39;  //[Rigt]
var downKey = 40;   //[Down]
var moveKeySet = [upKey, leftKey, rightKey, downKey];

// A and b
var a_key = 90;   //[Z]
var b_key = 88;   //[X]
var actionKeySet = [a_key, b_key];

var keys = [];


//temp sprites
var mapIMG = new Image();
mapIMG.src = "img/cellyphus_demo.png";
var mapReady = false;
mapIMG.onload = function(){mapReady = true;};

var mmapIMG = new Image();
mmapIMG.src = "img/cellyphus_demo.png";
var mmapReady = false;
mmapIMG.onload = function(){mmapReady = true;};

var playerIMG = new Image();
playerIMG.src = "img/player.png";
var playerReady = false;
playerIMG.onload = function(){playerReady = true;};

var frogIMG = new Image();
frogIMG.src = "img/frog.png";
var frogReady = false;
frogIMG.onload = function(){frogReady = true;};

var playerIcon = new Image();
playerIcon.src = "img/player_icon.png";
var playerIcReady = false;
playerIcon.onload = function(){playerIcReady = true;};

var frogIcon = new Image();
frogIcon.src = "img/frog_icon.png";
var frogIcReady = false;
frogIcon.onload = function(){frogIcReady = true;};

//layout options
let statLay = "vert";


var player = {
	x : 25,
	y : 20,
}

function frog(x,y){
	this.x = x;
	this.y = y;
}
var frogs = [new frog(4,29), new frog(16,18), new frog(8,8)];

camera.focus = player;


//////////////////    GENERIC FUNCTIONS   ///////////////


//checks if an element is in an array
function inArr(arr, e){
	if(arr.length == 0)
		return false;
	return arr.indexOf(e) !== -1
}


////////////////   KEYBOARD FUNCTIONS  //////////////////


// key events
var keyTick = 0;
var kt = null; 

function anyKey(){
	return anyMoveKey() || anyActionKey();
}

//check if any directional key is held down
function anyMoveKey(){
	return (keys[upKey] || keys[downKey] || keys[leftKey] || keys[rightKey])
}

function anyActionKey(){
	return (keys[a_key] || keys[b_key]);
}


////////////////   CAMERA FUNCTIONS   /////////////////

/*  OPTIONAL IF LARGE GAME MAP
//if within the game bounds
function withinBounds(x,y){
	var xBound = (x >= Math.floor(camera.x / size) - 1) && (x <= Math.floor(camera.x / size) + (canvas.width / size));
	return xBound;
}
//have the camera follow the player
function panCamera(){
	camera.x = 0;
	camera.y = 0;
	if(map.length != 0 && player.x > ((map[0].length) - ((canvas.width/size)/2)))
		camera.x = (map[0].length * size) - canvas.width;
	else if(player.x < ((canvas.width/size)/2))
		camera.y = 0;
	else
		camera.x = player.x *size - (canvas.width / 2);
	if(map.length != 0 && player.y > ((map.length) - ((canvas.height/size) / 2)))
		camera.y = (map.length * size) - canvas.height;
	else if(player.y < ((canvas.height/size)/2))
		camera.y = 0;
	else
		camera.y = player.y *size - (canvas.height / 2) + (size/2);
	camera.x += cam_offset.x;
	camera.y += cam_offset.y;
}
*/

//check if entity is onscreen
function onScreen(a){
	let x = a.x*size;
	let y = a.y*size;
	return x >= camera.x && y >= camera.y && x <= (camera.x+canvas.width) && y <= (camera.y+canvas.height); 
}


//////////////////  RENDER FUNCTIONS  ////////////////////

//draw everything
function render(){
	drawMain();
	drawConsole();
	drawMiniMap();

}

//draw main game screen
function drawMain(){
	ctx.save();
	ctx.translate(-camera.x, -camera.y);		//camera
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	//background
	ctx.fillStyle = "#68B8CD";
	ctx.fillRect(0,0,canvas.width, canvas.height);
	
	/*   add draw functions here  */

	//draw specific part of the map
	
	ctx.drawImage(mapIMG,
		camera.x,camera.y,canvas.width,canvas.height,
		camera.x,camera.y,canvas.width,canvas.height);
	
	//ctx.drawImage(zmapIMG,0,0);

	//draw focal point
	drawFocusChar();


	//draw characters on the map
	if(playerReady && onScreen(player)){
		ctx.drawImage(playerIMG, 0,0,playerIMG.width,playerIMG.height,
			player.x*size,player.y*size,size,size);
	}

	for(let f=0;f<frogs.length;f++){
		let frg = frogs[f];
		if(frogReady && onScreen(frg))
			ctx.drawImage(frogIMG, 0,0,frogIMG.width,frogIMG.height,
				frg.x*size,frg.y*size,size,size);
	}


	ctx.restore();
}

//draw stats console
function drawConsole(){
	ttx.save();
	ttx.clearRect(0, 0, txtConsole.width, txtConsole.height);

	ttx.fillStyle = "#fff";
	ttx.font = "12px Arial";
	ttx.fillText("Day: -1", 20, 20);
	ttx.fillText("HP: 69", 20, 55);
	ttx.fillText("PP :3", 20, 70);
	ttx.fillText("Hotel: Trivago", 20, 85);

	ttx.textAlign = "right";
	ttx.fillText("Sample text over here", txtConsole.width-20, 55);
	ttx.fillText("(Goblin noises)", txtConsole.width-20, 70);
	ttx.fillText("(HEEHEEHEE)", txtConsole.width-20, 85);
	
	ttx.restore();
}

//draw overworld minimap
function drawMiniMap(){
	//draw entire map
	mtx.drawImage(mmapIMG,
		0,0,mmapIMG.width,mmapIMG.height,
		0,0,miniCanvas.width,miniCanvas.height);

	//scale down (this would normally be calculated by the map size relative to the canvas size)
	let scw = miniCanvas.width/(40);
	let sch = miniCanvas.height/(40);

	//console.log(scw,sch)

	let msize = 16;

	let off = 4

	//draw characters
	//draw icons on minimap
	if(playerIcReady)
		mtx.drawImage(playerIcon,0,0,16,16,player.x*scw-off,player.y*sch-off,msize,msize)


	for(let f=0;f<frogs.length;f++){
		let frg = frogs[f];
		if(frogIcReady)
			mtx.drawImage(frogIcon,0,0,16,16,frg.x*scw-off,frg.y*sch-off,msize,msize)
	}

	//draw camera box
	mtx.strokeStyle = "#fff";
	mtx.strokeRect((camera.x/size)*scw,(camera.y/size)*sch,(canvas.width/size)*scw,(canvas.height/size)*sch)


}

//switch focus from one character to another 
function gotoChar(c,b){
	let ent = player;
	if(c == "frog1"){
		ent = frogs[0];
	}else if(c == "frog2"){
		ent = frogs[1];
	}else if(c == "frog3"){
		ent = frogs[2];
	}

	camera.x = (ent.x)*size - (canvas.width/2)
	camera.y = (ent.y)*size - (canvas.height/2)
	camera.focus = ent;

	if(camera.x < 0)
		camera.x = 0;
	if(camera.y < 0)
		camera.y = 0;

	//set highlight
	let icons = document.getElementsByClassName("icon");
	for(let i =0;i<icons.length;i++){
		icons[i].classList.remove("camFocus");
	}
	b.classList.add("camFocus")
}


//add background yellow to the character currently in focus
function drawFocusChar(){
	ctx.fillStyle = "#ffff00";
	ctx.fillRect(camera.focus.x*size,camera.focus.y*size,size,size);
}

//change the current screen and menu (used in ui3.html)
function changeMenu(scr,btn){
	let b = document.getElementsByClassName("tab");
	for(let i=0;i<b.length;i++){
		b[i].style.backgroundColor = "#dedede";
	}
	btn.style.backgroundColor = "#ffff00";


	document.getElementById("game").style.display = "none";
	document.getElementById("build").style.display = "none";
	document.getElementById("minimapCanvas").style.display = "none";
	document.getElementById("build").style.display = "none";
	document.getElementById("stats").style.display = "none";

	if(scr == "overworld"){
		document.getElementById("game").style.display = "block";
		document.getElementById("stats").style.display = "block";
	}else if(scr == "minimap"){
		document.getElementById("minimapCanvas").style.display = "block";
		document.getElementById("stats").style.display = "block";
	}else if(scr == "build"){
		document.getElementById("game").style.display = "block";
		document.getElementById("stats").style.display = "none";
		document.getElementById("build").style.display = "block";
	}
}

//change the current screen (used in ui2.html)
function changeScreen(scr){
	document.getElementById("game").style.display = "none";
	document.getElementById("build").style.display = "none";
	document.getElementById("minimapCanvas").style.display = "none";
	document.getElementById("stats").style.display = "none";
	if(scr == "overworld"){
		document.getElementById("game").style.display = "block";
		document.getElementById("stats").style.display = "block";
	}else if(scr == "minimap"){
		document.getElementById("minimapCanvas").style.display = "block";
		document.getElementById("stats").style.display = "block";
	}else if(scr == "build"){
		document.getElementById("build").style.display = "block";
		document.getElementById("game").style.display = "block";

	}
}

//change section (used in ui1.html)
function changeSection(sec){
	console.log(sec)
	if(sec == "minimap"){
		document.getElementById("minimapCanvas").style.display = "block";
		document.getElementById("build_opt").style.display = "none";
	}else if(sec == "build"){
		document.getElementById("minimapCanvas").style.display = "none";
		document.getElementById("build_opt").style.display = "block";
	}
}

//////////////   GAME LOOP FUNCTIONS   //////////////////

//game initialization function
function init(){
	camera.focus = player;
	gotoChar("player",document.getElementById("playerIcon"))
}

//main game loop
function main(){
	requestAnimationFrame(main);
	canvas.focus();

	//panCamera();

	render();

	//keyboard ticks
	var akey = anyKey();
	if(akey && kt == 0){
		kt = setInterval(function(){keyTick+=1}, 75);
	}else if(!akey){
		clearInterval(kt);
		kt = 0;
		keyTick=0;
	}

	//debug
	var settings = "debug here";

	//document.getElementById('debug').innerHTML = settings;
}


/////////////////   HTML5 FUNCTIONS  //////////////////

//determine if valud key to press
document.body.addEventListener("keydown", function (e) {
	if(inArr(moveKeySet, e.keyCode)){
		keys[e.keyCode] = true;
	}else if(inArr(actionKeySet, e.keyCode)){
		keys[e.keyCode] = true;
	}
});

//check for key released
document.body.addEventListener("keyup", function (e) {
	if(inArr(moveKeySet, e.keyCode)){
		keys[e.keyCode] = false;
	}else if(inArr(actionKeySet, e.keyCode)){
		keys[e.keyCode] = false;
	}
});

//prevent scrolling with the game
window.addEventListener("keydown", function(e) {
    // space and arrow keys
    if(([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1)){
        e.preventDefault();
    }
}, false);


main();