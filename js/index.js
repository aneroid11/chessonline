import {userIsAuthenticated} from "./app.js";
import {Chessboard} from "https://cdn.jsdelivr.net/npm/cm-chessboard@7/src/cm-chessboard/Chessboard.js";

if (userIsAuthenticated()) {
    window.location.replace("index-logged.html");
}

const board = new Chessboard(document.getElementById("chess-board"));