import {userIsAuthenticated} from "./app.js";

if (userIsAuthenticated()) {
    window.location.replace("index-logged.html")
}