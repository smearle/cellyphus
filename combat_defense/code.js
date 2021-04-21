//set up the canvas
var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");
canvas.width = 320;
canvas.height = 320;

var pCanvas = canvas.cloneNode(); //presentation canvas
var pCtx = canvas.getContext("2d");
//document.body.appendChild(pCanvas);
//document.body.appendChild(canvas);

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
  damageDealt : 0,
  maxTime : 20,
  timeRemaining : 20,
  damaged : false,
  damagePerHit : 3,
  //time
}

//shapes from SAT library to check for collision
var V = SAT.Vector;
var P = SAT.Polygon;

//box character
var player = {
	x : canvas.width/2,
	y : canvas.height/2,
	maxSize : 48,
	minSize : 16,
	size : 16,
	speed : 3,
	base_speed : 3,
	dashSpeed : 8,
	color : '#f00',
	trail : [],
	ct : 0,			//trail interval
	pt : 200,		//pause time (ms)

	shieldSize : 25,
	defendU : false,
	defendR : false,
	defendD : false,
	defendL : false,
}

//shields
var shieldU = {
	active : false,
	x: null,
	y: null,
	height: 4,
	width: 25,
	buffer: 16,
	collisionMask: null,
}

var shieldR = {
	active : false,
	x: null,
	y: null,
	height: 25,
	width: 4,
	buffer: 16,
	collisionMask: null,
}

var shieldD = {
	active : false,
	x: null,
	y: null,
	height: 4,
	width: 25,
	buffer: 16,
	collisionMask: null,
}

