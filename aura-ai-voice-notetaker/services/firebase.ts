// FIX: Use Firebase v8 compat libraries to fix module export errors.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// Your web app's Firebase configuration
// I've constructed this from the details you provided.
// IMPORTANT: You need to add your web app's appId from the Firebase console.
const firebaseConfig = {
  apiKey: "AIzaSyBZcSqJhcl47pu1jw3W-efz3hEwNJXCkD8",
  authDomain: "aura-voicenoteaker.firebaseapp.com",
  projectId: "aura-voicenoteaker",
  storageBucket: "aura-voicenoteaker.appspot.com",
  messagingSenderId: "693537272270", 
  appId: "1:693537272270:web:d797503a74c7728770b55c" // Example, replace with your actual App ID
};

// Initialize Firebase if not already initialized
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Get Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

export { auth, db };