const SERVER_IP = "localhost"; // "192.168.178.69";

const webSocket = new WebSocket(`ws://${SERVER_IP}:443/`);

// Connects to server.
webSocket.addEventListener("open", () => {
  console.log("We are connected");
});

// Sends a message to server.
function sendMessage(dataToSend) {
  webSocket.send(dataToSend);
}

// When a message comes in from the server.
webSocket.onmessage = (event) => {
  const returnData = event.data;
  if (returnData == "connection established") {
    console.log(returnData);
  } else {
    const jsonData = JSON.parse(returnData);
    if (jsonData.player.length == 0) return;
    console.log(jsonData);

    jsonData.player.array.forEach((player) => {
      if (player.name == username) {
        // set variables
      }
    });
  }
};

export { sendMessage };
