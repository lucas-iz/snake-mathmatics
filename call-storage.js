// localStorage.setItem("bestenliste", "XYZ");
// localStorage.getItem("bestenliste");

const list_name = "bestenliste-i2";

// Init bestenliste
let bestenliste = getListFromStorage();


/********** FUNCTIONS **********/

function entryExists(name) {
   for(let i=0; i<bestenliste.length; i++) {
      if(bestenliste[i].name == name) {
         return {exists: true, id: i, points: bestenliste[i].points};
      }
   }
   return {exists: false};
}

function addToBestenliste(name, new_points, userAgent) {
   const entry = entryExists(name);
   if(entry.exists) {
      if(new_points > entry.points) {
         event_entryExistsAndNewPointsAreHigherThanExisting(entry, new_points, userAgent);
      }
      else event_entryExistsAndNewPointsAreLowerOrEqualThanExisting();
   }
   else {
      // Entry doesn't exist and is created
      const newEntry = {name: name, points: new_points, agent: userAgent};
      bestenliste.push(newEntry);
   }

   const list_string = JSON.stringify(bestenliste);
   localStorage.setItem(list_name, list_string);
}

function getBestenliste() {
   return getListFromStorage();
}

function clearBestenliste() {
   localStorage.removeItem(list_name);
}

function getListFromStorage() {
   const list_string = localStorage.getItem(list_name);
   let list_array;

   if (list_string == null) {
      list_array = [];
   }
   else {
      list_array = JSON.parse(list_string);
   }

   return list_array;
}

/********** EVENT FUNCTIONS **********/

function event_entryExistsAndNewPointsAreHigherThanExisting(entry, new_points, userAgent) {
   const entryID = entry.id;
   bestenliste[entryID].points = new_points;
   bestenliste[entryID].agent = userAgent;
}

function event_entryExistsAndNewPointsAreLowerOrEqualThanExisting() {
   // Does nothing at the moment
}



/********** EXPORT **********/
export { getBestenliste, addToBestenliste, clearBestenliste };