//set up the canvas
var title_canvas = document.getElementById("titleScreen");
var title_tx = title_canvas.getContext("2d");
title_canvas.width = 320;
title_canvas.height = 320;

//import sprites as necessary
var title_frogImg = new Image();
title_frogImg.src = "imgs/frog.png";

var title_grassImg = new Image();
title_grassImg.src = "imgs/shrub.png";

var title_map = [
[1,1,1,1,1,1,1,1,1,1],
[1,1,1,1,1,1,1,1,1,1],
[1,1,1,1,1,1,1,1,1,1],
[1,1,1,1,1,1,1,1,1,1],
[1,0,0,0,0,0,0,0,0,1],
[1,1,1,1,1,1,1,1,1,1],
[1,1,1,1,1,1,1,1,1,1],
[1,1,1,1,1,1,1,1,1,1],
[1,1,1,1,1,1,1,1,1,1],
[1,1,1,1,1,1,1,1,1,1],
[1,1,1,1,1,1,1,1,1,1]
]

var frogger = {x:4,y:1};
var frogger2 = {x:6,y:7};
var frogger3 = {x:3,y:7};
function drunk(frog){
	let r = Math.random();
	if(r < 0.1 && frog.x > 0 && title_map[frog.y][frog.x-1] == 1)
		frog.x -= 1
	else if(r < 0.2 && frog.x < 9 && title_map[frog.y][frog.x+1] == 1)
		frog.x += 1
	else if(r < 0.3 && frog.y > 0 && title_map[frog.y-1][frog.x] == 1)
		frog.y -= 1
	else if(r < 0.4 && frog.y < 9 && title_map[frog.y+1][frog.x] == 1)
		frog.y += 1

}


function drawTitle(){
	title_tx.clearRect(0,0,title_canvas.width,title_canvas.height);

	title_tx.fillStyle = "#132C1B";
	title_tx.fillRect(0,0,title_canvas.width,title_canvas.height);

	for(let a=0;a<title_map.length;a++){
		for(let b=0;b<title_map[0].length;b++){
			let t = title_map[a][b];
			if(t == 1 && Math.random()>0.7 && frogger.x != b && frogger.y != a && frogger2.x != b && frogger2.y != a && frogger3.x != b && frogger3.y != a){
				title_tx.drawImage(title_grassImg,0,0,32,32,b*32,a*32,32,32);
			}
		}
	}

	title_tx.drawImage(title_frogImg, 0,0,32,32,frogger.x*32,frogger.y*32,32,32)
	title_tx.drawImage(title_frogImg, 0,0,32,32,frogger2.x*32,frogger2.y*32,32,32)
	title_tx.drawImage(title_frogImg, 0,0,32,32,frogger3.x*32,frogger3.y*32,32,32)

	title_tx.font = "48px Dwarf";
	title_tx.fillStyle = "#1C901D";
	title_tx.textAlign = "center"
	title_tx.fillText("Cellyphus", title_canvas.width/2,title_canvas.height/2);
	
}

var ii = 0;
function startTitleAnim(){
	ii = setInterval(function(){drunk(frogger);drunk(frogger2);drunk(frogger3);drawTitle();},700);
}
function stopTitleAnim(){
	clearInterval(ii);
	ii= 0;
}