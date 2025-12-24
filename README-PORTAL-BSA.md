# 🌱 Portal BSA - Bank Sampah Adiwiyata

Portal monitoring dan manajemen data Bank Sampah untuk SD Anak Saleh dengan integrasi Firebase.

## 🚀 Quick Start

### 1. Setup Firebase (5 menit)

1. **Buat Project Firebase**
   - Buka https://console.firebase.google.com/
   - Klik "Add project"
   - Nama: `adiwiyata-sdanaksaleh`

2. **Aktifkan Firestore**
   - Di Firebase Console → Firestore Database
   - Klik "Create database"
   - Pilih "Test mode" (untuk development)
   - Pilih lokasi: `asia-southeast1`

3. **Dapatkan Konfigurasi**
   - Project Settings (⚙️) → Your apps
   - Klik icon Web (`</>`)
   - Copy konfigurasi Firebase

4. **Update Konfigurasi**
   - Buka file: `js/firebase-config.js`
   - Ganti dengan konfigurasi Anda

### 2. Inisialisasi Database

**Cara 1: Menggunakan Setup Page (Recommended)**

```bash
# Jalankan Firebase serve
firebase serve

# Buka di browser
http://localhost:5000/setup-bsa.html
```

Klik tombol:
1. ✅ Cek koneksi akan otomatis
2. 🔧 "Inisialisasi Database"
3. 📝 "Tambah Data Contoh" (opsional)

**Cara 2: Manual via Console Browser**

```bash
# Buka portal
http://localhost:5000/portal-bsa.html

# Buka Console (F12)
# Load script init
var script = document.createElement('script');
script.src = './js/init-data.js';
document.head.appendChild(script);

# Jalankan inisialisasi
initializeBSAData()
```

### 3. Akses Portal

```bash
http://localhost:5000/portal-bsa.html
```

## 📁 Struktur File

```
├── portal-bsa.html          # Halaman utama portal
├── setup-bsa.html           # Halaman setup database
├── js/
│   ├── firebase-config.js   # Konfigurasi Firebase (EDIT INI!)
│   ├── bsa-database.js      # Fungsi database
│   ├── portal-bsa.js        # UI controller
│   └── init-data.js         # Script inisialisasi
└── PORTAL-BSA-SETUP.md      # Dokumentasi lengkap
```

## ✨ Fitur

- ✅ **Real-time Dashboard** - Update otomatis saat ada data baru
- 📊 **Grafik Interaktif** - Bar chart & doughnut chart
- 📝 **Input Data** - Form modal untuk tambah data
- 🔍 **Filter & Search** - Filter berdasarkan tanggal, jenis, status
- 🌍 **Dampak Lingkungan** - Kalkulasi otomatis pohon & energi
- 🌓 **Dark Mode** - Toggle tema gelap/terang

## 🗄️ Struktur Database

### Collections:

1. **`stats`** - Statistik total sampah
2. **`waste_records`** - Record penimbangan
3. **`environmental_impact`** - Dampak lingkungan

Detail struktur: lihat `PORTAL-BSA-SETUP.md`

## 📖 Dokumentasi

- **Setup Lengkap**: `PORTAL-BSA-SETUP.md`
- **Firebase Docs**: https://firebase.google.com/docs/firestore

## 🆘 Troubleshooting

### Firebase tidak terhubung?

1. Cek konfigurasi di `js/firebase-config.js`
2. Pastikan Firestore sudah diaktifkan
3. Cek Security Rules (gunakan Test mode untuk development)

### Data tidak muncul?

1. Buka `setup-bsa.html` untuk inisialisasi
2. Atau jalankan `initializeBSAData()` di Console

### Error "Permission denied"?

1. Buka Firebase Console → Firestore → Rules
2. Gunakan Test mode:
   ```
   allow read, write: if true;
   ```

## 🔐 Security (Production)

**PENTING**: Sebelum production, ubah Firestore Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /stats/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /waste_records/{document} {
      allow read: if true;
      allow create, update, delete: if request.auth != null;
    }
    match /environmental_impact/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

Dan implementasikan Firebase Authentication.

## 📞 Support

Jika ada masalah:
1. Cek Console Browser (F12) untuk error
2. Lihat dokumentasi lengkap di `PORTAL-BSA-SETUP.md`
3. Cek Firebase Console untuk error database

---

**Dibuat untuk**: SD Anak Saleh - Program Adiwiyata  
**Versi**: 1.0.0  
**Tanggal**: Desember 2024
