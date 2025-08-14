import { addToBestenliste, getBestenliste, clearBestenliste } from './call-storage.js';
// import { sendMessage as server_sendMessage } from './connect.js';
import { 
   generateAdditions,
   generateSubtractions,
   generateMultiplications,
   generateDivisions,
   generateModulo,

   getRandomEquation,
   randomNumber,
   randomDouble
 } from './math.js';

/******** VARIABLES ********/

// Changing data
let points = 0;
let lives = 3;
let level = 1;
let snakeSpeed = 1 / 2; // 2 px pro Sekunde
let givenSpeed = getURLParameter("speed");
let username = "anonym-"+randomNumber(1000000);
let startWithPause = false;
let list_of_equations = generateAdditions(100);
let gameOver = false;

if(getURLParameter("name") != undefined) {
   username = getURLParameter("name");
   username = fixUmlaute(username);
}

// The snake faces this direction
let last_direction = "right";
let move_direction = "right";

// Color pixel that represent the snake
let active_pixels = [
   {x: 12, y: 10},
   {x: 11, y: 10},
   {x: 10, y: 10}
]

// Initial data - saved for reset
const init_active_pixels = [].concat(active_pixels);
const init_points = points;
const init_lives = lives;
const init_snakeSpeed = snakeSpeed;
const init_level = level;
const init_direction = last_direction;


// Create Grid-Elements
const grid_pixel_width = 20;
const grid_pixel_height = 20;
const grid_gap = 1;
const grid_pixel = 40;
const grid_width = grid_pixel_width * grid_pixel + (grid_pixel_width - 1) * grid_gap;
const grid_height = grid_pixel_height * grid_pixel + (grid_pixel_height - 1) * grid_gap;

// Adjustable variables
let number_of_possible_solutions = 5;
const showAhead = false;
const three = 3;
let autoInterval;
const timeOutInSeconds = 3; // Little timeout at the begin of the game.

const grid = document.getElementById("grid");
grid.style.width = grid_width + "px";
grid.style.height = grid_height + "px";
grid.style.gap = grid_gap + "px";

// Get equation to solve
let received_equation = getRandomEquation(list_of_equations);
// Extract equation from received equation
let equation = received_equation.equation;
// Extract solution from received equation
let solution = received_equation.solution;
// Calculate highest possible solution (for equations with two numbers)
let maxSolutionValue = received_equation.maxSolution;

// Address Pop-up window
const popup = document.getElementById("popup-gameover");
// Address button
const button = document.getElementById("button_pause");

initGame();

/******** FUNCTIONS ********/

function initGame() {
   // Get data from server
   // server_setData();

   // Set speed if not given
   if(givenSpeed == undefined) {
      givenSpeed = 2;
   }

   // Set amount of possible solutions depending on level
   setAmountOfSolutions();

   // Add Keyboard-Listener
   document.addEventListener("keydown", keyPressed);
   document.getElementById("button_pause").addEventListener("click", start_pause);
   document.getElementsByClassName("close")[0].addEventListener("click", () => window.open("auswahl.html", "_self"));
   document.getElementsByClassName("close")[1].addEventListener("click", resetGame);

   createBoard();
   drawSnake();
   equation_and_solution();

   // Display saved data
   updateData();

   // clearBestenliste();
   updateScoringBoard();

   // Little timeout at the begin of the game.
   setTimeout(() => {
      setSpeed(givenSpeed);
      button.innerHTML = "Pause";
      // console.log("Start game!");
   }, timeOutInSeconds * 1000, givenSpeed);

   // Setup data on server
   // server_addUser(); 
}

// Set amount of possible solutions depending on level
function setAmountOfSolutions() {
   if(getDifficulty() == "leicht") {
      number_of_possible_solutions = 5;
   }
   if(getDifficulty() == "mittel") {
      number_of_possible_solutions = 10;
   }
   if(getDifficulty() == "schwer") {
      number_of_possible_solutions = 15;
   }
}

// Converts givenSpeed to "leicht", "mittel", "schwer"
function getDifficulty() {
   if(givenSpeed == 2) {
      return "leicht";
   }
   if(givenSpeed == 5) {
      return "mittel";
   }
   if(givenSpeed == 10) {
      return "schwer";
   }
}

