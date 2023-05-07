const signupButton = document.getElementById("signup-button")
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

console.log("something happens")

signupButton.disabled = true
pass1Input.addEventListener("input", checkPasswordMatchesRepeatPassword)
pass2Input.addEventListener("input", checkPasswordMatchesRepeatPassword)