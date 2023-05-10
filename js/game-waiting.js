import {userIsAuthenticated} from "./app.js";
import {
    Chessboard,
    COLOR,
    FEN,
    INPUT_EVENT_TYPE
} from "https://cdn.jsdelivr.net/npm/cm-chessboard@7/src/cm-chessboard/Chessboard.js";
import {Chess} from "https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.13.4/chess.js";
import {getRoomData, connectCurrUserToRoom, updateRoomData, listenForRoomUpdates, amIWhite} from "./api/rooms.js";
import {getProfileInfoByUid} from "./api/users.js";

let gameId = null;
let roomData = {};
const userNames = {};

async function updateUserNames(roomData) {
    if (typeof roomData["white"] === "string") {
        const profileInfo = await getProfileInfoByUid(roomData["white"]);
        userNames["white"] = profileInfo["name"];
    }
    if (typeof roomData["black"] === "string") {
        const profileInfo = await getProfileInfoByUid(roomData["black"]);
        userNames["black"] = profileInfo["name"];
    }
}

async function updateGameField(roomData) {
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
        await window.chessboard.setOrientation(COLOR.black, true);
    }
}

async function startGame(chessGame) {
    document.getElementById("game-link").style.display = "none";
    document.getElementById("game-cancel-button").style.display = "none";
    document.getElementById("game-draw-button").style.display = "inline-block";
    document.getElementById("game-resign-button").style.display = "inline-block";
    // alert("play game");

    window.chessboard.enableMoveInput((event) => {
        switch (event.type) {
            case INPUT_EVENT_TYPE.moveInputStarted:
                // return `true`, if input is accepted/valid, `false` aborts the interaction, the piece will not move
                return true
            case INPUT_EVENT_TYPE.validateMoveInput:
                // return true, if input is accepted/valid, `false` takes the move back
                // updateRoomData(gameId, {"position": window.chessboard.getPosition()});
                // try {
                //     chessGame.move({"from": event.squareFrom, "to": event.squareTo});
                //     updateRoomData(gameId, {"position": chessGame.fen()});
                // }
                // catch (error) {
                //     return false;
                // }

                return true;
            case INPUT_EVENT_TYPE.moveInputCanceled:
                // console.log(`moveInputCanceled`)
                break;
        }
    }, amIWhite(roomData) ? COLOR.white : COLOR.black);
}

async function main() {
    const chessGame
        = new Chess();
    chessGame.move({"from": "e2", "to": "e4"});
    chessGame.move({"from": "e7", "to": "e5"});
    chessGame.move({"from": "g1", "to": "f3"});
    chessGame.move({"from": "b8", "to": "c6"});
    alert(chessGame.pgn());
    alert(chessGame.ascii());

    if (!userIsAuthenticated()) {
        window.location.href = "login.html"
    }

    const props = {
        position: FEN.start,
        style: {
            cssClass: "green"
        }
    }
    window.chessboard = new Chessboard(document.getElementById("chess-board"), props);

    const gameLink = document.getElementById("game-link")
    gameLink.textContent = window.location.href

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    gameId = urlParams.get("game-id");

    console.log("connect to game room: " + gameId);

    roomData = await getRoomData(gameId);
    if (roomData == null) {
        window.location.replace("game-creation.html");
    }
    else {
        document.getElementById("game-waiting-top-time-left").textContent =
            roomData["time-limit"];
        document.getElementById("game-waiting-bottom-time-left").textContent =
            roomData["time-limit"];

        listenForRoomUpdates(gameId, async (updatedRoomData) => {
            if (
                typeof updatedRoomData["white"] === "string" &&
                typeof updatedRoomData["black"] === "string"
            ) {
                if (roomData["position"] === updatedRoomData["position"]) {
                    await updateUserNames(updatedRoomData);
                    await updateGameField(updatedRoomData);
                    await window.chessboard.setPosition(chessGame.fen(), true);
                    // await window.chessboard.setPosition(updatedRoomData["position"], true);
                    // chessGame.setPosition()
                    await startGame(chessGame);
                }
                else {
                    // update only position
                    // chessGame = Chess(window.chessboard.getPosition());
                    await window.chessboard.setPosition(updatedRoomData["position"], true);
                }
                roomData = updatedRoomData;
            }
        });

        await connectCurrUserToRoom(gameId, roomData);
    }
}

await main();