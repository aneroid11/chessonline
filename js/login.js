import {userIsAuthenticated} from "./app.js";
import {signInUser} from "./api/users.js";

if (userIsAuthenticated()) {
    window.location.replace("index-logged.html")
}

async function logIn(event) {
    event.preventDefault()

    const result = await signInUser(
        document.getElementById("login-email").value,
        document.getElementById("login-password").value
    )
    if (typeof result != "string") {
        document.cookie = `user=${result.uid};`
        console.log(result.uid)
        window.location.replace("index-logged.html")
    }
    else {
        document.getElementById("login-error").textContent = result
    }
}

document.getElementById("login-form").addEventListener("submit", logIn)