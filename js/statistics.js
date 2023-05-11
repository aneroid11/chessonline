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
            // alert(value["statistics-string"]);
            const newArticle = document.createElement("article");
            let htmlStr = "";
            htmlStr += '<article class=\"statistics__game-result\">';
            htmlStr += value["statistics-string"].replaceAll("\n", "<br>");
            htmlStr += '</article>';
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