// Get parameter from URL
function getURLParameter(sParam) {
   var sPageURL = window.location.search.substring(1);
   var sURLVariables = sPageURL.split('&');
   for (var i = 0; i < sURLVariables.length; i++) {
       var sParameterName = sURLVariables[i].split('=');
       if (sParameterName[0] == sParam) {
           return sParameterName[1];
       }
   }
}

// Create pixel for new board and returns it
function createNewPixel(x,y) {
   const square = document.createElement("div");
   square.classList.add("grid_pixels");
   square.id = "grid_pixel_"+x+"_"+y;
   square.style.width = grid_pixel + "px";
   square.style.height = grid_pixel + "px";
   return square;
}

// Create new board with new pixels
function createBoard() {
   for(let y = 0; y < grid_pixel_height; y++) {
      for(let x = 0; x < grid_pixel_width; x++) {
         const a_new_pixel = createNewPixel(x,y);
         grid.appendChild(a_new_pixel);
      }
   }
}

// Equation and possible solutions get displayed
function equation_and_solution() {
   // Clears board
   removeNumbersFromBoard();

   // Set values
   equation = received_equation.equation;
   solution = received_equation.solution;
   maxSolutionValue = received_equation.maxSolution;

   // Select equation to solve
   const div_equation = document.getElementById("equation");
   div_equation.innerHTML = equation.replaceAll(" ", "");
   
   // Generate possible solutions
   const solution_and_random_numbers = [solution];
   for(let i = 0; i < number_of_possible_solutions-1; i++) {
      let number;
      if(equation.includes("/")) {
         number = randomDouble(maxSolutionValue).toFixed(1);
      }
      else {
         number = randomNumber(maxSolutionValue);
      }
      solution_and_random_numbers.push(number);
   }
   
   // Add solution and other random numbers to grid
   const list_length = solution_and_random_numbers.length;
   for(let i = 0; i < list_length; i++) {
      let randomX = randomNumber(grid_pixel_width) - 1;
      let randomY = randomNumber(grid_pixel_height) - 1;

      // Checks if randomIndex is on snake or within 3 fields before
      while(checkIfOccupiedOrOnSnakeOr3Before(randomX, randomY)) {
         // recalc randomIndex and check again
         randomX = randomNumber(grid_pixel_width) - 1;
         randomY = randomNumber(grid_pixel_height) - 1;
      }
      
      let randomIndex = getIndex(randomX,randomY);
      grid.children[randomIndex].innerHTML = solution_and_random_numbers.pop();
   }

}

// Checks if randomIndex is on snake or within 3 fields before
function checkIfOccupiedOrOnSnakeOr3Before(x,y) {
   // console.log("Check " + x + " " + y);

   let recalc = false;

   const index = getIndex(x,y);

   // Only continue if field doesn't already have a number
   if(grid.children[index].innerHTML == "") {
      // if X and Y is within active_pixels
      for(let i=0; i<active_pixels.length; i++) {
         const activeX = active_pixels[i].x;
         const activeY = active_pixels[i].y;
         const XYonSnake = (x == activeX && y == activeY);
         if(XYonSnake) {
            console.log(`Potential X/Y: ${x}/${y}`);
            console.log(`On snake at: ${activeX}/${activeY}`);
            console.log("New solution on snake: Recalculating...");
            recalc = true;
            break;
         }
      }
      
      // if X and Y is within 3 fields in front of snake
      if(checkIf3Before(x,y)) {
         console.log("New solution within 3 before: Recalculating...");
         recalc = true;
      }
   }
   else {
      console.log(`Occupied X/Y: ${x}/${y}`);
      console.log("New solution is already occupied: Recalculating...");
      recalc = true;
   }

   return recalc;
}

function checkIf3Before(x,y) {
   const head = getSnakeHead();

   let difference;

   switch(last_direction) {
      case "right":
         difference = x - head.x;
         if(y == head.y && difference <= three && difference > 0){
            return true;
         }
         break;
      case "left":
         difference = head.x - x;
         if(y == head.y && difference <= three && difference > 0){
            return true;
         }
         break;
      case "down":
         difference = y - head.y;
         if(x == head.x && difference <= three && difference > 0){
            return true;
         }
         break;
      case "up":
         difference = head.y - y;
         if(x == head.x && difference <= three && difference > 0){
            return true;
         }
         break;
   }

   return false;
}

