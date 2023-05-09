import {userIsAuthenticated} from "./app.js";
import {
    Chessboard,
    COLOR,
    FEN,
    INPUT_EVENT_TYPE
} from "https://cdn.jsdelivr.net/npm/cm-chessboard@7/src/cm-chessboard/Chessboard.js";
import {getRoomData, connectCurrUserToRoom, listenForRoomUpdates, amIWhite} from "./api/rooms.js";
import {getProfileInfoByUid} from "./api/users.js";

let roomData = {};
const userNames = {};

async function updateUserNames() {
    if (typeof roomData["white"] === "string") {
        getProfileInfoByUid(roomData["white"]).then(async (profileInfo) => {
            userNames["white"] = profileInfo["name"];
            await updateGameField();
        })
    }
    if (typeof roomData["black"] === "string") {
        getProfileInfoByUid(roomData["black"]).then(async (profileInfo) => {
            userNames["black"] = profileInfo["name"];
            await updateGameField();
        })
    }
}

async function updateGameField() {
    if (amIWhite(roomData)) {
        document.getElementById("game-waiting-bottom-name").textContent =
            userNames["white"];
        document.getElementById("game-waiting-top-name").textContent =
            userNames["black"];
    }
    else {
        document.getElementById("game-waiting-bottom-name").textContent =
            userNames["black"];
        document.getElementById("game-waiting-top-name").textContent =
            userNames["white"];
    }
}

function playGame() {
    // alert("play game");
}

async function main() {
    if (!userIsAuthenticated()) {
        window.location.href = "login.html"
    }

    const props = {
        position: FEN.start,
        style: {
            cssClass: "green"
        }
    }
    const chessboard = new Chessboard(document.getElementById("chess-board"), props);
    chessboard.enableMoveInput((event) => {
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

    const gameLink = document.getElementById("game-link")
    gameLink.textContent = window.location.href

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const gameId = urlParams.get("game-id");

    console.log("connect to game room: " + gameId);

    roomData = await getRoomData(gameId);
    if (roomData == null) {
        window.location.replace("game-creation.html");
    }
    else {
        await updateUserNames();

        const connectResult = await connectCurrUserToRoom(gameId, roomData);
        // alert(connectResult);

        if (connectResult === "can_play") {
            playGame();
        }
        else {
            listenForRoomUpdates(gameId, (updatedRoomData) => {
                if (typeof updatedRoomData["white"] === "string" && typeof updatedRoomData["black"] === "string") {
                    playGame();
                }
            });
        }
    }
}

await main();