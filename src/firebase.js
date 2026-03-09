import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // 1. Import the database tool

const firebaseConfig = {
  apiKey: "AIzaSyCR0nhPsm4IYLr70GXKXEEc6hUURYdwCLs",
  authDomain: "bantay-chat.firebaseapp.com",
  databaseURL: "https://bantay-chat-default-rtdb.asia-southeast1.firebasedatabase.app", 
  projectId: "bantay-chat",
  storageBucket: "bantay-chat.firebasestorage.app",
  messagingSenderId: "1008077452949",
  appId: "1:1008077452949:web:b520365965634805734d9c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 2. THIS IS THE EXPORT LINE YOU NEED
export const database = getDatabase(app);