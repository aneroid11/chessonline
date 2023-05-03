import {push, child, get} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
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
            console.log("has such room!")
        }
        else {
            console.log("no such room!")
            window.location.replace("game-creation.html")
        }
    })
}
else {
    window.location.replace("game-creation.html")
}