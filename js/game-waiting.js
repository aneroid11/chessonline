import {push, child, get} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import * as app from "./app.js"
import { userIsAuthenticated } from "./app.js";

if (!userIsAuthenticated()) {
    window.location.href = "login.html"
}

const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)

if (urlParams.has("time-limit")) {
    // this is a game creation
    const timeLimit = urlParams.get("time-limit")
    const color = urlParams.get("color")

    const newRoom = {
        "timeLimit": timeLimit,
        "color": color,
        "firstPlayer": "Ibrahim",
        "secondPlayer": null
    }

    console.log("push")
    // wait for the promise
    const roomRef = await push(app.gameRoomsRef, newRoom)
    console.log("just after push")
    window.location.replace(`game-waiting.html?game-id=${roomRef.key}`)
}
else if (urlParams.has("game-id")) {
    // this is a connection to an existing game
    const gameId = urlParams.get("game-id")
    console.log("connect to game " + gameId)

    const roomRef = child(app.gameRoomsRef, gameId)
    get(roomRef).then((snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val()

            console.log(data)

            // if (data.get("secondPlayer") == null) {
            //     data["secondPlayer"] = "Ahmed"
            // }
            // else {
            //     window.location.replace("game-running.html")
            // }

            const gameLink = document.getElementById("game-link")
            gameLink.textContent = window.location.href
        }
        else {
            window.location.replace("game-creation.html")
        }
    })
}
else {
    window.location.replace("game-creation.html")
}