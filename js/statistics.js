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
        if (value["result"] !== undefined) {
            alert(value["statistics-string"]);
        }
    }
}

await main();
