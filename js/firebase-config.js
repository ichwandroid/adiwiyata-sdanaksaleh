// Firebase Configuration
// TODO: Replace with your actual Firebase config
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC43UuoWoTq9IEWIfSj9DCSSkDANdM3leI",
  authDomain: "adiwiyata-sdanaksaleh-2025.firebaseapp.com",
  projectId: "adiwiyata-sdanaksaleh-2025",
  storageBucket: "adiwiyata-sdanaksaleh-2025.firebasestorage.app",
  messagingSenderId: "185844261741",
  appId: "1:185844261741:web:488fcd4f9cc9360f8ff064"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// Initialize Realtime Database (optional, if you prefer RTDB)
const rtdb = firebase.database();

// Export for use in other files
window.firebaseDb = db;
window.firebaseRtdb = rtdb;
