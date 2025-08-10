// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDpjUAyPCtliorMUWlMtdofE9kasl8tVl0",
  authDomain: "ai-store-fffd2.firebaseapp.com",
  projectId: "ai-store-fffd2",
  storageBucket: "ai-store-fffd2.firebasestorage.app",
  messagingSenderId: "951534882560",
  appId: "1:951534882560:web:72aed494f1ce6ba02fede5",
  measurementId: "G-ESRQCKDGM8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, analytics };
