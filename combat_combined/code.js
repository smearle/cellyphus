var atkFrame=document.getElementById('atkFrame');

var defFrame=document.getElementById('defFrame');

swapCanvases();

/*document.getElementById("test").onclick=function(){
  swapCanvases();
};*/

function init(){
	console.log("init");
	localStorage.setItem("combatType", "atk");
}

function swapCanvases(){
  if(atkFrame.style.visibility=='visible'){
    atkFrame.style.visibility='hidden';
    defFrame.style.visibility='visible';
  }else{
    atkFrame.style.visibility='visible';
    defFrame.style.visibility='hidden';
  }
}

function showAtk(){
	//localStorage.setItem("combatType", "atk");
	atkFrame.style.visibility='visible';
  defFrame.style.visibility='hidden';
}

function showDef(){
	//localStorage.setItem("combatType", "def");
	atkFrame.style.visibility='hidden';
  defFrame.style.visibility='visible';
}

function showMinigame(){
	console.log("call num: " + num);
	num += 1;
	var combatState = localStorage.getItem("combatType"); 
	console.log(combatState + "1");
	if (combatState.localeCompare("atk")) {
		console.log(combatState + "2");
		showAtk();
	}
	else if (combatState.localeCompare("def")) {
		console.log(combatState + "2");
		showDef();
	}
}

var num = 0;

function main(){
	//requestAnimationFrame(main);
	//showMinigame();	
}
main();
var game = setInterval(showMinigame, 1000);
