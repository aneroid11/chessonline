import {userIsAuthenticated} from "./app.js";
import {
    Chessboard,
    COLOR,
    FEN,
    INPUT_EVENT_TYPE
} from "https://cdn.jsdelivr.net/npm/cm-chessboard@7/src/cm-chessboard/Chessboard.js";
import {getRoomData, connectCurrUserToRoom, listenForRoomUpdates} from "./api/rooms.js";

if (!userIsAuthenticated()) {
    window.location.href = "login.html"
}

const props = {
    position: FEN.start,
    style: {
        cssClass: "green"
    }
}
// const chessboard = new Chessboard(document.getElementById("chess-board"), props);
window.chessboard = new Chessboard(document.getElementById("chess-board"), props);
window.chessboard.enableMoveInput((event) => {
    switch (event.type) {
        case INPUT_EVENT_TYPE.moveInputStarted:
            // return `true`, if input is accepted/valid, `false` aborts the interaction, the piece will not move
            return true
        case INPUT_EVENT_TYPE.validateMoveInput:
            // return true, if input is accepted/valid, `false` takes the move back
            return true
        case INPUT_EVENT_TYPE.moveInputCanceled:
            // console.log(`moveInputCanceled`)
            break;
    }
});
// await chessboard.movePiece("e2", "e4", true);

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
    // alert(connectResult);

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

function playGame() {
    // alert("play game");
}
