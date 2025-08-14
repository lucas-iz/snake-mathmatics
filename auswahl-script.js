import { getBestenliste, clearBestenliste } from './call-storage.js';

document.getElementById("f2").style.display = "none";

document.getElementById("submitbutton").addEventListener("click", submit);
updateScoringBoard()
formatPlayButton();

function formatPlayButton() {
    const spielenTitel = document.getElementById("spielenButton");
    const playButton = document.getElementById("submitbutton");
    const usernameInput = document.getElementById("username");
    const difficulty = document.getElementById("radioLabel");

    usernameInput.style.width = `${spielenTitel.clientWidth * 2}px`;
    playButton.style.width = `${spielenTitel.clientWidth}px`;
    playButton.style.height = `${difficulty.offsetHeight}px`;
}

function submit(){
    const difficulty = document.querySelector("input[type=radio]:checked");
    let value;
    if(difficulty){
         value = difficulty.value;
    }else{
        alert("SCHWIERIGKEIT WÄHLEN");
        return;
    }
    console.log(value);
    
    const username = document.getElementById("username").value;
    if(username == ""){
        open(`game.html?speed=${value}`, "_self");
    }
    else {
        open(`game.html?speed=${value}&name=${username}`, "_self");
    }

    console.log(username);

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
    tr.appendChild(th_agent);
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
       new_tr.appendChild(col_agent);
       table.appendChild(new_tr);
    }
 }