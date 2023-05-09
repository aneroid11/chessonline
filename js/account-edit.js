import { userIsAuthenticated } from "./app.js";
import { getUserProfileInfo } from "./api/users.js";

if (!userIsAuthenticated()) {
    window.location.replace("login.html")
}

const saveChangesButton = document.getElementById("acc-edit-save-changes")
const passwordInput = document.getElementById("acc-edit-password")
const nameInput = document.getElementById("acc-edit-name")
const newPasswordInput = document.getElementById("acc-edit-new-password")
const repeatPasswordInput = document.getElementById("acc-edit-repeat-password")

function saveChanges(event) {
    event.preventDefault()

    alert("save changes")
    window.location.replace("account.html")
}

function checkPasswordLength(event) {
    event.preventDefault()

    saveChangesButton.disabled = passwordInput.value.length < 6
}

function compareNewPasswordAndRepeatPassword(event) {
    event.preventDefault()

    saveChangesButton.disabled = newPasswordInput.value !== repeatPasswordInput.value
}

saveChangesButton.disabled = true
passwordInput.addEventListener("input", checkPasswordLength)
document.getElementById("acc-edit-form").addEventListener("submit", saveChanges)
newPasswordInput.addEventListener("input", compareNewPasswordAndRepeatPassword)
repeatPasswordInput.addEventListener("input", compareNewPasswordAndRepeatPassword)

const profileInfo = await getUserProfileInfo()
nameInput.value = profileInfo.name