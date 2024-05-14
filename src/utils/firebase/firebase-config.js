// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDq9A1SinF0mOF2fk8038o5Dn6DELFh_rE",
  authDomain: "speck-app.firebaseapp.com",
  projectId: "speck-app",
  storageBucket: "speck-app.appspot.com",
  messagingSenderId: "558282669590",
  appId: "1:558282669590:web:15f8de1123c1d35847ff37",
  measurementId: "G-XEDL8VZV8J"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)
