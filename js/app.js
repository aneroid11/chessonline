function userIsAuthenticated() {
    if (document.cookie.includes("user=")) {
        const params = document.cookie.split(';');
        const uid = params[0].split('=')[1];
        if (uid !== "") {
            // alert(uid)
            return true
        }
    }

    return false
}

export { userIsAuthenticated }