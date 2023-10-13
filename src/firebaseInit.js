// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDmozTiQbBO46Rb3Q8sAsQ5JhUveaLnaa0",
  authDomain: "testing-codingninjas.firebaseapp.com",
  projectId: "testing-codingninjas",
  storageBucket: "testing-codingninjas.appspot.com",
  messagingSenderId: "609795010892",
  appId: "1:609795010892:web:08507430407dd7e5f6dfe9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);