import { userIsAuthenticated } from "./app.js";
import {deleteCurrentUser, reauthenticateUser, signInUser} from "./api/users.js";

if (!userIsAuthenticated()) {
    window.location.href = "login.html"
}

async function deleteUser(event) {
    event.preventDefault()

    const result = await reauthenticateUser(
        document.getElementById("delete-acc-password").value
    )
    if (typeof result != "string") {
        await deleteCurrentUser()
        document.cookie = "user=;";
        window.location.replace("index.html")
    }
    else {
        document.getElementById("delete-acc-title").textContent = result
    }
}

document.getElementById("delete-acc-form").addEventListener("submit", deleteUser)