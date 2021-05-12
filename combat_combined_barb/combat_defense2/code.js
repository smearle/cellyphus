//randomize damage?
//make thirst an input
//create zone that ai cant spawn in
//setup circle to display time remaining

//ctxCombat.control global alpha or ctxCombat.fill style

var Game = {
	init : null,
}

//set up the canvasCombat
var canvasCombat = document.getElementById("game");
var ctxCombat = canvasCombat.getContext("2d");
canvasCombat.width = 320;
canvasCombat.height = 320;

var pCanvas = canvasCombat.cloneNode(); //presentation canvasCombat
var pCtx = canvasCombat.getContext("2d");
//document.body.appendChild(pCanvas);
//document.body.appendChild(canvasCombat);

//audio feedback
var aud_block = new Audio('audio/Shield_block.ogg');
aud_block.volume = 0.03;

var aud_playerHurt = new Audio('audio/Player_hurt.mp4');
aud_playerHurt.volume = 0.03;

//camera
var camera = {
	x : 0,
	y : 0
};

var curr = (new Date).getTime();
var endTime = (new Date).getTime();
//var shakeTime = 1000; //amount of time spent shaking in ms
var shakeTime = 400; //amount of time spent shaking in ms
var shakeIntensity = 5;


//up, right, down, left
var facingDirection = "right";

var backgroundColor = "#dedede";

//KEYS

// directionals
var upKey = 87;     //[W]
var leftKey = 65;   //[A]
var rightKey = 68;  //[S]
var downKey = 83;   //[D]
var moveKeySet = [upKey, leftKey, rightKey, downKey];

// A and b
var a_key = 79;   //[O]
var b_key = 80;   //[P]
var actionKeySet = [a_key, b_key];

var keys = [];

//game values
var gameVals = {
	damageTaken : 0,
	damageBlocked: 0,
	damaged : false,
	damagePerHit : 5,
	//time
}

//timer
var interval = 1000; // ms
var expected = Date.now() + interval;

//
var timer = {
	x: 100,
	y: 20,
	r: 12,
	maxTime : 15,
	timeRemaining : 15,
}

//shapes from SAT library to check for collision
var V = SAT.Vector;
var P = SAT.Polygon;

//box character
var player = {
	x : canvasCombat.width/2,
	y : canvasCombat.height/2,
	maxSize : 48,
	minSize : 16,
	size : 16,
	speed : 3,
	base_speed : 3,
	dashSpeed : 8,
	color : "#0D7612",
	trail : [],
	ct : 0,			//trail interval
	pt : 200,		//pause time (ms)

	shieldSize : 25,
	defendU : false,
	defendR : false,
	defendD : false,
	defendL : false,
}

//cardinal shields
var shieldU = {
	active : false,
	x: null,
	y: null,
	height: 4,
	width: 25,
	buffer: 16,
	corners: [],
	collisionMask: null,
}

var shieldR = {
	active : false,
	x: null,
	y: null,
	height: 25,
	width: 4,
	buffer: 16,
	corners: [],
	collisionMask: null,
}

var shieldD = {
	active : false,
	x: null,
	y: null,
	height: 4,
	width: 25,
	buffer: 16,
	corners: [],
	collisionMask: null,
}

var shieldL = {
	active : false,
	x: null,
	y: null,
	height: 25,
	width: 4,
	buffer: 16,
	corners: [],
	collisionMask: null,
}

//diagonal shields
var shieldUR = {
	active : false,
	x: null,
	y: null,
	height: 4,
	width: 25,
	buffer: 16,
	corners: [],
	collisionMask: null,
}

var shieldDR = {
	active : false,
	x: null,
	y: null,
	height: 4,
	width: 25,
	buffer: 16,
	corners: [],
	collisionMask: null,
}

var shieldDL = {
	active : false,
	x: null,
	y: null,
	height: 4,
	width: 25,
	buffer: 16,
	corners: [],
	collisionMask: null,
}