// (Re-)Draw Snake
function drawSnake() {
   if(!gameOver) {
      // Clear board
      for(let i = 0; i < grid.children.length; i++) {
         grid.children[i].classList.remove("active");
         grid.children[i].classList.remove("head");
         grid.children[i].classList.remove("tail");
      }

      // Add Snake body
      for(let j = 1; j < active_pixels.length - 1; j++) {
         const active_position = getIndex(active_pixels[j].x, active_pixels[j].y);
         grid.children[active_position].classList.add("active");
      }

      // Make snake head distinctable
      const headX = active_pixels[0].x;
      const headY = active_pixels[0].y;
      const headIndex = getIndex(headX, headY);
      grid.children[headIndex].classList.remove("active");
      grid.children[headIndex].classList.add("head");

      // Make snake tail distinctable
      const tailX = active_pixels[active_pixels.length-1].x;
      const tailY = active_pixels[active_pixels.length-1].y;
      const tailIndex = getIndex(tailX, tailY);
      grid.children[tailIndex].classList.remove("active");
      grid.children[tailIndex].classList.add("tail");
   }  
}

function keyPressed(event) {
   const key = event.key;

   /*
   if(event.code == "Space") {
      start_pause();
      if(gameOver) {
         console.log("Reset with space");
         resetGame();
      }
      else {
         start_pause();
      }
   }
   */

   if(!gameOver) {
      /*
      if(key == " ") {
         start_pause();
      }
      */

      // Know which pixel to address
      // Shouldn't this be the head? => p=0
      const p = active_pixels.length - 1;

      switch(key) {
         case "ArrowLeft":
         case "a":
            // Extra points for speeding
            if(last_direction == "left") event_extraPointsForSpeeding();

            // Stop 180deg turn
            if(last_direction == "right") {
               console.log("No Left");
               break;
            }

            // Only move snake if not out of field
            if(active_pixels[p].x > 0) {
               move_direction = "left";
               moveSnake();
               last_direction = "left";
            }
            
            break;

         case "ArrowRight":
         case "d":
            // Extra points for speeding
            if(last_direction == "right") event_extraPointsForSpeeding();

            // Stop 180deg turn
            if(last_direction == "left") {
               console.log("No Right");
               break;
            }

            // Only move snake if not out of field
            if(active_pixels[p].x < grid_pixel_width - 1) {
               move_direction = "right";
               moveSnake();
               last_direction = "right";
            }
            
            break;
         
         case "ArrowUp":
         case "w":
            // Extra points for speeding
            if(last_direction == "up") event_extraPointsForSpeeding();

            // Stop 180deg turn
            if(last_direction == "down") {
               console.log("No Up");
               break;
            }

            // Only move snake if not out of field
            if(active_pixels[p].y > 0) {
               move_direction = "up";
               moveSnake();
               last_direction = "up";
            }
            
            break;

         case "ArrowDown":
         case "s":
            // Extra points for speeding
            if(last_direction == "down") event_extraPointsForSpeeding();

            // Stop 180deg turn
            if(last_direction == "up") {
               console.log("No Down");
               break;
            }

            // Only move snake if not out of field
            if(active_pixels[p].y < grid_pixel_width - 1) {
               move_direction = "down";
               moveSnake("down");
               last_direction = "down";
            }

            break;
      } 

      /*
      if(document.getElementById("button_pause").innerHTML != "Paused") {
         clearInterval(autoInterval);
         autoInterval = setInterval(moveSnake, snakeSpeed * 1000);
      }
      */
   }
   
}

function start_pause() {
   if(startWithPause) {
      startWithPause = false;
      button.innerHTML = "Pause";
      setSpeed(givenSpeed);
      console.log("Start game!");
   }
   else {
      if(button.innerHTML == "Pause") {
         clearInterval(autoInterval);
         button.innerHTML = "Paused"; 
         console.log("Paused game!");
      }
      else if(button.innerHTML == "Paused") {
         setSpeed(givenSpeed);
         button.innerHTML = "Pause"; 
         console.log("Continue...");
      }
   }
}

