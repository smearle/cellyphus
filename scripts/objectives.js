var objectiveList = {
	descriptions : [],
	completed : [],
	activation : [],
	rewards : []

}

//adds a new objective to the list (initially uncompleted)
function addObjective(descr,act,reward){
	let i = objectiveList.descriptions.length;		//new index of entry

	//add to the objective object
	objectiveList.descriptions.push(descr);
	objectiveList.completed.push(false);
	objectiveList.activation.push(act);
	objectiveList.rewards.push(reward);

	//add to the html div
	let table = document.getElementById("obj_table");
	let row = document.createElement("div");
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

/// REWARDS

function meatReward(n){
	Game.player.meat += n;
}
function seedReward(n){
	Game.player.seeds += n;
}
function woodReward(n){
	Game.player.wood += n;
}
function healthReward(f){
	Game.player.maxHealth *= (1+f);
	Game.player.health = Game.player.maxHealth;
}

function enemyWin(){
	console.log("KING OF THE ISLAND!")
}

function islandWin(){
	console.log("GREEN THUMB!")
}

//create new objectives for the game on start
function initializeObjectives(){
	addObjective("Change your name", function(){return changedName;}, function(){healthReward(0.05)});
	addObjective("Walk around", function(){return player.moved;}, function(){seedReward(20)});
	addObjective("Eat grass", function(){return ateGrass;}, function(){seedReward(10)});
	addObjective("Drink water", function(){return drankWater;}, function(){seedReward(10)});
	addObjective("Plant Seeds", function(){return plantedSeeds;}, function(){woodReward(10)});
	addObjective("Order a frog to build something", function(){return built_something;}, function(){woodReward(20)});
	addObjective("Build a house", function(){return false;}, function(){woodReward(25)});
	addObjective("Start a fire", function(){return setFire;}, function(){seedReward(20)});
	addObjective("Survive 3 days", function(){return Game.days >= 3;}, function(){healthReward(0.2)});
	addObjective("Have 3 frogs", function(){return Game.frog_manager.frogs.length >= 3;}, function(){healthReward(0.2)});
	addObjective("Kill a barbarian", function(){return deadBarbie;}, function(){healthReward(0.2)});
	addObjective("Enter the barbarian base", function(){return playerInBase;}, function(){meatReward(5)});
	addObjective("Kill the king barbarian", function(){return Game.king_barbarian == null;}, function(){enemyWin()}); 
	addObjective("Cover the 25% of the map with foliage", function(){return false;}, function(){islandWin()});
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
