import {initializeApp} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {getDatabase, ref} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import {
    deleteUser, reauthenticateWithCredential, EmailAuthProvider,
    createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, getAuth
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
const auth = getAuth()

const errors = {
    "auth/invalid-email": "Invalid email!",
    "auth/email-already-in-use": "Email already in use!",
    "auth/wrong-password": "Wrong password!",
    "auth/user-not-found": "User not found!"
}

async function createUser(email, password) {
    try {
        const response = await createUserWithEmailAndPassword(auth, email, password)
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
    await deleteUser(auth.currentUser)
}

export { app, db, gameRoomsRef, createUser, signOutUser, signInUser, reauthenticateUser, deleteCurrentUser }