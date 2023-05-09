import { userIsAuthenticated } from "./app.js";
import { getUserProfileInfo } from "./api/users.js";

if (!userIsAuthenticated()) {
    window.location.href = "login.html"
}

const profileInfo = await getUserProfileInfo()
document.getElementById("acc-edit-name").value = profileInfo.name