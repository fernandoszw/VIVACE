import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getDatabase, ref, set, get, push, child, onValue, update } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDFXZblMDJqjNdw84x0EOtUDQ6CUrTk9B8",
    authDomain: "loginvivace.firebaseapp.com",
    databaseURL: "https://loginvivace-default-rtdb.firebaseio.com",
    projectId: "loginvivace",
    storageBucket: "loginvivace.firebasestorage.app",
    messagingSenderId: "900481651159",
    appId: "1:900481651159:web:b47dcbbcd68d023e8afb92"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
export { getDatabase, ref, set, get, push, child, onValue, db, update }