import { userIsAuthenticated } from "./app.js";
import { getUserProfileInfo, reauthenticateUser, changeUserName, changeUserPassword } from "./api/users.js";

if (!userIsAuthenticated()) {
    window.location.replace("login.html")
}

const saveChangesButton = document.getElementById("acc-edit-save-changes")
const passwordInput = document.getElementById("acc-edit-password")
const nameInput = document.getElementById("acc-edit-name")
const newPasswordInput = document.getElementById("acc-edit-new-password")
const repeatPasswordInput = document.getElementById("acc-edit-repeat-password")

async function saveChanges(event) {
    event.preventDefault()

    const result = await reauthenticateUser(passwordInput.value)
    if (typeof result !== "string") {
        if (nameInput.value.length > 0 && profileInfo["name"] !== nameInput.value) {
            changeUserName(result.uid, nameInput.value)
        }
        if (newPasswordInput.value.length > 0) {
            changeUserPassword(result.uid, newPasswordInput.value)
        }
    }
    else {
        document.getElementById("acc-edit-form-error").textContent = result
    }

    // alert("save changes")
    // window.location.replace("account.html")
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