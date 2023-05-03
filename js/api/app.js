import {getApps, initializeApp} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
// import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js';

const firebaseConfig = {
    apiKey: "AIzaSyDCUea-F9S2qmzHY3ib0Paav9dBYq2rXYI",
    authDomain: "aneroid11-chess.firebaseapp.com",
    projectId: "aneroid11-chess",
    storageBucket: "aneroid11-chess.appspot.com",
    messagingSenderId: "506748179483",
    appId: "1:506748179483:web:f7f5f69c0e6c1a812d94be"
};

let apps = getApps()
console.log(apps)

// Initialize Firebase
console.log("initialize app")
const app = initializeApp(firebaseConfig)

console.log("get database")
const db = getDatabase(app)

console.log("get game rooms ref")
const gameRoomsRef = ref(db, '/rooms')

// const gameId = push(gameRoomsRef, {
//     numPlayers: 1
// })
// const gameKey = gameId.key
//
// // push(gameRoomsRef, {
// //     numPlayers: 2
// // })
//
// set(child(gameRoomsRef, gameKey), {
//     "numPlayers": 5
// })
//
// // remove(child(gameRoomsRef, gameKey))

export { app, db, gameRoomsRef }