import { userIsAuthenticated } from "./app.js";
import { signOutUser } from "./api/users.js";

if (!userIsAuthenticated()) {
    window.location.href = "login.html"
}

async function logOut() {
    await signOutUser()
    document.cookie = "user=;"
    window.location.replace("index.html")
}

document.getElementById("log-out").addEventListener("click", logOut)