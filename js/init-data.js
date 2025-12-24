/**
 * Script untuk inisialisasi data awal Portal BSA
 * Jalankan script ini di Console Browser (F12) setelah Firebase dikonfigurasi
 * untuk membuat struktur database dan data contoh
 */

async function initializeBSAData() {
    console.log('🚀 Memulai inisialisasi data Portal BSA...');

    try {
        // 1. Inisialisasi Stats
        console.log('📊 Membuat collection stats...');
        await db.collection('stats').doc('current').set({
            organik: {
                total: 0,
                monthlyChange: 0
            },
            anorganik: {
                total: 0,
                monthlyChange: 0
            },
            b3: {
                total: 0,
                monthlyChange: 0
            },
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ Stats collection berhasil dibuat');

        // 2. Inisialisasi Environmental Impact
        console.log('🌳 Membuat collection environmental_impact...');
        await db.collection('environmental_impact').doc('current').set({
            treesSaved: 0,
            energySaved: 0,
            co2Reduced: 0,
            lastUpdated: new Date().toISOString()
        });
        console.log('✅ Environmental impact collection berhasil dibuat');

        // 3. Tambah data contoh (opsional)
        const addSampleData = confirm('Apakah Anda ingin menambahkan data contoh?');

        if (addSampleData) {
            console.log('📝 Menambahkan data contoh...');

            // Data contoh untuk bulan ini
            const sampleRecords = [
                {
                    date: '2024-12-20',
                    officer: 'Budi Santoso',
                    type: 'organik',
                    weight: 24.5,
                    status: 'selesai'
                },
                {
                    date: '2024-12-20',
                    officer: 'Siti Aminah',
                    type: 'anorganik',
                    weight: 15.2,
                    status: 'selesai'
                },
                {
                    date: '2024-12-21',
                    officer: 'Ahmad Rizky',
                    type: 'b3',
                    weight: 2.1,
                    status: 'pending'
                },
                {
                    date: '2024-12-21',
                    officer: 'Dewi Lestari',
                    type: 'organik',
                    weight: 18.7,
                    status: 'selesai'
                },
                {
                    date: '2024-12-22',
                    officer: 'Eko Prasetyo',
                    type: 'anorganik',
                    weight: 12.3,
                    status: 'selesai'
                },
                {
                    date: '2024-12-22',
                    officer: 'Fatimah Zahra',
                    type: 'organik',
                    weight: 21.8,
                    status: 'selesai'
                },
                {
                    date: '2024-12-23',
                    officer: 'Gunawan Wijaya',
                    type: 'b3',
                    weight: 1.5,
                    status: 'selesai'
                },
                {
                    date: '2024-12-23',
                    officer: 'Hana Pertiwi',
                    type: 'anorganik',
                    weight: 16.9,
                    status: 'selesai'
                },
                {
                    date: '2024-12-24',
                    officer: 'Irfan Hakim',
                    type: 'organik',
                    weight: 19.4,
                    status: 'selesai'
                },
                {
                    date: '2024-12-24',
                    officer: 'Jasmine Putri',
                    type: 'anorganik',
                    weight: 14.6,
                    status: 'pending'
                }
            ];

            // Tambahkan setiap record
            for (const record of sampleRecords) {
                await bsaDB.addWasteRecord(record);
                console.log(`✅ Data ditambahkan: ${record.date} - ${record.type} - ${record.weight}kg`);
            }

            console.log('✅ Semua data contoh berhasil ditambahkan');
        }

        console.log('🎉 Inisialisasi selesai!');
        console.log('📊 Silakan refresh halaman untuk melihat data');

        // Reload halaman setelah 2 detik
        setTimeout(() => {
            location.reload();
        }, 2000);

    } catch (error) {
        console.error('❌ Error saat inisialisasi:', error);
        alert('Terjadi error saat inisialisasi. Cek console untuk detail.');
    }
}

// Fungsi untuk reset semua data (HATI-HATI!)
async function resetAllBSAData() {
    const confirmReset = confirm('⚠️ PERINGATAN: Ini akan menghapus SEMUA data Portal BSA!\n\nApakah Anda yakin ingin melanjutkan?');

    if (!confirmReset) {
        console.log('❌ Reset dibatalkan');
        return;
    }

    const doubleConfirm = confirm('Konfirmasi sekali lagi: Hapus SEMUA data?');

    if (!doubleConfirm) {
        console.log('❌ Reset dibatalkan');
        return;
    }

    try {
        console.log('🗑️ Menghapus semua data...');

        // Hapus semua waste records
        const recordsSnapshot = await db.collection('waste_records').get();
        const deletePromises = [];

        recordsSnapshot.forEach(doc => {
            deletePromises.push(doc.ref.delete());
        });

        await Promise.all(deletePromises);
        console.log(`✅ ${deletePromises.length} waste records dihapus`);

        // Reset stats
        await db.collection('stats').doc('current').set({
            organik: { total: 0, monthlyChange: 0 },
            anorganik: { total: 0, monthlyChange: 0 },
            b3: { total: 0, monthlyChange: 0 },
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ Stats direset');

        // Reset environmental impact
        await db.collection('environmental_impact').doc('current').set({
            treesSaved: 0,
            energySaved: 0,
            co2Reduced: 0,
            lastUpdated: new Date().toISOString()
        });
        console.log('✅ Environmental impact direset');

        console.log('🎉 Reset selesai!');

        // Reload halaman
        setTimeout(() => {
            location.reload();
        }, 2000);

    } catch (error) {
        console.error('❌ Error saat reset:', error);
        alert('Terjadi error saat reset. Cek console untuk detail.');
    }
}

// Fungsi untuk export data ke JSON
async function exportBSADataToJSON() {
    try {
        console.log('📥 Mengekspor data...');

        // Get all data
        const stats = await bsaDB.getStats();
        const records = await bsaDB.getWasteRecords({ limit: 1000 });
        const impact = await bsaDB.getEnvironmentalImpact();

        const exportData = {
            exportDate: new Date().toISOString(),
            stats: stats,
            records: records,
            environmentalImpact: impact
        };

        // Create download link
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `portal-bsa-export-${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        console.log('✅ Data berhasil diekspor');

    } catch (error) {
        console.error('❌ Error saat export:', error);
        alert('Terjadi error saat export. Cek console untuk detail.');
    }
}

// Fungsi untuk menampilkan statistik database
async function showBSAStats() {
    try {
        console.log('📊 Mengambil statistik database...');

        const stats = await bsaDB.getStats();
        const recordsSnapshot = await db.collection('waste_records').get();
        const impact = await bsaDB.getEnvironmentalImpact();

        console.log('\n=== STATISTIK PORTAL BSA ===\n');
        console.log('📦 Total Records:', recordsSnapshot.size);
        console.log('\n🗑️ Total Sampah:');
        console.log('  - Organik:', stats.organik.total, 'kg');
        console.log('  - Anorganik:', stats.anorganik.total, 'kg');
        console.log('  - B3:', stats.b3.total, 'kg');
        console.log('  - TOTAL:', (stats.organik.total + stats.anorganik.total + stats.b3.total).toFixed(2), 'kg');
        console.log('\n📈 Perubahan Bulanan:');
        console.log('  - Organik:', stats.organik.monthlyChange + '%');
        console.log('  - Anorganik:', stats.anorganik.monthlyChange + '%');
        console.log('  - B3:', stats.b3.monthlyChange + '%');
        console.log('\n🌍 Dampak Lingkungan:');
        console.log('  - Pohon Terselamatkan:', impact.treesSaved);
        console.log('  - Energi Dihemat:', impact.energySaved, 'kWh');
        console.log('  - CO2 Dikurangi:', impact.co2Reduced, 'kg');
        console.log('\n===========================\n');

    } catch (error) {
        console.error('❌ Error saat mengambil statistik:', error);
    }
}

// Instruksi penggunaan
console.log(`
╔════════════════════════════════════════════════════════════╗
║          PORTAL BSA - INITIALIZATION SCRIPT                ║
╚════════════════════════════════════════════════════════════╝

Fungsi yang tersedia:

1. initializeBSAData()
   → Inisialisasi database dan tambah data contoh

2. resetAllBSAData()
   → Reset semua data (HATI-HATI!)

3. exportBSADataToJSON()
   → Export semua data ke file JSON

4. showBSAStats()
   → Tampilkan statistik database

Cara menggunakan:
1. Buka Console Browser (F12)
2. Ketik nama fungsi dan tekan Enter
   Contoh: initializeBSAData()

`);
