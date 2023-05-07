function userIsAuthenticated() {
    return document.cookie.includes("user=")
}

export { userIsAuthenticated }