var shieldL = {
	active : false,
	x: null,
	y: null,
	height: 25,
	width: 4,
	buffer: 16,
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

//attacking ai
var ai = {
	x : 75,
	y : 75,
	height: 16,
	width: 16,
	color : "#0D7612",
	vel : {x : 0, y : 0},
	charged : true,				//whether in the middle of an attack
	maxSpeed : player.speed*3,		//max speed to attack (dependent on player)
	target : {x : 0, y : 0},
	delay : 500,					//attack delay
	canMove : true,
	trail : [],						//use same trail activation as player
	collisionMask: null,
}

var testMask = {
	x: 129,
	y: 129,
	height: 16,
	width: 16,
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
var paused = false;				//if players are currently paused



//////////////////    GENERIC FUNCTIONS   ///////////////

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
	let buffer = shield.buffer;
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
	let buffer = shield.buffer;
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
	let buffer = shield.buffer;
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
	let buffer = shield.buffer;
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

//creates and returns collision mask for cardinal shields
function createCollisionMask(shield) {
	let rect = new P(new V(shield.x, shield.y), [
	  new V(shield.x - shield.width / 2, shield.y - shield.height / 2), 
	  new V(shield.x + shield.width / 2, shield.y - shield.height / 2),
	  new V(shield.x + shield.width / 2, shield.y + shield.height / 2),
	  new V(shield.x - shield.width / 2, shield.y + shield.height / 2)
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
	//ctx.translate(camera.x, camera.y);
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

//send AI to random location on screen after some period of time
function randomizeAILocation() {
	ai.x = Math.floor(Math.random() * (canvas.width + 1));
	ai.y = Math.floor(Math.random() * (canvas.height + 1));
	ai.canMove = false;
	targetPlayer();

	setTimeout(function(){
		ai.canMove = true;
	}, 500)
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
function shieldCollided(shield) {
	//randomizeAILocation();

	// collisionResponse.clear();
	// var collided = SAT.testPolygonPolygon(shield.collisionMask, ai.collisionMask, collisionResponse);

	// if (collided){
	// 	console.log("shield x:  " + shield.x + " shield y: " + shield.y);
	// 	ai.canMove = false;
	// }
	
}



//////////////////  RENDER FUNCTIONS  ////////////////////

//draws shield given corners
function drawShield(corners) {
	ctx.beginPath();
  ctx.moveTo(corners[0][0], corners[0][1]);
  ctx.lineTo(corners[1][0], corners[1][1]);
  ctx.lineTo(corners[2][0], corners[2][1]);
  ctx.lineTo(corners[3][0], corners[3][1]);
  ctx.closePath();
  ctx.stroke();
}

function render(){
	ctx.save();
	//ctx.setTransform(1,0,0,1,0,0);
	moveCamera();
	//ctx.translate(-camera.x, -camera.y);		//camera
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	//background
	ctx.fillStyle = backgroundColor;
	ctx.fillRect(0,0,canvas.width, canvas.height);
	
	/*   add draw functions here  */

	//draw a red box to represent the player
		//draw trail behind player and ai if active
		if(draw_trail){
			//player trail
			for(let t=1;t<player.trail.length;t++){
				let tp = player.trail[player.trail.length-1-t];		//get current trail object (from the back)
				let tsize = size/(1+(0.5*t));
				ctx.globalAlpha = 0.8-(t*0.25);		//make increasingly transparent
				ctx.fillStyle = player.color;
				ctx.fillRect(tp.x-tsize/2,tp.y-tsize/2,tsize,tsize)	//make increasingly small
			}
			//ai trail
			for(let t=1;t<ai.trail.length;t++){
				let tp = ai.trail[ai.trail.length-1-t];		//get current trail object (from the back)
				let tsize = size/(1+(0.5*t));
				ctx.globalAlpha = 0.8-(t*0.25);		//make increasingly transparent
				ctx.fillStyle = ai.color;
				ctx.fillRect(tp.x-tsize/2,tp.y-tsize/2,tsize,tsize)	//make increasingly small
			}
		}

	ctx.globalAlpha = 1.0;		//reset alpha just in case

	ctx.fillStyle = player.color
	ctx.fillRect(player.x-size/2,player.y-size/2,size,size)

	//draw a dark green square to represent the AI
	ctx.fillStyle = ai.color;
	ctx.fillRect(ai.x-ai.width/2,ai.y-ai.height/2,ai.width,ai.height);

	//draw ai target
	ctx.fillStyle = "#000";
	ctx.fillText("X", ai.target.x, ai.target.y);

	//draw dark screen
	if(darkScreen && gracePeriod){
		if(!paused)
			dt+=2;

		let delay = (pauseOnHit ? 10 : 20)

		// Create gradient (with modifier for pause effect)
		var grd = ctx.createRadialGradient(
		160,160,140+(dt < delay ? 0 : dt),
		160,160,200+(dt < delay ? 0 : dt));
		grd.addColorStop(0,"rgba(255, 255, 255, 0)");
		grd.addColorStop(1,"black");

		ctx.fillStyle = grd;
		ctx.fillRect(0,0,canvas.width,canvas.height);
	}

	//draw defense
	if (shieldU.active && shieldR.active) {
		drawShield(shieldUR.corners);
	}

	else if (shieldD.active && shieldR.active) {
		drawShield(shieldDR.corners);
	}

	else if (shieldD.active && shieldL.active) {
		drawShield(shieldDL.corners);
	}

	else if (shieldU.active && shieldL.active) {
		drawShield(shieldUL.corners);
	}

	else if (shieldU.active) {
		//console.log("defending up");
		ctx.beginPath();
		//ctx.moveTo(player.x - player.shieldSize / 2, player.y - player.size);
		//ctx.lineTo(player.x + player.shieldSize / 2, player.y - player.size);
		//ctx.rect(player.x - player.shieldSize / 2, player.y - player.size, player.shieldSize, 6);
		ctx.rect(shieldU.x - shieldU.width / 2, shieldU.y - shieldU.height / 2, shieldU.width, shieldU.height);
		shieldCollided(shieldU);
		ctx.stroke()
	}
	
	else if (shieldD.active) {
		//console.log("defending down");
		ctx.beginPath();
		// ctx.moveTo(player.x - player.shieldSize / 2, player.y + player.size);
		// ctx.lineTo(player.x + player.shieldSize / 2, player.y + player.size);
		ctx.rect(shieldD.x - shieldD.width / 2, shieldD.y, shieldD.width, shieldD.height);
		shieldCollided(shieldD);
		ctx.stroke()
	}

	else if (shieldR.active) {
		//console.log("defending right");
		ctx.beginPath();
		// ctx.moveTo(player.x + player.size, player.y - player.shieldSize / 2);
		// ctx.lineTo(player.x + player.size, player.y + player.shieldSize / 2);
		ctx.rect(shieldR.x, shieldR.y - shieldR.height / 2, shieldR.width, shieldR.height);
		shieldCollided(shieldR);
		ctx.stroke()
	}

	else if (shieldL.active) {
		//console.log("defending left");
		ctx.beginPath();
		// ctx.moveTo(player.x - player.size, player.y - player.shieldSize / 2);
		// ctx.lineTo(player.x - player.size, player.y + player.shieldSize / 2);
		ctx.rect(shieldL.x, shieldL.y - shieldL.height / 2, shieldL.width, shieldL.height);
		shieldCollided(shieldL);
		ctx.stroke()
	}

	ctx.restore();
}



//////////////   GAME LOOP FUNCTIONS   //////////////////

//game initialization function
function init(){

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

	//setup collisionMask for AI
	ai.collisionMask = createCollisionMask(ai);
	
	//setup collision mask for shields
	[shieldU.x, shieldU.y] = [player.x, (player.y - shieldU.buffer - shieldU.height / 2)];
	shieldU.collisionMask = createCollisionMask(shieldU);

	

	//test

	
	
	testMask.collisionMask = createCollisionMask(testMask);
	collisionResponse.clear();
	var ch = SAT.testPolygonPolygon(ai.collisionMask, testMask.collisionMask, collisionResponse);
	//console.log(ch);
	//console.log(ai.collisionMask.pos);
	


	[shieldR.x, shieldR.y] = [(player.x + shieldU.buffer), player.y];
	[shieldD.x, shieldD.y] = [player.x, (player.y + shieldU.buffer)];
	[shieldL.x, shieldL.y] = [(player.x - shieldU.buffer - shieldR.width), player.y];



	targetPlayer();


}

//changes some feature of the game to show juiciness
//add a new one for each feature
function changeFeature(feat){
	//console.log("changing " + feat);

	//demo
	if(feat == "color"){
		player.color = (player.color == "#f00" ? "#00f" : "#f00");
	}else if(feat == "speed"){
		player.speed = (player.speed == 3 ? 5 : 3);
	}else if(feat == "background"){
		backgroundColor = (backgroundColor == "#dedede" ? "#000" : "#dedede");
	}

	//actual
	else if(feat == "dash"){
		dash = !dash;
	}else if(feat == "pause"){
		pauseOnHit = !pauseOnHit;
	}else if(feat == "dark"){
		darkScreen = !darkScreen;
	}else if(feat == "camera"){
		camShake = !camShake;
	}else if(feat == "slomo"){
		
	}else if(feat == "trail"){
		draw_trail = !draw_trail;

		//reset trail 
		player.trail = [];	
		ai.trail = [];
	}
}

//changes all the values of the feature toggles from on/off
function changeChecks(selectType){
	let val = (selectType == "deselect" ? false : true);
	let checkboxes = document.getElementsByClassName("featTog");
	for(let c=0;c<checkboxes.length;c++){
		checkboxes[c].checked = val;
		changeFeature(checkboxes[c].id)
	}
}

//toggle ai movement
function togAI(c){
	ai.canMove = c;
}

//main game loop
function main(){
	requestAnimationFrame(main);
	canvas.focus();

	//panCamera();

	//test

	//uncomment this
	//console.log(ch);
	//console.log(ai.collisionMask.pos);

	render();

	curr = (new Date).getTime();
	if (curr < endTime) {
		doShake(shakeIntensity);
	}
	else {
		camera.x = 0;
		camera.y = 0;
	}
	pCtx.drawImage(canvas,camera.x,camera.y); // present canvas at x, and y

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
		if(keys[downKey] && (player.y+size/2) < canvas.height) {
			defendDown();
			facingDirection = "down";
		}
		if(keys[leftKey] && (player.x-size/2) > 0) {
			defendLeft();
			facingDirection = "left";
		}
		if(keys[rightKey] && (player.x+size/2) < canvas.width) {
			defendRight();
			facingDirection = "right";
		}

	//dash
	if(dash){
			if(keys[a_key] && facingDirection == "up" && (player.y-size/2) > 0) {
				player.y -= player.dashSpeed;
			}
			if(keys[a_key] && facingDirection == "down" && (player.y+size/2) < canvas.height) {
				player.y += player.dashSpeed;
			}
			if(keys[a_key] && facingDirection == "left" && (player.x-size/2) > 0) {
				player.x -= player.dashSpeed;
			}
			if(keys[a_key] && facingDirection == "right" && (player.x+size/2) < canvas.width) {
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
				ai.collisionMask.pos = new V(ai.x, ai.y);
				//console.log("ai pos: " + [ai.x, ai.y]);
				//console.log(ai.collisionMask.pos);

				collisionResponse.clear();
				var ch = SAT.testPolygonPolygon(ai.collisionMask, testMask.collisionMask, collisionResponse);

				//console.log(ch);
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
				// console.log("ai loc: " + [ai.x, ai.y]);
				//console.log("collision mask: " + ai.collisionMask.pos);
				// console.log("edges: " + ai.collisionMask.edges);
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


main();