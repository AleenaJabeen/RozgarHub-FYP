// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyALxG310NTJfI99xBD3xPaFY4VM5mGCh94",
  authDomain: "rozgarhub-46a91.firebaseapp.com",
  projectId: "rozgarhub-46a91",
  messagingSenderId: "295110853975",
  appId: "1:295110853975:web:3505b425cd99731f086a12",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);