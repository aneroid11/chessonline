import { userIsAuthenticated } from './app.js'
import { getAllRooms } from "./api/rooms.js";

if (!userIsAuthenticated()) {
    window.location.href = 'login.html'
}

async function main() {
    const allRooms = await getAllRooms();
    const myUid = document.cookie.split(";")[0].split("=")[1];

    for (const [key, value] of Object.entries(allRooms)) {
        if (value["result"] !== undefined && (myUid === value["white"] || myUid === value["black"])) {
            const newArticle = document.createElement("article");
            newArticle.className = "statistics__game-result";
            let htmlStr = "";
            htmlStr += value["statistics-string"]
                .replaceAll(">", "&gt;")
                .replaceAll("<", "&lt;")
                .replaceAll("\n", "<br>")
            newArticle.innerHTML = htmlStr;

            if (value["result"] === "draw") {
                document.getElementById("statistics-draws-list").appendChild(newArticle);
            }
            else {
                if (value["result"] === "white" && myUid === value["white"] ||
                    value["result"] === "black" && myUid === value["black"]) {
                    document.getElementById("statistics-wins-list").appendChild(newArticle);
                }
                else {
                    document.getElementById("statistics-loses-list").appendChild(newArticle);
                }
            }
        }
    }
}

await main();
