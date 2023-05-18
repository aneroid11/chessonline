import { userIsAuthenticated } from "./app.js";
import { createGameRoom } from "./api/rooms.js";

if (!userIsAuthenticated()) {
    window.location.href = "login.html";
}

function getRandomFromAToB(a, b) {
    const randFrom0to1 = Math.random();
    const delta = b - a;
    return a + Math.round(delta * randFrom0to1);
}

async function createGame(event) {
    event.preventDefault();

    const time_limit_options = document.getElementsByName("time-limit");
    let selected_time_limit = null;
    for (let i = 0; i < time_limit_options.length; i++) {
        if (time_limit_options[i].checked) {
            selected_time_limit = time_limit_options[i].value
            break
        }
    }
    const color_options = document.getElementsByName("color");
    let selected_color = null;
    for (let i = 0; i < color_options.length; i++) {
        if (color_options[i].checked) {
            selected_color = color_options[i].value
            break
        }
    }

    let time_limit_num = 0;

    if (selected_time_limit === "5min") {time_limit_num = 5;}
    else if (selected_time_limit === "15min") {time_limit_num = 15;}
    else if (selected_time_limit === "30min") {time_limit_num = 30;}
    // else {time_limit_num = [5, 15, 30][getRandomFromAToB(0, 2)]}
    else {time_limit_num = [5, 15, 30][getRandomFromAToB(0, 2)]}

    if (selected_color === "random") {
        selected_color = getRandomFromAToB(0, 1) === 0 ? "white" : "black";
    }

    // alert("create game: " + time_limit_num + " " + selected_color);

    const roomKey = await createGameRoom(time_limit_num, selected_color);
    window.location.replace(`game-waiting.html?game-id=${roomKey}`);
}

document.getElementById("game-creation-form").addEventListener(
    "submit", createGame
)