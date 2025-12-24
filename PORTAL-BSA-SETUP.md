# Portal BSA - Setup & Konfigurasi Firebase

## 📋 Daftar Isi
1. [Persiapan Firebase](#persiapan-firebase)
2. [Konfigurasi Database](#konfigurasi-database)
3. [Struktur Database](#struktur-database)
4. [Fitur-Fitur Portal](#fitur-fitur-portal)
5. [Cara Penggunaan](#cara-penggunaan)
6. [Troubleshooting](#troubleshooting)

---

## 🔥 Persiapan Firebase

### Langkah 1: Buat Project Firebase

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Klik **"Add project"** atau **"Tambah project"**
3. Masukkan nama project: `adiwiyata-sdanaksaleh` (atau nama lain sesuai keinginan)
4. Ikuti wizard setup hingga selesai

### Langkah 2: Aktifkan Firestore Database

1. Di Firebase Console, pilih project Anda
2. Klik **"Firestore Database"** di menu sebelah kiri
3. Klik **"Create database"**
4. Pilih mode:
   - **Production mode** (untuk production)
   - **Test mode** (untuk development - lebih mudah untuk testing)
5. Pilih lokasi server (pilih yang terdekat, misalnya: `asia-southeast1`)
6. Klik **"Enable"**

### Langkah 3: Dapatkan Konfigurasi Firebase

1. Di Firebase Console, klik ikon **gear (⚙️)** di sebelah "Project Overview"
2. Pilih **"Project settings"**
3. Scroll ke bawah ke bagian **"Your apps"**
4. Klik ikon **Web (</> )**
5. Daftarkan app dengan nickname: `Portal BSA`
6. **JANGAN** centang "Also set up Firebase Hosting"
7. Klik **"Register app"**
8. Copy konfigurasi Firebase yang muncul

### Langkah 4: Update File Konfigurasi

Buka file `js/firebase-config.js` dan ganti dengan konfigurasi Anda:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "adiwiyata-sdanaksaleh.firebaseapp.com",
    databaseURL: "https://adiwiyata-sdanaksaleh-default-rtdb.firebaseio.com",
    projectId: "adiwiyata-sdanaksaleh",
    storageBucket: "adiwiyata-sdanaksaleh.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
};
```

---

## 🗄️ Konfigurasi Database

### Setup Security Rules (Opsional tapi Disarankan)

1. Di Firebase Console, buka **Firestore Database**
2. Klik tab **"Rules"**
3. Untuk **development**, gunakan rules berikut:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for all collections (DEVELOPMENT ONLY)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

4. Untuk **production**, gunakan rules yang lebih ketat:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Stats collection - read only
    match /stats/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Waste records - authenticated users only
    match /waste_records/{document} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null;
    }
    
    // Environmental impact - read only
    match /environmental_impact/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 📊 Struktur Database

Portal BSA menggunakan 3 collections utama di Firestore:

### 1. Collection: `stats`

Document ID: `current`

```json
{
  "organik": {
    "total": 0,
    "monthlyChange": 0
  },
  "anorganik": {
    "total": 0,
    "monthlyChange": 0
  },
  "b3": {
    "total": 0,
    "monthlyChange": 0
  },
  "lastUpdated": "2024-12-24T10:00:00.000Z"
}
```

### 2. Collection: `waste_records`

Setiap document merepresentasikan satu record penimbangan:

```json
{
  "date": "2024-12-24",
  "officer": "Budi Santoso",
  "type": "organik",
  "weight": 24.5,
  "status": "selesai",
  "timestamp": "2024-12-24T10:00:00.000Z",
  "createdAt": "2024-12-24T10:00:00.000Z"
}
```

**Field Descriptions:**
- `date`: Tanggal penimbangan (format: YYYY-MM-DD)
- `officer`: Nama petugas yang melakukan penimbangan
- `type`: Jenis sampah (`organik`, `anorganik`, atau `b3`)
- `weight`: Berat sampah dalam kilogram (number)
- `status`: Status penimbangan (`selesai` atau `pending`)
- `timestamp`: Timestamp untuk sorting dan filtering
- `createdAt`: Waktu record dibuat

### 3. Collection: `environmental_impact`

Document ID: `current`

```json
{
  "treesSaved": 120,
  "energySaved": 450,
  "co2Reduced": 360,
  "lastUpdated": "2024-12-24T10:00:00.000Z"
}
```

---

## ✨ Fitur-Fitur Portal

### 1. **Dashboard Real-time**
- Menampilkan statistik total sampah (Organik, Anorganik, B3)
- Persentase perubahan dari bulan sebelumnya
- Update otomatis saat ada data baru

### 2. **Grafik Interaktif**
- **Bar Chart**: Tren pengumpulan sampah bulanan
- **Doughnut Chart**: Komposisi jenis sampah
- Data diambil langsung dari Firebase

### 3. **Input Data Penimbangan**
- Form modal untuk input data baru
- Validasi input otomatis
- Auto-update statistik setelah input

### 4. **Tabel Riwayat Penimbangan**
- Menampilkan 10 record terakhir
- Filter berdasarkan:
  - Tanggal
  - Jenis sampah
  - Status
- Real-time update

### 5. **Dampak Lingkungan**
- Kalkulasi otomatis:
  - Pohon yang terselamatkan
  - Energi yang dihemat
  - CO2 yang dikurangi

### 6. **Dark Mode**
- Toggle dark/light theme
- Preferensi tersimpan di localStorage

---

## 🚀 Cara Penggunaan

### Menjalankan Portal

1. Pastikan Firebase sudah dikonfigurasi dengan benar
2. Jalankan Firebase hosting:
   ```bash
   firebase serve
   ```
3. Buka browser dan akses: `http://localhost:5000/portal-bsa.html`

### Menambah Data Penimbangan

1. Klik tombol **"Input Data Baru"** (hijau dengan icon +)
2. Isi form:
   - **Tanggal**: Pilih tanggal penimbangan
   - **Petugas**: Nama petugas yang menimbang
   - **Jenis Sampah**: Pilih Organik/Anorganik/B3
   - **Berat**: Masukkan berat dalam kg (bisa desimal, contoh: 24.5)
   - **Status**: Pilih Selesai/Pending
3. Klik **"Simpan"**
4. Data akan otomatis tersimpan dan dashboard akan update

### Menggunakan Filter

1. Pilih filter yang diinginkan:
   - **Tanggal**: Filter data dari tanggal tertentu
   - **Jenis**: Filter berdasarkan jenis sampah
   - **Status**: Filter berdasarkan status
2. Klik tombol **"Filter"**
3. Tabel akan menampilkan data yang sesuai filter

### Export PDF (Coming Soon)

Fitur export PDF sedang dalam pengembangan. Saat ini tombol akan menampilkan notifikasi.

---

## 🔧 Troubleshooting

### Error: "Firebase is not defined"

**Penyebab**: Firebase SDK belum dimuat dengan benar

**Solusi**:
1. Pastikan koneksi internet stabil
2. Cek apakah script Firebase SDK dimuat di `portal-bsa.html`:
   ```html
   <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
   <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
   ```
3. Buka Console Browser (F12) dan cek error

### Error: "Permission denied"

**Penyebab**: Firestore Security Rules terlalu ketat

**Solusi**:
1. Buka Firebase Console → Firestore Database → Rules
2. Untuk testing, gunakan rules yang mengizinkan semua akses:
   ```javascript
   allow read, write: if true;
   ```
3. **PENTING**: Jangan gunakan rules ini di production!

### Data Tidak Muncul

**Penyebab**: Database masih kosong atau konfigurasi salah

**Solusi**:
1. Cek konfigurasi di `js/firebase-config.js`
2. Buka Firebase Console dan cek apakah collections sudah ada
3. Coba tambah data manual melalui Firebase Console:
   - Buka Firestore Database
   - Klik "Start collection"
   - Collection ID: `stats`
   - Document ID: `current`
   - Tambahkan fields sesuai struktur di atas

### Chart Tidak Muncul

**Penyebab**: Chart.js belum dimuat atau data belum ada

**Solusi**:
1. Pastikan Chart.js dimuat:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
   ```
2. Cek Console Browser untuk error
3. Pastikan ada data di collection `waste_records`

### Stats Tidak Update Otomatis

**Penyebab**: Real-time listener tidak aktif

**Solusi**:
1. Refresh halaman
2. Cek Console Browser untuk error
3. Pastikan tidak ada error di `js/portal-bsa.js`

---

## 📝 Catatan Penting

### Untuk Development
- Gunakan Test Mode di Firestore untuk kemudahan testing
- Monitor penggunaan quota Firebase (gratis terbatas)
- Gunakan Firebase Emulator untuk development lokal (opsional)

### Untuk Production
- **WAJIB** setup Security Rules yang ketat
- Aktifkan Firebase Authentication untuk keamanan
- Monitor penggunaan database dan bandwidth
- Backup data secara berkala

### Optimasi
- Data chart di-cache untuk mengurangi read operations
- Real-time listeners hanya untuk data yang sering berubah
- Gunakan pagination untuk tabel dengan banyak data

---

## 🆘 Butuh Bantuan?

Jika mengalami masalah:

1. **Cek Console Browser** (F12 → Console tab)
2. **Cek Firebase Console** untuk error di database
3. **Cek Network tab** untuk melihat request yang gagal
4. **Dokumentasi Firebase**: https://firebase.google.com/docs/firestore

---

## 📚 Referensi

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Get Started](https://firebase.google.com/docs/firestore/quickstart)
- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Dibuat untuk**: SD Anak Saleh - Program Adiwiyata  
**Versi**: 1.0.0  
**Tanggal**: Desember 2024
