import {initializeApp} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {getDatabase, ref, set, remove, update, child, get} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import {
    deleteUser, reauthenticateWithCredential, EmailAuthProvider,
    createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, getAuth,
    onAuthStateChanged, updateProfile, updatePassword
} from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js';

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
const usersRef = ref(db, "/users")
const auth = getAuth()

const errors = {
    "auth/invalid-email": "Invalid email!",
    "auth/email-already-in-use": "Email already in use!",
    "auth/wrong-password": "Wrong password!",
    "auth/user-not-found": "User not found!"
}

async function createUser(name, email, password) {
    try {
        const response = await createUserWithEmailAndPassword(auth, email, password)
        await set(ref(db,"users/" + response.user.uid), {"name": name})
        return response.user
    }
    catch (error) {
        console.log(error)
        return errors[error.code]
    }
}

async function signInUser(email, password) {
    try {
        const response = await signInWithEmailAndPassword(auth, email, password)
        return response.user
    }
    catch (error) {
        console.log(error)
        return errors[error.code]
    }
}

async function reauthenticateUser(password) {
    while (auth.currentUser == null) {}
    // alert(auth.currentUser.email)
    const creds = EmailAuthProvider.credential(auth.currentUser.email, password)

    try {
        const response = await reauthenticateWithCredential(auth.currentUser, creds)
        return response.user
    }
    catch (error) {
        console.log(error)
        return errors[error.code]
    }
}

async function signOutUser() {
    await signOut(auth)
}

async function deleteCurrentUser() {
    await remove(child(usersRef, auth.currentUser.uid))
    await deleteUser(auth.currentUser)
}

async function getUserProfileInfo() {
    // while (auth.currentUser == null) {}
    // alert(auth.currentUser.email)

    let userId = ""

    if (document.cookie.includes('user=')) {
        const params = document.cookie.split(';');
        userId = params[0].split('=')[1];
    }
    else {
        return null
    }

    try {
        const response = await get(ref(db,"users/" + userId))
        return {"name": response.val().name}
    }
    catch (error) {
        alert(error)
        return null
    }
}

async function changeUserName(uid, newName) {
    console.log("change user name to " + newName)

    await update(ref(db, `/users/${uid}`), {"name": newName});
}

async function changeUserPassword(uid, newPassword) {
    console.log("change user password to " + newPassword)

    const user = auth.currentUser;
    alert(user.email)
    await updatePassword(user, newPassword)
}

export {
    app, db, gameRoomsRef, createUser, signOutUser, signInUser, reauthenticateUser, deleteCurrentUser,
    changeUserName, changeUserPassword, getUserProfileInfo
}