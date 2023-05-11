import { userIsAuthenticated } from './app.js'
import { getAllRooms } from "./api/rooms.js";

if (!userIsAuthenticated()) {
    window.location.href = 'login.html'
}

async function main() {
    // достать все комнаты, в которых мы есть и в которых есть result.
    // достать все комнаты.
    const allRooms = await getAllRooms();

    for (const [key, value] of Object.entries(allRooms)) {
        // alert(key value);
        // alert(key);
        if (value["statistics-string"] !== undefined) {
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
                document.getElementById("statistics-wins-list").appendChild(newArticle);
            }
        }
    }
}

await main();