function moveSnake() {
   const direction = move_direction;

   const old_head_X = getSnakeHead().x;
   const old_head_Y = getSnakeHead().y;

   let newX = old_head_X;
   let newY = old_head_Y;
   if(direction == "left") newX--;
   else if(direction == "right") newX++;
   else if(direction == "up") newY--;
   else newY++;
   
   // Stops interval, if snake reaches border -> Game Over
   if(newX < 0 || newX >= grid_pixel_width || 
      newY < 0 || newY >= grid_pixel_height) {
         event_outOfBounds();
      }
   // Snake touches itself
   else if(contains(active_pixels, newX, newY)) {
      console.log(last_direction);
      event_preventTouchingOneself();
   }
   // Snake may move
   else {
      active_pixels.unshift({x: newX, y: newY}); // adds element to beginning of array
      active_pixels.pop();

      // Add to snake if result selected
      const new_position = newY*grid_pixel_width+newX;
      const new_text = grid.children[new_position];
      if(new_text.innerHTML != "") {
         if(new_text.innerHTML == solution) {
            // next equation
            received_equation = getRandomEquation(list_of_equations);

            equation_and_solution();
            new_text.innerHTML = "";
            
            event_correctSolution();
         }
         else {
            event_wrongSolution();
         }
      }
   }

   // Show preview of fields ahead
   if(showAhead) showFieldsAhead(three, getSnakeHead(), direction);

   drawSnake();
}

// Make the snake move automatically.
function setSpeed(speed) {
   givenSpeed = speed;
   updateSpeed();
}

function updateSpeed() {
   snakeSpeed = 1 / givenSpeed;

   if(!startWithPause) {
      autoInterval = setInterval(moveSnake, snakeSpeed * 1000);
   }
}

// Add an element to tail of snake
function addToTail() {

   const last_x = active_pixels[0].x;
   const last_y = active_pixels[0].y;
   const before_last_x = active_pixels[1].x;
   const before_last_y = active_pixels[1].y;

   let dir = "";
   if(last_x == before_last_x) {
      if(last_y < before_last_y) dir = "up";
      else if(last_y > before_last_y) dir = "down";
   }
   else if(last_y == before_last_y) {
      if(last_x < before_last_x) dir = "left";
      else if(last_x > before_last_x) dir = "right";
   }

   
   let new_last_x = last_x;
   let new_last_y = last_y;
   
   if(dir == "left") new_last_x++;
   else if(dir == "right") new_last_x--;
   else if(dir == "up") new_last_y++;
   else if(dir == "down") new_last_y--;
   
   active_pixels.push({x: new_last_x, y: new_last_y});
}

function removeNumbersFromBoard() {
   for(let y = 0; y < grid_pixel_height; y++) {
      for(let x = 0; x < grid_pixel_width; x++) {
         const elem = document.getElementById(`grid_pixel_${x}_${y}`);
         elem.innerHTML = "";
      }
   }
}

// Return true, if x/y is in the activePixel array
function contains(mapArray, x, y) {
   for(let i=0; i<mapArray.length; i++) {
      const entry = mapArray[i];
      if(entry.x == x && entry.y == y) {
         return true;
      }
   }
   return false;
}

function getSnakeHead() {
   return active_pixels[0];
}

function getIndex(x,y) {
   return y * grid_pixel_width + x;
}

function showFieldsAhead(num, head, dir) {
   // Clear all previous fields from preview
   for(let y = 0; y < grid_pixel_height; y++) {
      for(let x = 0; x < grid_pixel_width; x++) {
         document.getElementById(`grid_pixel_${x}_${y}`).classList.remove("preview");
      }
   }
   

   const previewPixel = [];

   switch(dir) {
      case "right":
         for(let i = 1; i <= num; i++) {
            const newX = head.x + i;
            if(newX < grid_pixel_width) {
               previewPixel.push({x: newX, y: head.y});
            }
         }
         break;
      case "left":
         for(let i = 1; i <= num; i++) {
            const newX = head.x - i;
            if(newX >= 0) {
               previewPixel.push({x: newX, y: head.y});
            }
         }
         break;
      case "down":
         for(let i = 1; i <= num; i++) {
            const newY = head.y + i;
            if(newY < grid_pixel_height) {
               previewPixel.push({x: head.x, y: newY});
            }
         }
         break;
      case "up":
         for(let i = 1; i <= num; i++) {
            const newY = head.y - i;
            if(newY >= 0) {
               previewPixel.push({x: head.x, y: newY});
            }
         }
         break;
   }


   let pixelElement;
   for(let i=0; i<previewPixel.length; i++) {
      pixelElement = document.getElementById(`grid_pixel_${previewPixel[i].x}_${previewPixel[i].y}`);
      pixelElement.classList.add("preview");
   }
}

