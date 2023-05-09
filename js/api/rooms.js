import {initializeApp} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {getDatabase, ref, push} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import {getAuth} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDCUea-F9S2qmzHY3ib0Paav9dBYq2rXYI",
    authDomain: "aneroid11-chess.firebaseapp.com",
    projectId: "aneroid11-chess",
    storageBucket: "aneroid11-chess.appspot.com",
    messagingSenderId: "506748179483",
    appId: "1:506748179483:web:f7f5f69c0e6c1a812d94be"
};

const app = initializeApp(firebaseConfig)
const db = getDatabase(app)
const gameRoomsRef = ref(db, '/rooms')
const auth = getAuth()

async function createGameRoom(time_limit, current_user_color) {
    const user = auth.currentUser

    const newRoom = {
        "time-limit": time_limit,
    };

    if (current_user_color === "white") {
        newRoom["white"] = user.uid;
        newRoom["black"] = null;
    }
    else {
        newRoom["black"] = user.uid;
        newRoom["white"] = null;
    }

    const roomRef = await push(gameRoomsRef, newRoom);
    return roomRef.key;
}

export {createGameRoom}