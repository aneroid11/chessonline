import {initializeApp} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
    getDatabase,
    ref,
    push,
    get,
    child,
    update, onValue, serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import {getAuth} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
// import {FEN} from "https://cdn.jsdelivr.net/npm/cm-chessboard@7/src/cm-chessboard/Chessboard.js";

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

    newRoom["moves"] = "";

    const roomRef = await push(gameRoomsRef, newRoom);
    return roomRef.key;
}

async function updateRoomData(roomKey, roomData) {
    await update(ref(db, `/rooms/${roomKey}`), roomData);
}

async function getRoomData(roomKey) {
    try {
        const data = await get(child(gameRoomsRef, roomKey));
        return data.val();
    }
    catch (error) {
        return null;
    }
}

async function connectCurrUserToRoom(roomKey, roomData) {
    // returns "wait_one", "cannot_connect" or "can_play".
    // suppose roomKey is valid.

    const user = auth.currentUser;

    if (typeof roomData["white"] === "string" && typeof roomData["black"] === "string") {
        if (user.uid !== roomData["white"] && user.uid !== roomData["black"]) {
            return "cannot_connect";
        }
        return "can_play";
    }

    // one is undefined

    if (
        typeof roomData["white"] === "string" && user.uid === roomData["white"] ||
        typeof roomData["black"] === "string" && user.uid === roomData["black"]
    ) {
        return "wait_one";
    }

    if (typeof roomData["white"] === "string") {
        roomData["black"] = user.uid;
    }
    else {
        roomData["white"] = user.uid;
    }

    // alert("UPDATE ROOM DATA");
    await updateRoomData(roomKey, roomData);
    return "can_play";
}

function listenForRoomUpdates(roomKey, listenerFunc) {
    onValue(child(gameRoomsRef, roomKey), (snapshot) => {
        const roomData = snapshot.val();
        listenerFunc(roomData);
    })
}

function amIWhite(roomData) {
    return roomData["white"] === auth.currentUser.uid ||
        (roomData["black"] !== auth.currentUser.uid && roomData["white"] == null);
}

async function getAllRooms() {
    try {
        const data = await get(gameRoomsRef);
        return data.val();
    }
    catch (error) {
        return null;
    }
}

function getServerTime() {
    return serverTimestamp();
}

export {
    createGameRoom, getRoomData, connectCurrUserToRoom, listenForRoomUpdates, amIWhite, updateRoomData, getAllRooms,
    getServerTime
}