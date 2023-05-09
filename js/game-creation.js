import { userIsAuthenticated } from "./app.js";

if (!userIsAuthenticated()) {
    window.location.href = "login.html"
}

function createGame(event) {
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

    alert("create game: " + selected_time_limit + " " + selected_color);
}

document.getElementById("game-creation-form").addEventListener(
    "submit", createGame
)