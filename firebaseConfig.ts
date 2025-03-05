// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDkWJ-j6hoTynRzIiLLWwsHRJksOUjSF5I",
  authDomain: "lumigram-a24f2.firebaseapp.com",
  projectId: "lumigram-a24f2",
  storageBucket: "lumigram-a24f2.firebasestorage.app",
  messagingSenderId: "31411368310",
  appId: "1:31411368310:web:5202470facaf224b2c4a57"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Auth
export const auth = getAuth(app);
