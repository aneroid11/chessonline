import { userIsAuthenticated } from "./app.js";

if (!userIsAuthenticated()) {
    window.location.href = "login.html"
}

console.log(userIsAuthenticated())