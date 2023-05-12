import {userIsAuthenticated} from "./app.js";
import {
    Chessboard,
    COLOR,
    FEN,
    INPUT_EVENT_TYPE
} from "https://cdn.jsdelivr.net/npm/cm-chessboard@7/src/cm-chessboard/Chessboard.js";
import {Chess} from "https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.13.4/chess.js";
import {
    getRoomData,
    connectCurrUserToRoom,
    updateRoomData,
    listenForRoomUpdates,
    amIWhite,
    getServerTime,
    setOnConnectAndDisconnect
} from "./api/rooms.js";
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
    if (typeof roomData["white"] === "string" && userNames["white"] === undefined) {
        const profileInfo = await getProfileInfoByUid(roomData["white"]);
        userNames["white"] = profileInfo["name"];
    }
    if (typeof roomData["black"] === "string"  && userNames["black"] === undefined) {
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

        if (window.chessboard.getOrientation() !== COLOR.black) {
            await window.chessboard.setOrientation(COLOR.black, true);
        }
    }
}

function formStatisticsString(result) {
    const myColor = iAmWhite ? "white" : "black";
    const oppColor = iAmWhite ? "black" : "white";
    const opponentName = userNames[oppColor];

    let statString = userNames[myColor] + " vs " + opponentName + "\n";
    statString += "Time limit: " + roomData["time-limit"] + " min\n";
    statString += userNames[myColor] + " played " + myColor + "\n";
    statString += userNames[oppColor] + " played " + oppColor + "\n";

    return statString;
}

async function finishGame(result) {
    await updateRoomData(gameId, {
        "result": result,
        "statistics-string": formStatisticsString(result)
    });
}

function showGameResult(result) {
    clearInterval(timer);

    console.log(result + " won");

    let msg = "";

    if (result === "black") {
        msg = "Black won!";
    }
    else if (result === "white") {
        msg = "White won!";
    }
    else {
        msg = "Draw!";
    }

    document.getElementById("game-waiting-top-time-left").textContent = "--:--"
    document.getElementById("game-waiting-bottom-time-left").textContent = "--:--"
    document.getElementById("game-message").textContent = msg;
    // document.getElementById("game-message").style.display = "block";
    document.getElementById("game-draw-button").style.display = "none";
    document.getElementById("game-resign-button").style.display = "none";
}

