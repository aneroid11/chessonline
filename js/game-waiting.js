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
let updateBoard = true;
let iAmWhite = null;
let timeLeftTop = 0;
let timeLeftBottom = 0;
let gameFinished = false;

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

async function finishGame(result) {
    await updateRoomData(gameId, {
        "result": result
    })
    gameFinished = true;
    // alert(result);
}

function showGameResult(result) {
    clearInterval(timer);

    console.log("clear interval");
    console.log(result + " won");
}

async function setupGame(chessGame) {
    document.getElementById("game-link").style.display = "none";
    document.getElementById("game-cancel-button").style.display = "none";
    document.getElementById("game-draw-button").style.display = "inline-block";
    document.getElementById("game-resign-button").style.display = "inline-block";

    window.chessboard.enableMoveInput((event) => {
        switch (event.type) {
            case INPUT_EVENT_TYPE.moveInputStarted:
                // return `true`, if input is accepted/valid, `false` aborts the interaction, the piece will not move
                return true
            case INPUT_EVENT_TYPE.validateMoveInput:
                // return true, if input is accepted/valid, `false` takes the move back

                const currTurn = chessGame.turn();
                // pawns are promoted to Queens only.
                const result = chessGame.move({"from": event.squareFrom, "to": event.squareTo, "promotion": "q"});
                if (result) {
                    updateBoard = false;
                    event.chessboard.setPosition(chessGame.fen());

                    const prevLastMove = roomData["last-move"];
                    const timeSpent = Math.floor(Date.now() / 1000) - prevLastMove;
                    const prevTimeLeftWhite = roomData["time-left-white"];
                    const prevTimeLeftBlack = roomData["time-left-black"];
                    let newTimeLeftWhite = prevTimeLeftWhite;
                    let newTimeLeftBlack = prevTimeLeftBlack;

                    if (currTurn === "w") {
                        newTimeLeftWhite -= timeSpent;
                    }
                    else {
                        newTimeLeftBlack -= timeSpent;
                    }
                    updateRoomData(
                        gameId,
                        {
                            "moves": chessGame.pgn(),
                            "last-move": Math.floor(Date.now() / 1000),
                            "time-left-white": newTimeLeftWhite,
                            "time-left-black": newTimeLeftBlack
                        }
                    );

                    if (chessGame.game_over()) {
                        if (chessGame.in_draw() || chessGame.in_stalemate() || chessGame.in_threefold_repetition()) {
                            finishGame("draw");
                        }
                        else {
                            if (chessGame.turn() === "w") {
                                finishGame("black");
                            }
                            else {
                                finishGame("white");
                            }
                        }

                    }

                    return true;
                }

                return false;
            case INPUT_EVENT_TYPE.moveInputCanceled:
                // console.log(`moveInputCanceled`)
                break;
        }
    }, amIWhite(roomData) ? COLOR.white : COLOR.black);

    if (roomData["game-start"] === undefined) {
        // start the game
        await updateRoomData(gameId, {
            "game-start": Math.floor(Date.now() / 1000),
            "last-move": Math.floor(Date.now() / 1000),
            "time-left-white": roomData["time-limit"] * 60,
            "time-left-black": roomData["time-limit"] * 60
        });
    }
}

function convertSecondsToMinutesSeconds(seconds) {
    return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60)}`;
}

function showTimeLeft() {
    document.getElementById("game-waiting-top-time-left").textContent =
        convertSecondsToMinutesSeconds(timeLeftTop);
    document.getElementById("game-waiting-bottom-time-left").textContent =
        convertSecondsToMinutesSeconds(timeLeftBottom);
}

function updateTimeLeft(updatedRoomData, chessGame) {
    if (updatedRoomData["game-start"] === undefined) {
        return;
    }

    const timeFromLastMove = Math.floor(Date.now() / 1000) - updatedRoomData["last-move"];
    const myColor = amIWhite(updatedRoomData) ? "w" : "b";
    // alert(myColor);

    if (myColor === "w") {
        timeLeftTop = updatedRoomData["time-left-black"];
        timeLeftBottom = updatedRoomData["time-left-white"];
    }
    else {
        timeLeftTop = updatedRoomData["time-left-white"];
        timeLeftBottom = updatedRoomData["time-left-black"];
    }

    // alert(chessGame.turn());

    if (chessGame.turn() === myColor) {
        timeLeftBottom -= timeFromLastMove;
    }
    else {
        timeLeftTop -= timeFromLastMove;
    }

    showTimeLeft();

    recreateTimer(chessGame, updatedRoomData);
}

let timer = null;
function recreateTimer(chessGame, roomData) {
    console.log(roomData["result"]);

    // alert("recreate timer");

    if (timer !== null) {
        clearInterval(timer);
    }

    timer = setInterval(timerFunc, 1000, chessGame, roomData);
}

function timerFunc(chessGame, roomData) {
    if (gameFinished) {
        return;
    }

    const myColor = amIWhite(roomData) ? "w" : "b";

    showTimeLeft();

    if (chessGame.turn() === myColor) {
        if (timeLeftBottom > 0) {
            timeLeftBottom--;
        }
    }
    else {
        if (timeLeftTop > 0) {
            timeLeftTop--;
        }
    }
}

async function main() {
    const chessGame
        = new Chess();

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
        iAmWhite = amIWhite(roomData);

        listenForRoomUpdates(gameId, async (updatedRoomData) => {
            if (
                typeof updatedRoomData["white"] === "string" &&
                typeof updatedRoomData["black"] === "string"
            ) {
                if (updatedRoomData["result"] !== undefined) {
                    showGameResult(updatedRoomData["result"]);
                }
                else {
                    console.log("new update");

                    if (roomData["moves"] === updatedRoomData["moves"]) {
                        // update everything, it was a page refresh.

                        await updateUserNames(updatedRoomData);
                        await updateGameField(updatedRoomData);
                        chessGame.load_pgn(roomData["moves"]);
                        updateTimeLeft(updatedRoomData, chessGame);
                        // await window.chessboard.setPosition(chessGame.fen(), true);
                        await window.chessboard.setPosition(chessGame.fen(), true);
                        await setupGame(chessGame);
                    }
                    else {
                        // update only position and time left

                        if (updateBoard) {
                            // it was not our move.

                            chessGame.load_pgn(updatedRoomData["moves"]);
                            await window.chessboard.setPosition(chessGame.fen(), true);
                            // await window.chessboard.setPosition(chessGame.fen());
                            updateTimeLeft(updatedRoomData, chessGame);
                        }
                        else {
                            updateBoard = true;
                        }
                        // await window.chessboard.setPosition(updatedRoomData["position"], true);
                    }
                    roomData = updatedRoomData;
                }
            }
        });

        await connectCurrUserToRoom(gameId, roomData);
    }
}

await main();