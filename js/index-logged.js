import { userIsAuthenticated } from "./app.js";
import {Chessboard, FEN} from "https://cdn.jsdelivr.net/npm/cm-chessboard@7/src/cm-chessboard/Chessboard.js";

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
