var objectiveList = {
	descriptions : [],
	completed : [],
	activation : []

}

//adds a new objective to the list (initially uncompleted)
function addObjective(descr,act){
	let i = objectiveList.descriptions.length;		//new index of entry

	//add to the objective object
	objectiveList.descriptions.push(descr);
	objectiveList.completed.push(false);
	objectiveList.activation.push(act);

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

//create new objectives for the game on start
function initializeObjectives(){
	addObjective("Walk around", function(){return player.moved;});
	addObjective("Change your name", function(){return changedName;});
	addObjective("Order a frog to build something", function(){return built_something;});
	addObjective("Kill a barbarian", function(){return deadBarbie;})
}



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
