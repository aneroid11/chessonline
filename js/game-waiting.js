import {push} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import * as app from "./api/app.js"

const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)

if (urlParams.has("time-limit")) {
    // this is a game creation
    const timeLimit = urlParams.get("time-limit")
    const color = urlParams.get("color")

    const newRoom = {
        "timeLimit": timeLimit,
        "color": color,
        "firstPlayer": null,
        "secondPlayer": null
    }

    console.log("push")
    const roomRef = await push(app.gameRoomsRef, newRoom)
    console.log("just after push")
    // const newUrl = new URL("game-waiting.html")
    // newUrl.searchParams.append("game-id", roomKey)
    window.location.href = `game-waiting.html?game-id=${roomRef.key}`
}
else if (urlParams.has("game-id")) {
    // this is a connection to an existing game
    const gameId = urlParams.get("game-id")
    console.log("connect to game " + gameId)
}
else {
    // window.location.replace("game-creation.html")
    window.location.href = "game-creation.html"
}

// console.log(urlParams.get("time-limit"))