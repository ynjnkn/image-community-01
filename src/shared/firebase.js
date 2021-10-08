import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyA4FDs6v7nKuj7GMimnA_7mnriqxkLeF1E",
  authDomain: "image-community-01.firebaseapp.com",
  projectId: "image-community-01",
  storageBucket: "image-community-01.appspot.com",
  messagingSenderId: "670269046652",
  appId: "1:670269046652:web:e00b1a36a03a59e2df2ef9",
  measurementId: "G-EQJ13SH8T4",
};

firebase.initializeApp(firebaseConfig);

const apiKey = firebaseConfig.apiKey;
const auth = firebase.auth();
const firestore = firebase.firestore();
const storage = firebase.storage();
const realtime = firebase.database();

export{auth, apiKey, firestore, storage, realtime};
