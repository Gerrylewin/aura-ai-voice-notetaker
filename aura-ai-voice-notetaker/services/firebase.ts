import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// I've constructed this from the details you provided.
const firebaseConfig = {
  apiKey: "AIzaSyBZcSqJhcl47pu1jw3W-efz3hEwNJXCkD8",
  authDomain: "aura-voicenoteaker.firebaseapp.com",
  projectId: "aura-voicenoteaker",
  storageBucket: "aura-voicenoteaker.appspot.com",
  // These can be found in your Firebase project settings if needed
  messagingSenderId: "693537272270", 
  appId: "1:693537272270:web:YOUR_APP_ID" // You can find this in your Firebase console
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