var shieldUL = {
	active : false,
	x: null,
	y: null,
	height: 4,
	width: 25,
	buffer: 16,
	corners: [],
	collisionMask: null,
}

var shieldArr = [
	shieldU, shieldR, shieldD, shieldL,
	shieldUR, shieldDR, shieldDL, shieldUL
];

//attacking ai
var ai = {
	x : 75,
	y : 75,
	height: 16,
	width: 16,
	color : '#f00',
	vel : {x : 0, y : 0},
	charged : true,				//whether in the middle of an attack
	maxSpeed : player.speed*3,		//max speed to attack (dependent on player)
	target : {x : 0, y : 0},
	delay : 500,					//attack delay
	canMove : true,
	trail : [],						//use same trail activation as player
	corners: [],
	collisionMask: null,
	critTimer: null,		//current amount of time for crit reset
	maxCritTimer: 2000, //max amount of time for crit reset
}

var testMask = {
	x: 129,
	y: 129,
	//height: 16,
	//width: 16,
	height: 4,
	width: 25,
	corners: [],
	collisionMask: null,
}

var collisionResponse = new SAT.Response(); //records collision information using collision masks

var size = 16;			//size of player and ai objects

//features
var draw_trail = true;			//player trail feature for movement

var gracePeriod = false;		//grace period for the player if it gets hit
var darkScreen = true;			//show screen dark when hit
var dt = 0;						//incrase radius of dark screen

var dash = true;			//feature for dashing when pressing "a" button
var camShake = true;		//feature for shaking camera when pressing "b" button
var pauseOnHit = true;			//feature for pausing characters on hit
var paused = true;				//if players are currently paused



//////////////////    GENERIC FUNCTIONS   ///////////////

//returns true if enemy or player are dead
function isGameOver(){
	var playerHP = localStorage.getItem("playerHP");
	var enemyHP = localStorage.getItem("enemyHP");
	if (playerHP <= 0 || enemyHP <= 0) {
		return true;
	}
	return false;
}

//returns the horizontal and vertical components that make up diagonal given diagonal len
//second and third parameter indicate direction of x and y respectively
function getDiagXY(x, y, diagLen, xDir, yDir){
	let sqr = diagLen * diagLen;
	let len =  Math.sqrt(sqr / 2);
	return([x + (len * xDir), y + (len * yDir)]);
}

//gets corners of UR Shield
function getURShield(shield){
	let x = shield.x;
	let y = shield.y;
	let width = shield.width;
	let height = shield.height;

	let points = [];
	let point = null;

	//points on outer bound
	let outerMidpoint = getDiagXY(x, y, (height/2), 1, -1);
	point = getDiagXY(outerMidpoint[0], outerMidpoint[1], (width / 2), -1, -1);
	points.push(point);

	point = getDiagXY(outerMidpoint[0], outerMidpoint[1], (width / 2), 1, 1);
	points.push(point);

	//points on inner bound
	let innerMidpoint = getDiagXY(x, y, (height/2), -1, 1);

	point = getDiagXY(innerMidpoint[0], innerMidpoint[1], (width / 2), 1, 1);
	points.push(point);

	point = getDiagXY(innerMidpoint[0], innerMidpoint[1], (width / 2), -1, -1);
	points.push(point);

	return points;
}

//gets corners of DR Shield
function getDRShield(shield){
	let x = shield.x;
	let y = shield.y;
	let width = shield.width;
	let height = shield.height;

	let points = [];
	let point = null;

	//points on outer bound
	let outerMidpoint = getDiagXY(x, y, (height/2), 1, 1);

	point = getDiagXY(outerMidpoint[0], outerMidpoint[1], (width / 2), 1, -1);
	points.push(point);

	point = getDiagXY(outerMidpoint[0], outerMidpoint[1], (width / 2), -1, 1);
	points.push(point);

	//points on inner bound
	let innerMidpoint = getDiagXY(x, y, (height/2), -1, -1);

	point = getDiagXY(innerMidpoint[0], innerMidpoint[1], (width / 2), -1, 1);
	points.push(point);

	point = getDiagXY(innerMidpoint[0], innerMidpoint[1], (width / 2), 1, -1);
	points.push(point);

	return points;
}

