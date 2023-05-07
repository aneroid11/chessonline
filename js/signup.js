import {userIsAuthenticated} from "./app.js";
import {createUser} from "./api/users.js";


if (userIsAuthenticated()) {
    window.location.replace("index-logged.html")
}

const signupButton = document.getElementById("signup-button")
const email = document.getElementById("login")
const pass1Input = document.getElementById("password")
const pass2Input = document.getElementById("repeat-password")

function checkPasswordMatchesRepeatPassword(event) {
    if (pass1Input.value !== pass2Input.value || pass1Input.value.length === 0 || pass2Input.value.length === 0) {
        signupButton.disabled = true
    }
    else {
        signupButton.disabled = false
    }
}

async function signUp(event) {
    event.preventDefault()
    
    let user = await createUser(email.value, pass1Input.value)
    document.cookie = `user=${user.id}`
    console.log(user.id)
}


signupButton.disabled = true
pass1Input.addEventListener("input", checkPasswordMatchesRepeatPassword)
pass2Input.addEventListener("input", checkPasswordMatchesRepeatPassword)
document.getElementById("signup-form").addEventListener("submit", signUp)