// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCbp5-jigzql76wzmVpTkSuzS7llfeN_H8",
  authDomain: "card-game-b1d3e.firebaseapp.com",
  databaseURL:
    "https://card-game-b1d3e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "card-game-b1d3e",
  storageBucket: "card-game-b1d3e.firebasestorage.app",
  messagingSenderId: "1033071499928",
  appId: "1:1033071499928:web:03280d728888e552534eed",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
