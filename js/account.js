import { userIsAuthenticated } from "./app.js";
import { signOutUser, getUserProfileInfo } from "./api/users.js";

if (!userIsAuthenticated()) {
    window.location.href = "login.html"
}

async function logOut() {
    await signOutUser()
    document.cookie = "user=;"
    window.location.replace("index.html")
}

document.getElementById("log-out").addEventListener("click", logOut)

getUserProfileInfo().then((profileInfo) => {
    document.getElementById("account-name").textContent = profileInfo.name
})