//gets corners of DL Shield
function getDLShield(shield){
	let x = shield.x;
	let y = shield.y;
	let width = shield.width;
	let height = shield.height;

	let points = [];
	let point = null;

	//points on outer bound
	let outerMidpoint = getDiagXY(x, y, (height/2), -1, 1);

	point = getDiagXY(outerMidpoint[0], outerMidpoint[1], (width / 2), 1, 1);
	points.push(point);

	point = getDiagXY(outerMidpoint[0], outerMidpoint[1], (width / 2), -1, -1);
	points.push(point);

	//points on inner bound
	let innerMidpoint = getDiagXY(x, y, (height/2), 1, -1);

	point = getDiagXY(innerMidpoint[0], innerMidpoint[1], (width / 2), -1, -1);
	points.push(point);

	point = getDiagXY(innerMidpoint[0], innerMidpoint[1], (width / 2), 1, 1);
	points.push(point);

	return points;
}

//gets corners of UL Shield
function getULShield(shield){
	let x = shield.x;
	let y = shield.y;
	let width = shield.width;
	let height = shield.height;

	let points = [];
	let point = null;

	//points on outer bound
	let outerMidpoint = getDiagXY(x, y, (height/2), -1, -1);

	point = getDiagXY(outerMidpoint[0], outerMidpoint[1], (width / 2), -1, 1);
	points.push(point);

	point = getDiagXY(outerMidpoint[0], outerMidpoint[1], (width / 2), 1, -1);
	points.push(point);

	//points on inner bound
	let innerMidpoint = getDiagXY(x, y, (height/2), 1, 1);

	point = getDiagXY(innerMidpoint[0], innerMidpoint[1], (width / 2), 1, -1);
	points.push(point);

	point = getDiagXY(innerMidpoint[0], innerMidpoint[1], (width / 2), -1, 1);
	points.push(point);

	return points;
}

function getCardShield(shield) {
	let x = shield.x;
	let y = shield.y;
	let width = shield.width;
	let height = shield.height;

	let points = [];
	let point = null;

	point = [x - width/2, y - height/2];
	points.push(point);

	point = [x + width/2, y - height/2];
	points.push(point);

	point = [x + width/2, y + height/2];
	points.push(point);

	point = [x - width/2, y + height/2];
	points.push(point);

	return points;
}

//create collision mask using position, width, and height
function createCollisionMask(obj) {
	let x = obj.x;
	let y = obj.y;
	let width = obj.width;
	let height = obj.height;
	let corners = obj.corners;

	let mcs = []; //mask corners

	corners.forEach(function (item) {
		mcs.push([item[0] - x, item[1] - y]);
	});

	let rect = new P(new V(x, y), [
		new V(mcs[0][0], mcs[0][1]), 
		new V(mcs[1][0], mcs[1][1]),
		new V(mcs[2][0], mcs[2][1]),
		new V(mcs[3][0], mcs[3][1])
	]);

	return rect;
}

//checks if an element is in an array
function inArr(arr, e){
	if(arr.length == 0)
		return false;
	return arr.indexOf(e) !== -1
}

function defendUp() {
	shieldU.active = true;
	shieldD.active = false;
}

function defendRight() {
	shieldR.active = true;
	shieldL.active = false;
}

function defendDown() {
	shieldU.active = false;
	shieldD.active = true;
}

function defendLeft() {
	shieldR.active = false;
	shieldL.active = true;
}

function defendOff() {
	shieldU.active = false;
	shieldR.active = false;
	shieldD.active = false;
	shieldL.active = false;
}