function updateData() {
   // Display data;
   let livesString = "";
   for(let i=0; i<lives; i++) {
      livesString += "&#9829;";
   }
   document.getElementById("points").innerHTML = points;
   document.getElementById("lives").innerHTML = livesString;
   document.getElementById("level").innerHTML = level;
   document.getElementById("speed").innerHTML = givenSpeed;
   document.getElementById("username").innerHTML = username;

   if(lives <= 0) {
      console.log("You ran out of lives.");
      event_gameOver();
      return;
   }

   if(points > level * 100) {
      increaseLevel();
   }

   // Set amount of possible solutions depending on level
   setAmountOfSolutions();
}

function addPoints(pointsToAdd) {
   points += pointsToAdd;
   updateData();
}

function subtractPoints(pointsToSubtract) {
   points -= pointsToSubtract;
   if(points < 0) points = 0;
   updateData();
}

function subtractLives() {
   lives--;
   updateData();
}

function increaseLevel() {
   const max_level = 5;
   if(level <= max_level) {
      const newLevel = ++level;
      if(newLevel == 2) {
         list_of_equations = list_of_equations.concat(generateSubtractions(100));
      }
      if(newLevel == 3) {
         list_of_equations = list_of_equations.concat(generateMultiplications(100));
      }
      if(newLevel == 4) {
         list_of_equations = list_of_equations.concat(generateDivisions(100));
      }
      if(newLevel == 5) {
         list_of_equations = list_of_equations.concat(generateModulo(100));
      }
      
      updateData();
   }
}

function resetSnake() {
   while(active_pixels.length > 3) {
      active_pixels.pop();
   }
}

function resetGame() {
   // Reset variables
   gameOver = false;
   startWithPause = false;
   last_direction = init_direction;
   move_direction = init_direction;

   // Close game-over window
   popup.style.display = "none"

   // Reset snake
   active_pixels = [].concat(init_active_pixels);
   drawSnake();
   
   // Reset points, etc.
   points = init_points;
   lives = init_lives;
   level = init_level;
   snakeSpeed = init_snakeSpeed;
   updateData();

   // Reset Math
   received_equation = getRandomEquation(list_of_equations);
   equation_and_solution();

   // Restart Motion - Little timeout at the begin of the game.
   setTimeout(() => {
      setSpeed(givenSpeed);
      button.innerHTML = "Pause";
   }, timeOutInSeconds * 1000, givenSpeed);

   // Reset UI
   /*
   startWithPause = true;
   document.getElementById("button_pause").innerHTML = "Start";
   */
}

function clearScoreTable() {
   const table = document.getElementById("score-table");

   // Clear score list
   while (table.lastChild) {
      table.removeChild(table.lastChild);
   }

   // Add header-row back
   const tr = document.createElement("tr");
   const th_name = document.createElement("th");
   const th_points = document.createElement("th");
   const th_agent = document.createElement("th");
   th_name.innerHTML = "Name";
   th_points.innerHTML = "Points";
   th_agent.innerHTML = "Agent";
   tr.appendChild(th_name);
   tr.appendChild(th_points);
   // tr.appendChild(th_agent);
   table.appendChild(tr);
}

