console.log("create a game!")

const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)

if (urlParams.has("time-limit")) {
    // this is a game creation
    let timeLimit = urlParams.get("time-limit")
    let color = urlParams.get("color")
    console.log("create game " + timeLimit + " " + color)
}
else if (urlParams.has("game-id")) {
    // this is a connection to an existing game
    let gameId = urlParams.get("game-id")
    console.log("connect to game " + gameId)
}
else {
    window.location.replace("game-creation.html")
}

// console.log(urlParams.get("time-limit"))