function startGame() {
	gameVals.damageTaken = 0;
	gameVals.damageBlocked = 0;
	timer.timeRemaining = timer.maxTime;
	paused = false;

	localStorage.setItem("damageRegistered", false);

	expected = Date.now() + interval;
	setTimeout(step, interval);
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

function moveCamera(){
	//if (shake)
		//camera.x += 10;
	//ctxCombat.translate(camera.x, camera.y);
}

////////////////   CAMERA FUNCTIONS   /////////////////

function doShake(intensity){
	if (camShake) {
		
		if (curr > endTime) {
			endTime = curr + shakeTime;
		}

		camera.x = Math.random() * intensity * 2 - intensity;
		camera.y = Math.random() * intensity * 2 - intensity;
	}
}

//////////////////  AI FUNCTIONS  ////////////////////
function updateHitReset() {

}

//send AI to random location on screen after some period of time
function randomizeAILocation() {
	let thirst = localStorage.getItem("playerThirst");//document.getElementById("thirst").value;

	//move ai position and collision mask
	ai.x = Math.floor(Math.random() * (canvasCombat.width + 1));
	ai.y = Math.floor(Math.random() * (canvasCombat.height + 1));

	//ai.collisionMask.pos.x = ai.x;
	//ai.collisionMask.pos.y = ai.y;

	ai.canMove = false;
	targetPlayer();

	setTimeout(function(){
		ai.canMove = true;
	}, ai.maxCritTimer * (thirst / 100))
}

//euclidean distance function
function dist(a,b){return Math.sqrt(Math.pow(b.x-a.x,2)+Math.pow(b.y-a.y,2));}

//velocity control
function velControl(cur, value, max){
	//too small to divide
	if(Math.abs(value) <= 3)
		return value;

	value = Math.round(value);

	//increment or decrement based on how close the max (target) is
	if(value > 0){
		if((cur + value) > max)
				return velControl(cur, Math.floor(value/2), max);
		else
				return value;
	}else if(value < 0){
		if((cur + value) < max)
				return velControl(cur, Math.floor(value/2), max);
		else
				return value;
	}else{
		return 1;
	}
}

//tries to pass thru the player to attack it
function targetPlayer(){
	let ed = player.base_speed*3;		//extra distance - how much farther to go past the player (so to try to predict trajectory)

	//get direction vector
	let yDir = Math.round(player.y-ai.y);
	let xDir = Math.round(player.x-ai.x);

	ai.target = {x: player.x, y:player.y}		//set target to current player position

	//get direction vector from distance
	let d = dist(ai,ai.target);
	let sm =  ai.maxSpeed/d;		//speed / distance (how much ground to cover)

	//calculate velocity
	ai.vel.x = sm*(ai.target.x-ai.x);
	ai.vel.y = sm*(ai.target.y-ai.y);

	//add modifier for extra distance
	ai.target.x += ai.vel.x*ed;
	ai.target.y += ai.vel.y*ed;
	
}

//check if ai hit the player
function collided(){
	//player dimensions (top left to bottom right corners)
	let px = player.x-size/2;	
	let py = player.y-size/2;	
	let pw = px+size;			
	let ph = py+size;			

	//ai dimensions (top left to bottom right corners)
	let ax = ai.x-ai.width/2;
	let ay = ai.y-ai.height/2;
	let aw = ax+ai.width;	
	let ah = ay+ai.height;

	//within box boundaries
	return (px < aw && pw > ax && py < ah && ph > ay);

}

//returns true if ai collision mask hit shield collision mask
//returns false otherwise

//work on this
function shieldCollided(shield) {
	let collis = false;
	collisionResponse.clear();
	collis = SAT.testPolygonPolygon(shield.collisionMask, ai.collisionMask, collisionResponse);

	if (collis){
		gameVals.damageBlocked += gameVals.damagePerHit;
		aud_block.play();
		randomizeAILocation();
	}
	
	
}



//////////////////  RENDER FUNCTIONS  ////////////////////

//change combat type to escape
function escapeCombat() {
	localStorage.setItem("combatType", "esc");
}

//show escape option when barbarian is below threshold
function escapeVisible() {
	if (localStorage.enemyHP < 30) {
		document.getElementById("esc").style.visibility = "visible";
	}
	else {
		document.getElementById("esc").style.visibility = "hidden";
	}
}


//change continue button to be visible
function contVisible() {
  document.getElementById("cont").style.visibility = "visible";
  document.getElementById("def").style.visibility = "hidden";
}

//change continue button to be hidden
function contHidden() {
  document.getElementById("cont").style.visibility = "hidden";
  document.getElementById("def").style.visibility = "visible";
}

//draw circular timer and sector to denote time
function drawTimer() {
	let arcStart = 1.5 * Math.PI;
	let pctFilled = 1 - timer.timeRemaining / timer.maxTime;
	let amtFilled = 2 * Math.PI * pctFilled + arcStart;

	//draw timer outline
	ctxCombat.beginPath();
	ctxCombat.arc(timer.x, timer.y, timer.r, 0, 2 * Math.PI);
	ctxCombat.stroke();

	//draw timer filling
	ctxCombat.beginPath();
	ctxCombat.moveTo(timer.x, timer.y);
	ctxCombat.arc(timer.x, timer.y, timer.r, amtFilled, arcStart);
	ctxCombat.lineTo(timer.x, timer.y);
	ctxCombat.fillStyle = "#131911";
	ctxCombat.fill();
	//ctxCombat.stroke();
}

//draws shield given corners
function drawShield(corners) {
	ctxCombat.beginPath();
	ctxCombat.moveTo(corners[0][0], corners[0][1]);
	ctxCombat.lineTo(corners[1][0], corners[1][1]);
	ctxCombat.lineTo(corners[2][0], corners[2][1]);
	ctxCombat.lineTo(corners[3][0], corners[3][1]);
	ctxCombat.closePath();
	ctxCombat.stroke();
}

function render(){
	ctxCombat.save();
	//ctxCombat.setTransform(1,0,0,1,0,0);
	moveCamera();
	//ctxCombat.translate(-camera.x, -camera.y);		//camera
	ctxCombat.clearRect(0, 0, canvasCombat.width, canvasCombat.height);
	
	//background
	ctxCombat.fillStyle = backgroundColor;
	ctxCombat.fillRect(0,0,canvasCombat.width, canvasCombat.height);
	
	/*   add draw functions here  */

	

	//draw a red box to represent the player
		//draw trail behind player and ai if active
		if(draw_trail){
			//player trail
			for(let t=1;t<player.trail.length;t++){
				let tp = player.trail[player.trail.length-1-t];		//get current trail object (from the back)
				let tsize = size/(1+(0.5*t));
				ctxCombat.globalAlpha = 0.8-(t*0.25);		//make increasingly transparent
				ctxCombat.fillStyle = player.color;
				ctxCombat.fillRect(tp.x-tsize/2,tp.y-tsize/2,tsize,tsize)	//make increasingly small
			}
			//ai trail
			for(let t=1;t<ai.trail.length;t++){
				let tp = ai.trail[ai.trail.length-1-t];		//get current trail object (from the back)
				let tsize = size/(1+(0.5*t));
				ctxCombat.globalAlpha = 0.8-(t*0.25);		//make increasingly transparent
				ctxCombat.fillStyle = ai.color;
				ctxCombat.fillRect(tp.x-tsize/2,tp.y-tsize/2,tsize,tsize)	//make increasingly small
			}
		}

	ctxCombat.globalAlpha = 1.0;		//reset alpha just in case

	ctxCombat.fillStyle = player.color
	ctxCombat.fillRect(player.x-size/2,player.y-size/2,size,size)

	//draw a dark green square to represent the AI
	ctxCombat.fillStyle = ai.color;
	ctxCombat.fillRect(ai.x-ai.width/2,ai.y-ai.height/2,ai.width,ai.height);

	//draw ai target
	//ctxCombat.fillStyle = "#000";
	//ctxCombat.fillText("X", ai.target.x, ai.target.y);

	//draw dark screen
	if(darkScreen && gracePeriod){
		if(!paused)
			dt+=2;

		let delay = (pauseOnHit ? 10 : 20)

		// Create gradient (with modifier for pause effect)
		var grd = ctxCombat.createRadialGradient(
		160,160,140+(dt < delay ? 0 : dt),
		160,160,200+(dt < delay ? 0 : dt));
		grd.addColorStop(0,"rgba(255, 255, 255, 0)");
		grd.addColorStop(1,"black");

		ctxCombat.fillStyle = grd;
		ctxCombat.fillRect(0,0,canvasCombat.width,canvasCombat.height);
	}

	drawTimer();

	//draw defense
	if (shieldU.active && shieldR.active) {
		drawShield(shieldUR.corners);
		shieldCollided(shieldUR);
	}

	else if (shieldD.active && shieldR.active) {
		drawShield(shieldDR.corners);
		shieldCollided(shieldDR);
	}

	else if (shieldD.active && shieldL.active) {
		drawShield(shieldDL.corners);
		shieldCollided(shieldDL);
	}

	else if (shieldU.active && shieldL.active) {
		drawShield(shieldUL.corners);
		shieldCollided(shieldUL);
	}

	else if (shieldU.active) {
		drawShield(shieldU.corners);
		shieldCollided(shieldU);
	}
	
	else if (shieldD.active) {
		drawShield(shieldD.corners);
		shieldCollided(shieldD);
		
	}

	else if (shieldR.active) {
		drawShield(shieldR.corners);
		shieldCollided(shieldR);
	}

	else if (shieldL.active) {
		drawShield(shieldL.corners);
		shieldCollided(shieldL);
	}

	//show damage stats
	document.getElementById("playerHP").innerHTML = localStorage.getItem("playerHP") ? localStorage.getItem("playerHP") : 0;
	document.getElementById("enemyHP").innerHTML = localStorage.getItem("enemyHP") ? localStorage.getItem("enemyHP") : 0;
	document.getElementById("taken").innerHTML = gameVals.damageTaken;
	document.getElementById("blocked").innerHTML = gameVals.damageBlocked;

	ctxCombat.restore();
}

function step() {
    var dt = Date.now() - expected; // the drift (positive for overshooting)
    if (dt > interval) {
        // something really bad happened. Maybe the browser (tab) was inactive?
        // possibly special handling to avoid futile "catch up" run
    }
    timer.timeRemaining -= 1;
    

    expected += interval;
    if (timer.timeRemaining <= 0) {
    	paused = true;
    	contVisible();

    	//store damage taken in current turn
    	localStorage.setItem("damageTaken", gameVals.damageTaken);

    	//calculate and store new enemy health
    	var prevHP = localStorage.getItem("playerHP");
    	var currHP = prevHP - gameVals.damageTaken;
    	localStorage.setItem("playerHP", currHP);

    	//checks if game is over
    	if(isGameOver()) {
    		contHidden();
    		localStorage.setItem("damageDealt", 0);
    		localStorage.setItem("damageTaken", 0);
    	}
    }  

    if (timer.timeRemaining != 0) {
    	setTimeout(step, Math.max(0, interval - dt)); // take into account drift
    }
}

function goToAtk() {
	console.log("sent to attack");
	localStorage.setItem("combatType", "atk");
}

//////////////   GAME LOOP FUNCTIONS   //////////////////

//game initialization function
function init(){
	contHidden();

	//initialize upper right shield corners
	[shieldUR.x, shieldUR.y] = getDiagXY(player.x, player.y, (shieldUR.buffer + shieldUR.height / 2), 1, -1);
	shieldUR.corners = getURShield(shieldUR);

	//initialize down right shield corners
	[shieldDR.x, shieldDR.y] = getDiagXY(player.x, player.y, (shieldDR.buffer + shieldDR.height / 2), 1, 1);
	shieldDR.corners = getDRShield(shieldDR);

	//initialize down left shield corners
	[shieldDL.x, shieldDL.y] = getDiagXY(player.x, player.y, (shieldDL.buffer + shieldDL.height / 2), -1, 1);
	shieldDL.corners = getDLShield(shieldDL);

	//initialize upper left shield corners
	[shieldUL.x, shieldUL.y] = getDiagXY(player.x, player.y, (shieldUL.buffer + shieldUL.height / 2), -1, -1);
	shieldUL.corners = getULShield(shieldUL);

	
	//initialize shield coords, corners, and collision masks
	[shieldU.x, shieldU.y] = [player.x, (player.y - shieldU.buffer - shieldU.height / 2)];
	[testMask.x, testMask.y] = [shieldU.x, shieldU.y];
	shieldU.corners = getCardShield(shieldU);

	[shieldR.x, shieldR.y] = [(player.x + shieldR.buffer + shieldR.width / 2), player.y];
	shieldR.corners = getCardShield(shieldR);

	[shieldD.x, shieldD.y] = [player.x, (player.y + shieldD.buffer + shieldD.height / 2)];
	shieldD.corners = getCardShield(shieldD);

	[shieldL.x, shieldL.y] = [(player.x - shieldU.buffer - shieldR.width / 2), player.y];
	shieldL.corners = getCardShield(shieldL);

	//create collision masks and set buffer for all 8 shields
	shieldArr.forEach(function(elem) {
		elem.collisionMask = createCollisionMask(elem);
		elem.buffer = 25;
	});

	//initialize ai corners and collision mask
	ai.corners = getCardShield(ai);
	ai.collisionMask = createCollisionMask(ai);

	targetPlayer();


}

//toggle ai movement
function togAI(c){
	ai.canMove = c;
}

//main game loop
function main(){
	requestAnimationFrame(main);

	canvasCombat.focus();

	//panCamera();

	escapeVisible();
	render();

	//pause when timer is 0
	if (timer.timeRemaining <= 0) {
		//move ai out of collision
		ai.x = 30;
		ai.y = 30;
		targetPlayer();
  	paused = true;

  	//store damage taken
  	//console.log("damageRegistered: " + localStorage.getItem("damageRegistered"));
  	if(!localStorage.getItem("damageRegistered")) {
  		localStorage.setItem("damageTaken", gameVals.damageTaken);
  		console.log("dmg stored: " + localStorage.getItem("damageTaken"));
  	}

  	// localStorage.setItem("damageTaken", gameVals.damageTaken);
  	// console.log("dmg stored: " + localStorage.getItem("damageTaken"));
  	
  	//gameVals.damageTaken = 0;
  }

  var combatState = localStorage.getItem("combatType"); 
  if (combatState.localeCompare("atk") == 0) {
		contHidden();
	}

	//collision mask should be at same location as ai
	ai.collisionMask.pos.x = ai.x;
	ai.collisionMask.pos.y = ai.y;

	curr = (new Date).getTime();
	if (curr < endTime) {
		doShake(shakeIntensity);
	}
	else {
		camera.x = 0;
		camera.y = 0;
	}
	pCtx.drawImage(canvasCombat,camera.x,camera.y); // present canvasCombat at x, and y

	//keyboard ticks
	var akey = anyKey();
	if(akey && kt == 0){
		kt = setInterval(function(){keyTick+=1}, 75);
	}else if(!akey){
		clearInterval(kt);
		kt = 0;
		keyTick=0;
	}

	if(keys[b_key]) {
		//camera.x = 40;
		doShake(shakeIntensity);
	}

	//movement + boundary
	if(!paused){
		defendOff();

		if(keys[upKey] && (player.y-size/2) > 0) {
			//player.y -= player.speed;
			defendUp();
			facingDirection = "up";
		}
		if(keys[downKey] && (player.y+size/2) < canvasCombat.height) {
			defendDown();
			facingDirection = "down";
		}
		if(keys[leftKey] && (player.x-size/2) > 0) {
			defendLeft();
			facingDirection = "left";
		}
		if(keys[rightKey] && (player.x+size/2) < canvasCombat.width) {
			defendRight();
			facingDirection = "right";
		}

	//dash
	if(dash){
			if(keys[a_key] && facingDirection == "up" && (player.y-size/2) > 0) {
				player.y -= player.dashSpeed;
			}
			if(keys[a_key] && facingDirection == "down" && (player.y+size/2) < canvasCombat.height) {
				player.y += player.dashSpeed;
			}
			if(keys[a_key] && facingDirection == "left" && (player.x-size/2) > 0) {
				player.x -= player.dashSpeed;
			}
			if(keys[a_key] && facingDirection == "right" && (player.x+size/2) < canvasCombat.width) {
				player.x += player.dashSpeed;
			}
		}
	}
	

	//if any movement add trail every 250ms
	if(draw_trail && player.ct == 0){
		//console.log("new trail")
		//add new positions repeatedly
		player.ct = setInterval(function(){
			//freeze everything on pause
			if(paused)
				return;

			//player
			player.trail.push({x:player.x,y:player.y});
			if(player.trail.length > 4){
				player.trail.shift();
			}

			//ai
			ai.trail.push({x:ai.x,y:ai.y});
			if(ai.trail.length > 4){
				ai.trail.shift();
			}
		},60);
	}else if(!draw_trail && player.ct != 0){		//stop capturing the trail movement
		clearInterval(player.ct);
		player.ct = 0;
	}

	//set velocity control for the ai agent
	

	//ai behavior
	if(ai.canMove && ai.charged){
		//keep moving to target
		if(Math.round(dist(ai,ai.target)) > ai.maxSpeed){

			if(!paused){
				//acceleration / decceleration
				ai.vel.x = velControl(ai.x,ai.vel.x,ai.target.x);
				ai.vel.y = velControl(ai.y,ai.vel.y,ai.target.y);

				ai.x += ai.vel.x;
				ai.y += ai.vel.y;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
				
				// console.log("---------------------------");
				// console.log("ai pos: " + [ai.x, ai.y]);
				// console.log(ai.collisionMask.pos);
				// console.log(ai.collisionMask.calcPoints);

				// console.log("test pos: " + [testMask.x, testMask.y]);
				// // console.log(testMask.collisionMask.pos);
				// // console.log(testMask.collisionMask.calcPoints);
				// console.log(shieldU.collisionMask.pos);
				// console.log(shieldU.collisionMask.calcPoints);

				// collisionResponse.clear();
				// var ch = SAT.testPolygonPolygon(ai.collisionMask, shieldU.collisionMask, collisionResponse);

				// console.log(ch);
				// console.log("---------------------------");

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
			}
			
		}
		//reset target
		else{
			setTimeout(function(){ai.charged = true;},ai.delay);
			targetPlayer();
			ai.charged = false;
		}
	}

	//ai hit the player
	if(!gracePeriod && collided()){
		gracePeriod = true;
		doShake(shakeIntensity/2);

		//calculate damage stuff
		gameVals.damageTaken += gameVals.damagePerHit;
		aud_playerHurt.play();

		if(pauseOnHit)
			paused = true;


		setTimeout(function(){paused = false;},player.pt);			//remove pause on all movement
		setTimeout(function(){gracePeriod = false;dt=0;},800);		//0.8 second grace period for the player
	}


	//debug
	//var settings = "(" + ai.target.x + ", " + ai.target.y + ") - " + Math.round(dist(ai,ai.target)) + " - (" + ai.vel.x + ", " + ai.vel.y + ")";
	var settings = paused;

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

//may need to remove init
init();
main();