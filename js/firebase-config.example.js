/**
 * CONTOH KONFIGURASI FIREBASE
 * 
 * File ini adalah template konfigurasi Firebase.
 * Copy file ini dan rename menjadi 'firebase-config.js'
 * lalu ganti nilai-nilai di bawah dengan konfigurasi Firebase Anda.
 * 
 * Cara mendapatkan konfigurasi:
 * 1. Buka Firebase Console: https://console.firebase.google.com/
 * 2. Pilih project Anda
 * 3. Klik icon gear (⚙️) → Project settings
 * 4. Scroll ke bawah ke "Your apps"
 * 5. Klik icon Web (</>) jika belum ada app
 * 6. Copy konfigurasi yang muncul
 */

// ============================================
// GANTI SEMUA NILAI DI BAWAH INI
// ============================================

const firebaseConfig = {
    // API Key - Kunci API untuk mengakses Firebase
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",

    // Auth Domain - Domain untuk autentikasi
    authDomain: "your-project-id.firebaseapp.com",

    // Database URL - URL Realtime Database (opsional)
    databaseURL: "https://your-project-id-default-rtdb.firebaseio.com",

    // Project ID - ID unik project Firebase Anda
    projectId: "your-project-id",

    // Storage Bucket - Bucket untuk Firebase Storage
    storageBucket: "your-project-id.appspot.com",

    // Messaging Sender ID - ID untuk Firebase Cloud Messaging
    messagingSenderId: "123456789012",

    // App ID - ID unik aplikasi web Anda
    appId: "1:123456789012:web:abcdef1234567890",

    // Measurement ID - ID untuk Google Analytics (opsional)
    // measurementId: "G-XXXXXXXXXX"
};

// ============================================
// JANGAN UBAH KODE DI BAWAH INI
// ============================================

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase berhasil diinisialisasi');

    // Initialize Firestore
    const db = firebase.firestore();

    // Initialize Realtime Database (optional)
    const rtdb = firebase.database();

    // Export for use in other files
    window.firebaseDb = db;
    window.firebaseRtdb = rtdb;
    window.db = db; // Alias untuk kemudahan

    console.log('✅ Firestore berhasil diinisialisasi');

} catch (error) {
    console.error('❌ Error inisialisasi Firebase:', error);
    console.error('Pastikan konfigurasi Firebase sudah benar!');
}

// ============================================
// CONTOH KONFIGURASI YANG BENAR
// ============================================

/*
const firebaseConfig = {
    apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    authDomain: "adiwiyata-sdanaksaleh.firebaseapp.com",
    databaseURL: "https://adiwiyata-sdanaksaleh-default-rtdb.firebaseio.com",
    projectId: "adiwiyata-sdanaksaleh",
    storageBucket: "adiwiyata-sdanaksaleh.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890abcdef"
};
*/
