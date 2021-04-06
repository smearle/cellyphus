//var displayText = function(str) {
function displayText(str) {
    Game.log_display.drawText(0, 6, str);
}

//var combatTextPlayer = function(str) {
function combatTextPlayer(str) {
    var empty = "                                                                                      "
    Game.log_combat.drawText(1, 6, empty);
    Game.log_combat.drawText(1, 6, str);
}

//var combatTextEnemy = function(str) {
function combatTextEnemy(str) {
    var empty = "                                                                                      "
    Game.log_combat.drawText(1, 7, empty);
    Game.log_combat.drawText(1, 7, str);
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
  if (Game.combatTarget == "None") {
      target_str = "Combat: " + Game.combatTarget.padStart(8, " ");
      Game.log_combat.drawText(0, 0, target_str);
  }
  else if (Game.combatTarget == "Barbarian") {
      target_str = "Combat: " + Game.combatTarget.padStart(10, " ") + "  " + Game.barbarian.getHealth() + "HP";
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