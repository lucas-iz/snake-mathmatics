// Max amount of players.
const MAX_PLAYER = 1;

const express = require('express');

const webserver = express()
 .use((req, res) =>
   res.sendFile('/server-communication-log.html', { root: "../" })
 )
 .listen(3000, () => console.log(`Listening on ${3000}`));

const { WebSocketServer } = require('ws');

const sockserver = new WebSocketServer({ port: 443 });

sockserver.on('connection', ws => {
 console.log('New client connected!');

 ws.send('connection established');

 ws.on('close', () => {
  console.log('Client has disconnected!');
  removePlayer();
 });

 ws.on('message', data => {
    // Anwort an den alle Clienten
    /*
      sockserver.clients.forEach(client => {
        console.log(`distributing message: ${data}`);
        client.send(`${data}`);
      });
    */

    // Antwort an den Absender
    /*
      ws.send(`Hier sind die Ergebnisse zu ID: ${id}`);
    */
   
   const inputList = data.toString().split(" ");
   const input_function = inputList[0];

   console.log("Called: " + input_function);
   if(inputList.length > 1) console.log(`with ${inputList[1]}`);

   let input_argument;
  switch (input_function) {
    case "getLevel":
      ws.send(level);
      break;
    case "getSpeed":
      ws.send(speed);
      break;
    case "getAufgabe":
      ws.send(aufgabe);
      break;
    case "getPlayer":
      ws.send(player);
      break;
    case "updateData":
      updateData();
      break;
    case "increaseLevel":
      increaseLevel();
      break;
    case "updateSpeed":
      input_argument = inputList[1];
      updateSpeed(input_argument);
      break;
    case "countPlayer":
      ws.send(countPlayer());
      break;
    case "addPlayer":
      input_argument = inputList[1];
      addPlayer(JSON.parse(input_argument));
      break;
    case "":
    /*
    default:
      console.log(`distributing message: ${data}`);
      sockserver.clients.forEach(client => {
        client.send(data);
      });
      break;
    */
  }

 })

 ws.onerror = function () {
   console.log('websocket error');
 }
});

/********** VARIABLES **********/
let player = []
let level = 1;
let speed = 2;
let aufgabe = "0 + 0";

/********** FUNCTIONS **********/
function updateData() {
  sockserver.clients.forEach(client => {
    const data = {
      player: player,
      level: level,
      speed: speed,
      aufgabe: aufgabe
    };
    client.send(JSON.stringify(data));
  });
}

function increaseLevel() {
  level++;
  updateData();
}

function updateSpeed(givenSpeed) {
  speed = givenSpeed;
  updateData();
}

function updateAufgabe(givenAufgabe) {
  aufgabe = givenAufgabe;
  updateData();
}

function updatePoints(playerName, points) {
  player.forEach(p => {
    if(p.name == playerName) {
      p.points = points;
    }
  });
  updateData();
}

function updateLives(playerName, lives) {
  player.forEach(p => {
    if(p.name == playerName) {
      p.lives = lives;
    }
  });
  updateData();
}

function updateDirection(playerName, dir) {
  player.forEach(p => {
    if(p.name == playerName) {
      p.last_direction = dir;
    }
  });
  updateData();
}

function updatePosition(playerName, positionList) {
  player.forEach(p => {
    if(p.name == playerName) {
      p.position = [];
      
      positionList.forEach(pos => {
        p.position.push({x: pos.x, y: pos.y});
      });
    }
  });
  updateData();
}

function countPlayer() {
  return player.length;
}

function addPlayer(new_player) {
  if(player.length < MAX_PLAYER) {
    player.push(new_player);
    updateData();
  }
  else {
    console.log(`Already ${MAX_PLAYER} users logged in`);
  }
}

function removePlayer() {
  player.pop();
  if(player.length == 0) {
    resetData();
  }
  updateData();
}

// !No updateData called!
function resetData() {
  level = 1;
  speed = 2;
  aufgabe = "0 + 0";
}