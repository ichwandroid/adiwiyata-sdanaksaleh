document.addEventListener('DOMContentLoaded', () => {
    const loadingEl = document.getElementById('loading');
    const pohonInfoEl = document.getElementById('pohon-info');
    const errorEl = document.getElementById('error');

    const tampilkanInfoPohon = (pohon) => {
        document.getElementById('pohon-gambar').src = pohon.gambar;
        document.getElementById('pohon-gambar').alt = `Gambar ${pohon.nama}`;
        document.getElementById('pohon-nama').textContent = pohon.nama;
        document.getElementById('pohon-nama-latin').textContent = pohon.nama_latin;
        document.getElementById('pohon-deskripsi').textContent = pohon.deskripsi;
        document.getElementById('pohon-perawatan').textContent = pohon.perawatan;

        const manfaatListEl = document.getElementById('pohon-manfaat');
        manfaatListEl.innerHTML = '';
        pohon.manfaat.forEach(manfaat => {
            const li = document.createElement('li');
            li.textContent = manfaat;
            li.classList.add('animate-element');
            manfaatListEl.appendChild(li);
        });

        loadingEl.style.display = 'none';
        pohonInfoEl.classList.remove('hidden');
        document.title = `Informasi ${pohon.nama}`;

        gsap.set(".animate-element", { opacity: 0, y: 30 });
        gsap.set("#pohon-info", { scale: 0.95, opacity: 0 });

        const tl = gsap.timeline();
        tl.to("#pohon-info", { duration: 0.6, scale: 1, opacity: 1, ease: "power2.out" })
          .to("#pohon-gambar", { duration: 0.8, opacity: 1, scale: 1, ease: "power2.out" }, "-=0.4")
          .to("#pohon-nama", { duration: 0.5, opacity: 1, y: 0, ease: "back.out(1.7)" }, "-=0.5")
          .to("#pohon-nama-latin", { duration: 0.5, opacity: 1, y: 0, ease: "power2.out" }, "-=0.3")
          .to("#pohon-deskripsi", { duration: 0.5, opacity: 1, y: 0, ease: "power2.out" }, "-=0.3")
          .to(".animate-element", { duration: 0.6, opacity: 1, y: 0, stagger: 0.1, ease: "power2.out" }, "-=0.3");

        // --- LOGIKA QR CODE DENGAN LOGO ---
        const currentUrl = window.location.href;
        const qrcodeContainer = document.getElementById('qrcode');
        qrcodeContainer.innerHTML = ''; // Bersihkan

        // 1. Buat QR Code terlebih dahulu
        new QRCode(qrcodeContainer, {
            text: currentUrl,
            width: 128,
            height: 128,
            colorDark: "#105632", // Ubah warna jadi hijau tua agar lebih tematik
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H // Gunakan level koreksi tinggi
        });

        // 2. Buat elemen gambar untuk logo
        const logoImg = document.createElement('img');
        logoImg.src = 'https://imgur.com/8Ksu8Dz.png'; // URL logo daun sederhana
        logoImg.alt = 'Logo';
        logoImg.className = 'qrcode-logo'; // Terapkan class CSS yang sudah kita buat

        // 3. Tambahkan logo ke dalam wadah QR Code
        qrcodeContainer.appendChild(logoImg);

        // --- TAMBAHKAN LOGIKA DOWNLOAD QR CODE DI SINI ---
        qrcodeContainer.addEventListener('click', () => {
            // Cari elemen <canvas> yang dibuat oleh library qrcode.js
            const canvas = qrcodeContainer.querySelector('canvas');
            
            if (canvas) {
                // Konversi konten canvas menjadi URL data (format gambar)
                const url = canvas.toDataURL('image/png');
                
                // Buat elemen <a> sementara untuk memicu download
                const link = document.createElement('a');
                link.href = url;
                
                // Buat nama file yang unik dan deskriptif
                // Contoh: 'qrcode-sukun.png'
                const fileName = `qrcode-${pohon.nama.toLowerCase().replace(/\s+/g, '-')}.png`;
                link.download = fileName;
                
                // Tambahkan link ke dokumen, klik, lalu hapus
                document.body.appendChild(link); // Diperlukan untuk kompatibilitas browser
                link.click();
                document.body.removeChild(link);
            }
        });
        // --- AKHIR DARI LOGIKA DOWNLOAD ---
    };

    const tampilkanError = () => {
        loadingEl.style.display = 'none';
        errorEl.classList.remove('hidden');
        gsap.fromTo("#error", { scale: 0.8, opacity: 0 }, { duration: 0.5, scale: 1, opacity: 1, ease: "back.out(1.7)" });
    };

    const urlParams = new URLSearchParams(window.location.search);
    const pohonId = urlParams.get('pohon');

    if (pohonId) {
        fetch('data/pohon.json')
            .then(response => {
                if (!response.ok) throw new Error('Gagal memuat data tumbuhan.');
                return response.json();
            })
            .then(data => {
                const pohonDitemukan = data.find(p => p.id === pohonId);
                if (pohonDitemukan) {
                    tampilkanInfoPohon(pohonDitemukan);
                } else {
                    tampilkanError();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                tampilkanError();
            });
    } else {
        tampilkanError();
    }
});