function moveHandler(chessGame, event) {
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

                const prevLastMove = Math.floor(roomData["last-move"] / 1000);
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
                const lastMoveTime = getServerTime();
                updateRoomData(
                    gameId,
                    {
                        "moves": chessGame.pgn(),
                        // "last-move": Math.floor(Date.now() / 1000),
                        "last-move": lastMoveTime,
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
}

function enableMoveInput(chessGame) {
    window.chessboard.enableMoveInput(
        moveHandler.bind(null, chessGame),
        amIWhite(roomData) ? COLOR.white : COLOR.black
    );
}

async function setupGame(chessGame, updatedRoomData) {
    document.getElementById("game-link").style.display = "none";
    document.getElementById("game-cancel-button").style.display = "none";
    document.getElementById("game-draw-button").style.display = "inline-block";
    document.getElementById("game-resign-button").style.display = "inline-block";

    enableMoveInput(chessGame);

    if (updatedRoomData["game-start"] === undefined) {
        // alert("roomData game-start === undefined. update room data");

        // while (!onRoomUpdateFinished) {}

        // start the game
        await updateRoomData(gameId, {
            "game-start": Math.floor(Date.now() / 1000),
            // "last-move": Math.floor(Date.now() / 1000),
            "last-move": Date.now(),
            "time-left-white": updatedRoomData["time-limit"] * 60,
            "time-left-black": updatedRoomData["time-limit"] * 60
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

    const timeFromLastMove = Math.floor(Date.now() / 1000) - Math.floor(updatedRoomData["last-move"] / 1000);
    const myColor = amIWhite(updatedRoomData) ? "w" : "b";

    if (myColor === "w") {
        timeLeftTop = updatedRoomData["time-left-black"];
        timeLeftBottom = updatedRoomData["time-left-white"];
    }
    else {
        timeLeftTop = updatedRoomData["time-left-white"];
        timeLeftBottom = updatedRoomData["time-left-black"];
    }

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
        if (timeLeftBottom < 1) {
            // opponent wins
            finishGame(myColor === "w" ? "black" : "white");
        }

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

async function onDrawButtonClicked(event) {
    event.preventDefault();

    const myColor = iAmWhite ? "w" : "b";

    if (roomData["offer-draw"] === undefined) {
        // we are offering a draw
        await updateRoomData(gameId, {
            "offer-draw": "offered",
            "draw-offerer": iAmWhite ? "w" : "b"
        })
    }
    else {
        if (roomData["offer-draw"] === "offered" && roomData["draw-offerer"] !== myColor) {
            await finishGame("draw");
        }
    }
}

const DISCONNECTED_MESSAGE = "You are disconnected and can't make moves!"
function onDisconnect() {
    if (roomData["game-start"] === undefined) {
        return;
    }

    const messageElem = document.getElementById("game-message");
    messageElem.textContent = DISCONNECTED_MESSAGE;
    window.chessboard.disableMoveInput();
}

function onConnect(chessGame) {
    if (roomData["game-start"] === undefined) {
        return;
    }

    const messageElem = document.getElementById("game-message");

    if (messageElem.textContent === DISCONNECTED_MESSAGE) {
        messageElem.textContent = "";
    }
    enableMoveInput(chessGame);
}

async function onRoomUpdate(chessGame, updatedRoomData) {
    // alert("onRoomUpdate started");
    if (
        typeof updatedRoomData["white"] === "string" &&
        typeof updatedRoomData["black"] === "string"
    ) {
        console.log("new update");
        // alert("new update");
        // alert("updatedRoomData['game-start'] == " + updatedRoomData["game-start"]);

        if (roomData["moves"] === updatedRoomData["moves"]) {
            // update everything
            await updateUserNames(updatedRoomData);
            await updateGameField(updatedRoomData); // remove await?
            chessGame.load_pgn(roomData["moves"]);
            updateTimeLeft(updatedRoomData, chessGame);
            // await window.chessboard.setPosition(chessGame.fen(), true);
            await window.chessboard.setPosition(chessGame.fen(), true); // remove await?
            // await setupGame(chessGame); // remove await?
            await setupGame(chessGame, updatedRoomData); // remove await?
        }
        else {
            // update only position and time left
            if (updateBoard) {
                // it was not our move.
                chessGame.load_pgn(updatedRoomData["moves"]);
                // await window.chessboard.setPosition(chessGame.fen(), true);
                window.chessboard.setPosition(chessGame.fen(), true);
                updateTimeLeft(updatedRoomData, chessGame);
            }
            else {
                updateBoard = true;
            }
            // await window.chessboard.setPosition(updatedRoomData["position"], true);
        }

        if (updatedRoomData["offer-draw"] !== undefined) {
            if (updatedRoomData["offer-draw"] === "offered" &&
                (
                    !iAmWhite && updatedRoomData["draw-offerer"] === "w" ||
                    iAmWhite && updatedRoomData["draw-offerer"] === "b"
                )
            ) {
                // document.getElementById("game-message").style.display = "inline-block";
                document.getElementById("game-message").textContent = "Draw?";
            }
        }
        if (updatedRoomData["result"] !== undefined) {
            gameFinished = true;
            showGameResult(updatedRoomData["result"]);
            window.chessboard.disableMoveInput();
        }

        // alert("roomData = updatedRoomData");
        roomData = updatedRoomData;
    }
}

async function main() {
    if (!userIsAuthenticated()) {
        window.location.href = "login.html"
    }

    const chessGame
        = new Chess();

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

    document.getElementById("game-resign-button").addEventListener(
        "click", (event) => {
            event.preventDefault();

            const winnerColor = iAmWhite ? "black" : "white";
            finishGame(winnerColor);
        }
    );
    document.getElementById("game-draw-button").addEventListener("click", onDrawButtonClicked);

    roomData = await getRoomData(gameId);
    if (roomData == null) {
        window.location.replace("game-creation.html");
    }
    else {
        iAmWhite = amIWhite(roomData); // seems like this iAmWhite is perfectly valid.

        setOnConnectAndDisconnect(onConnect.bind(null, chessGame), onDisconnect);

        listenForRoomUpdates(gameId, onRoomUpdate.bind(null, chessGame));

        await connectCurrUserToRoom(gameId, roomData);
    }
}

await main();