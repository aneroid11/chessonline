import {userIsAuthenticated} from "./app.js";
import {Chessboard, COLOR, FEN} from "https://cdn.jsdelivr.net/npm/cm-chessboard@7/src/cm-chessboard/Chessboard.js";
import {getRoomData, connectCurrUserToRoom, listenForRoomUpdates} from "./api/rooms.js";

function playGame() {
    alert("play game");
}

if (!userIsAuthenticated()) {
    window.location.href = "login.html"
}

const props = {
    position: FEN.start,
    style: {
        cssClass: "green"
    }
}
new Chessboard(document.getElementById("chess-board"), props);

// const gameId = urlParams.get("game-id");
const gameLink = document.getElementById("game-link")
gameLink.textContent = window.location.href

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const gameId = urlParams.get("game-id");

console.log("connect to game room: " + gameId);

const roomData = await getRoomData(gameId);
if (roomData == null) {
    window.location.replace("game-creation.html");
}
else {
    const connectResult = await connectCurrUserToRoom(gameId, roomData);
    alert(connectResult);

    if (connectResult === "can_play") {
        playGame();
    }
    else {
        listenForRoomUpdates(gameId, (updatedRoomData) => {
            console.log(updatedRoomData["white"]);

            if (typeof updatedRoomData["white"] === "string" && typeof updatedRoomData["black"] === "string") {
                playGame();
            }
        });
    }
}

// const queryString = window.location.search
// const urlParams = new URLSearchParams(queryString)
//
// if (urlParams.has("time-limit")) {
//     // this is a game creation
//     const timeLimit = urlParams.get("time-limit")
//     const color = urlParams.get("color")
//
//     const newRoom = {
//         "timeLimit": timeLimit,
//         "color": color,
//         "firstPlayer": "Ibrahim",
//         "secondPlayer": null
//     }
//
//     console.log("push")
//     // wait for the promise
//     const roomRef = await push(app.gameRoomsRef, newRoom)
//     console.log("just after push")
//     window.location.replace(`game-waiting.html?game-id=${roomRef.key}`)
// }
// else if (urlParams.has("game-id")) {
//     // this is a connection to an existing game
//     const gameId = urlParams.get("game-id")
//     console.log("connect to game " + gameId)
//
//     const roomRef = child(app.gameRoomsRef, gameId)
//     get(roomRef).then((snapshot) => {
//         if (snapshot.exists()) {
//             const data = snapshot.val()
//
//             console.log(data)
//
//             const gameLink = document.getElementById("game-link")
//             gameLink.textContent = window.location.href
//         }
//         else {
//             window.location.replace("game-creation.html")
//         }
//     })
// }
// else {
//     window.location.replace("game-creation.html")
// }