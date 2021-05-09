var objectiveList = {
	descriptions : [],
	completed : [],
	activation : [],
	rewards : [],
	hints : []

}

var ot = 0;

//adds a new objective to the list (initially uncompleted)
function addObjective(descr,act,reward, hintGif){
	let i = objectiveList.descriptions.length;		//new index of entry

	//placeholder dance gif
	if(hintGif == "imgs/tutorial/placeholder.gif")
		hintGif = "proto/img/frog_dance" + Math.floor(Math.random()*4) + ".gif";

	//add to the objective object
	objectiveList.descriptions.push(descr);
	objectiveList.completed.push(false);
	objectiveList.activation.push(act);
	objectiveList.rewards.push(reward);
	objectiveList.hints.push(hintGif);

	//add to the html div
	let table = document.getElementById("obj_table");
	let row = document.createElement("div");
	row.onmouseenter = function(){showTutorialGif(i);}
	row.onmouseleave = function(){hideTutorialGif();}
	row.classList.add("obj_row");

	let checkCell = document.createElement("div");
	checkCell.classList.add("obj_check");
	checkCell.id = "obj_" + i + "_check";
	checkCell.innerHTML = '&#x2610;';				//empty check mark
	row.appendChild(checkCell);

	let descCell = document.createElement("div");
	descCell.classList.add("obj_descr");
	descCell.innerHTML = descr;					//objective description
	row.appendChild(descCell);

	table.appendChild(row);

}

//calculate percentage completed
function objCompleted(){
	let c = 0;
	let l = objectiveList.completed;
	for(let o=0;o<l.length;o++){
		if(l[o])
			c++;
	}
	return Math.round((c/l.length)*100);
}

/// REWARDS

function meatReward(n){
	Game.player.meat += n;
	displayText("Gained [" + n + "] meat!");
}
function seedReward(n){
	Game.player.seeds += n;
	displayText("Gained [" + n + "] seeds!");
}
function woodReward(n){
	Game.player.wood += n;
	displayText("Gained [" + n + "] wood!");
}
function healthReward(f){
	Game.player.maxHealth *= (1+f);
	Game.player.health = Game.player.maxHealth;
	displayText("Gained [" + Math.round(f*100) + "] more maximum health!");
}

function enemyWin(){
	console.log("HERO OF THE ISLAND!");
	meatReward(100);
	healthReward(0.5);
	document.getElementById("player").getElementsByTagName("img")[0].src = (grassLand20 ? "imgs/player_super_king.png" : "imgs/player_barb_king.png");
	document.getElementById("player").getElementsByClassName("charName")[0].style.color = (grassLand20 ? "#910FAB" : "#E32608");
}

function islandWin(){
	console.log("SAVIOR OF THE ISLAND");
	seedReward(100);
	woodReward(50);
	healthReward(0.5);
	document.getElementById("player").getElementsByTagName("img")[0].src = (Game.king_barbarian == null ? "imgs/player_super_king.png" : "imgs/player_grass_king.png");
	document.getElementById("player").getElementsByClassName("charName")[0].style.color = (Game.king_barbarian == null ? "#910FAB" : "#29AB0F");
}

//create new objectives for the game on start
function initializeObjectives(){
	objectiveList = {
		descriptions : [],
		completed : [],
		activation : [],
		rewards : [],
		hints : []

	}
	document.getElementById("obj_table").innerHTML = "";

	addObjective("Change your name", function(){return changedName;}, function(){healthReward(0.05)}, "imgs/tutorial/change_name.gif");
	addObjective("Walk around", function(){return player.moved;}, function(){seedReward(20)}, "imgs/tutorial/walk_around.gif");
	addObjective("Eat grass", function(){return ateGrass;}, function(){seedReward(20)}, "imgs/tutorial/eat_grass.gif");
	addObjective("Drink water", function(){return drankWater;}, function(){seedReward(10)}, "imgs/tutorial/drink_water.gif");
	addObjective("Plant Seeds", function(){return plantedSeeds;}, function(){woodReward(10)}, "imgs/tutorial/plant_seeds.gif");
	addObjective("Order a frog to build something", function(){return built_something;}, function(){woodReward(20)},"imgs/tutorial/order_build.gif");
	addObjective("Build a house", function(){return false;}, function(){woodReward(25)},"imgs/tutorial/build_house.gif");
	addObjective("Start a fire", function(){return setFire;}, function(){seedReward(20)},"imgs/tutorial/fire.gif");
	addObjective("Create a new frog minion", function(){return spawnedFrog;}, function(){meatReward(7)},"imgs/tutorial/minion.gif");
	addObjective("Survive 3 days", function(){return Game.days >= 3;}, function(){healthReward(0.2)},"imgs/tutorial/3days.gif");
	addObjective("Have 3 frogs", function(){return Game.frog_manager.frogs.length >= 3;}, function(){healthReward(0.2)},"imgs/tutorial/3frogs.gif");
	addObjective("Kill a barbarian", function(){return deadBarbie;}, function(){healthReward(0.2)},"imgs/tutorial/kill_barb.gif");
	addObjective("Enter the barbarian base", function(){return playerInBase;}, function(){meatReward(10)},"imgs/tutorial/enter_base.gif");
	addObjective("Kill the king barbarian", function(){return Game.king_barbarian == null;}, function(){enemyWin()},"imgs/tutorial/kill_king.gif"); 
	addObjective("Cover 20% of the map with foliage", function(){return grassLand20;}, function(){islandWin()},"imgs/tutorial/grass20.gif");
}



//set whether the objectives are active or not for the div
function setObjsDiv(){

	//check if any new ones are active
	let act_objs = objectiveList.activation;
	for(let a=0;a<act_objs.length;a++){
		if(!objectiveList.completed[a]){
			let outcome = act_objs[a]()

			//give reward if completed objective
			if(outcome){
				objectiveList.rewards[a]();
			}
			objectiveList.completed[a] = outcome;
		}
	}
	
	//update inner html of divs
	let objs = objectiveList.completed;
	for(let o=0;o<objs.length;o++){
		document.getElementById("obj_"+o+"_check").innerHTML = (objs[o] ? '&#x2611;' : '&#x2610;');
	}
}

//show tutorial gif for the specific objective
function showTutorialGif(i){
	if(ot == 0){
		ot = setTimeout(function(){document.getElementById("tutGif").src = objectiveList.hints[i];},2000);
	}	
}

//default gif
function hideTutorialGif(){
	document.getElementById("tutGif").src = "imgs/tutorial/tutFrog.png";
	clearTimeout(ot);
	ot = 0;
}
