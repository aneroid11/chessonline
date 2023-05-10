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
    iAmWhite = amIWhite(roomData);

    if (iAmWhite) {
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

                // pawns are promoted to Queens only.
                const result = chessGame.move({"from": event.squareFrom, "to": event.squareTo, "promotion": "q"});
                if (result) {
                    updateBoard = false;
                    event.chessboard.setPosition(chessGame.fen());
                    updateRoomData(
                        gameId,
                        {
                            "moves": chessGame.pgn(),
                            "last-move": Math.floor(Date.now() / 1000),
                            "time-left-white": iAmWhite ? timeLeftBottom : timeLeftTop,
                            "time-left-black": iAmWhite ? timeLeftTop : timeLeftBottom
                        }
                    );
                    return true;
                }

                return false;
            case INPUT_EVENT_TYPE.moveInputCanceled:
                // console.log(`moveInputCanceled`)
                break;
        }
    }, iAmWhite ? COLOR.white : COLOR.black);

    if (roomData["game-start"] === undefined) {
        // start the game
        await updateRoomData(gameId, {
            "game-start": Math.floor(Date.now() / 1000),
            "last-move": Math.floor(Date.now() / 1000),
            "time-left-white": roomData["time-limit"] * 60,
            "time-left-black": roomData["time-limit"] * 60
        });
    }

    // startTimer(roomData["time-limit"] * 60, chessGame);
}

function convertSecondsToMinutesSeconds(seconds) {
    return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60)}`;
}

function startTimer(startCount, chessGame) {
    timeLeftTop = startCount;
    timeLeftBottom = startCount;

    setInterval(
        () => {
            document.getElementById("game-waiting-bottom-time-left").textContent =
                convertSecondsToMinutesSeconds(timeLeftBottom);
            document.getElementById("game-waiting-top-time-left").textContent =
                convertSecondsToMinutesSeconds(timeLeftTop);

            const myColor = iAmWhite ? "w" : "b";
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
        },
        1000
    )
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
        // document.getElementById("game-waiting-top-time-left").textContent =
        //     roomData["time-limit"];
        // document.getElementById("game-waiting-bottom-time-left").textContent =
        //     roomData["time-limit"];

        listenForRoomUpdates(gameId, async (updatedRoomData) => {
            if (
                typeof updatedRoomData["white"] === "string" &&
                typeof updatedRoomData["black"] === "string"
            ) {
                // if (updatedRoomData["game-start"] !== undefined) {
                //     // game already started, update the timers
                //     iAmWhite = amIWhite(roomData);
                //     timeLeftTop = iAmWhite ? updatedRoomData["time-left-black"] : updatedRoomData["time-left-white"];
                //     timeLeftBottom = iAmWhite ? updatedRoomData["time-left-white"] : updatedRoomData["time-left-black"];
                //
                //     // timeLeft -= currTime - lastMoveTime;
                //     const myColor = iAmWhite ? "w" : "b";
                //
                //     alert(myColor);
                //
                //     if (chessGame.turn() === myColor) {
                //         // alert(Date.now());
                //         // alert(updatedRoomData["last-move"]);
                //         alert(Date.now() - updatedRoomData["last-move"]);
                //         timeLeftBottom -= Date.now() - updatedRoomData["last-move"];
                //     }
                //     else {
                //         alert(Date.now());
                //         alert(updatedRoomData["last-move"]);
                //         timeLeftTop -= Date.now() - updatedRoomData["last-move"];
                //     }
                //
                //     document.getElementById("game-waiting-top-time-left").textContent =
                //         convertSecondsToMinutesSeconds(timeLeftTop);
                //     document.getElementById("game-waiting-bottom-time-left").textContent =
                //         convertSecondsToMinutesSeconds(timeLeftBottom);
                // }

                if (roomData["moves"] === updatedRoomData["moves"]) {
                    await updateUserNames(updatedRoomData);
                    await updateGameField(updatedRoomData);
                    chessGame.load_pgn(roomData["moves"]);
                    await window.chessboard.setPosition(chessGame.fen(), true);
                    await setupGame(chessGame);
                }
                else {
                    // update only position
                    if (updateBoard) {
                        // it was not our move.

                        chessGame.load_pgn(updatedRoomData["moves"]);
                        await window.chessboard.setPosition(chessGame.fen(), true);
                    }
                    else {
                        updateBoard = true;
                    }
                    // await window.chessboard.setPosition(updatedRoomData["position"], true);
                }
                roomData = updatedRoomData;
            }
        });

        await connectCurrUserToRoom(gameId, roomData);
    }
}

await main();