function updateScoringBoard() {
   let liste = getBestenliste();

   // Sort score-list by points descending
   liste.sort((a,b) => parseInt(b.points) - parseInt(a.points));

   let namesToKeepInList = [];

   // Filter duplicate names
   liste = liste.filter((object) => {
      if(namesToKeepInList.includes(object.name)) {
         return false;
      }
      else {
         namesToKeepInList.push(object.name);
         return true;
      }
   });

   const table = document.getElementById("score-table");

   // Clear score table
   clearScoreTable();
   
   for(let i=0; i<liste.length; i++) {
      if(i >= 10) break; // Only shows the top 10 results.

      const new_tr = document.createElement("tr");
      const col_name = document.createElement("td");
      col_name.innerHTML = liste[i].name;
      const col_points = document.createElement("td");
      col_points.innerHTML = liste[i].points;
      const col_agent = document.createElement("td");
      col_agent.innerHTML = liste[i].agent;
      new_tr.appendChild(col_name);
      new_tr.appendChild(col_points);
      // new_tr.appendChild(col_agent);
      table.appendChild(new_tr);
   }

   highlightScoring();
}

function highlightScoring() {
   const rows = document.getElementById("score-table").childNodes;
   rows.forEach((row) => {
      const name = row.childNodes[0].innerHTML;
      const score = row.childNodes[1].innerHTML;
      if(name == username && score == points) {
         row.style.color = "red";
         row.style.backgroundColor = "rgb(237, 237, 237)";
      }
   });
}

function fixUmlaute(username) {
   return username
               .replaceAll("%27", "")
               .replaceAll("%20", " ")
               .replaceAll("%C3%B6", "ö")
               .replaceAll("%C3%A4", "ä")
               .replaceAll("%C3%BC", "ü")
               .replaceAll("%C3%9F", "ß")
               .replaceAll("%C3%96", "Ö")
               .replaceAll("%C3%84", "Ä")
               .replaceAll("%C3%9C", "Ü");
}

/********** EVENT FUNCTIONS **********/

// Snake eats the WRONG solution
function event_wrongSolution() {
   console.log("Oops - try again");

   const popup_wrongAnswer = document.getElementById("popup-wrongAnswer");
   const style = popup_wrongAnswer.style;
   
   start_pause();
   let blinkInterval = setInterval(() => {
      if(style.display == "none") style.display = "block"
      else style.display = "none";
   }, 150);

   setTimeout(() => {
      clearInterval(blinkInterval);
      style.display = "none";
      start_pause();
   }, 1000);
   
   // resetSnake();
   addToTail();
   addToTail(); // Add an extra tail-piece, as punishment
   subtractPoints(50);
   subtractLives();
}

// Snake eats the CORRECT solution
function event_correctSolution() {
   console.log("Correct :)");
   addToTail();
   addPoints(20);
}

// Snake left the field.
function event_outOfBounds() {
   event_gameOver();

   /*
   clearInterval(autoInterval); // Stop auto movement
   console.log("Ouch");
   subtractLives();
   */
}

// Extra points for speeding (Increase speed in traveling direction)
function event_extraPointsForSpeeding() {
   // Only add points in difficulty "schwer"
   if(getDifficulty() != "schwer") return;
      
   console.log("Speeding...");
   addPoints(1);
}

// Snake moves onto itself
function event_preventTouchingOneself() {
   event_gameOver();

   /*
   clearInterval(autoInterval); // Stop auto movement
   console.log("Oh - that's me");
   subtractLives();
   */
}

function event_gameOver() {
   // Set true to deactivate keyboard input
   gameOver = true;

   clearInterval(autoInterval);
   document.getElementById("lives").innerHTML = "YOU LOST";

   // Only add to bestenliste if more than zero points
   if(points != 0) {
      addToBestenliste(username, points, navigator.userAgent);
   }

   updateScoringBoard();

   // Show popup (gameover)
   popup.style.display = "block";
}

/********** SERVER FUNCTIONS **********/
function server_addUser() {
   const userData = {
      name: username,
      points: points,
      lives: lives,
      position: active_pixels,
      last_direction: last_direction
   };

   // Wenn Nutzer mehr als 0, dann position und lastdirection anpassen

   const jsonData = JSON.stringify(userData);
   
   server_sendMessage(`addPlayer ${jsonData}`);
}

function server_setData() {
   server_sendMessage("updateData");
}

export { 
   username,
   points,
   lives, 
   last_direction,
   active_pixels,
   
   level,
   givenSpeed as speed,
   getRandomEquation,
   list_of_equations
}