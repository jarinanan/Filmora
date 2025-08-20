// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyABysu-eRCL0bdTzLmwX_--YaOa1rHtM80",
  authDomain: "movie-a05f6.firebaseapp.com",
  projectId: "movie-a05f6",
  storageBucket: "movie-a05f6.firebasestorage.app",
  messagingSenderId: "522684063278",
  appId: "1:522684063278:web:e8c39b102d45f643d9c9bf",
  measurementId: "G-D2HV2J11Y4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };
