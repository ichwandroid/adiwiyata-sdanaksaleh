/**
 * Portal BSA - UI Controller
 * Manages all UI interactions and data binding
 */

// Global variables
let mainChart = null;
let doughnutChart = null;
let statsUnsubscribe = null;
let recordsUnsubscribe = null;

// ==================== INITIALIZATION ====================

/**
 * Initialize the portal
 */
async function initPortal() {
    try {
        console.log('Initializing Portal BSA...');

        // Load initial data
        await loadStats();
        await loadRecentRecords();
        await loadCharts();
        await loadEnvironmentalImpact();

        // Setup real-time listeners
        setupRealtimeListeners();

        // Setup event listeners
        setupEventListeners();

        console.log('Portal BSA initialized successfully!');
    } catch (error) {
        console.error('Error initializing portal:', error);
        showNotification('Gagal memuat data. Silakan refresh halaman.', 'error');
    }
}

// ==================== STATS LOADING ====================

/**
 * Load and display statistics
 */
async function loadStats() {
    try {
        const stats = await bsaDB.getStats();

        if (stats) {
            updateStatsUI(stats);
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

/**
 * Update stats UI
 */
function updateStatsUI(stats) {
    // Update Organik
    const organikTotal = document.querySelector('[data-stat="organik-total"]');
    const organikChange = document.querySelector('[data-stat="organik-change"]');
    if (organikTotal) organikTotal.textContent = stats.organik.total.toFixed(1);
    if (organikChange) {
        const change = stats.organik.monthlyChange;
        organikChange.textContent = `${change > 0 ? '+' : ''}${change}% dari bulan lalu`;
        organikChange.parentElement.className = change >= 0
            ? 'mt-4 flex items-center gap-2 text-sm text-adi-green-600 bg-adi-green-50 w-fit px-2 py-1 rounded-md'
            : 'mt-4 flex items-center gap-2 text-sm text-adi-red-600 bg-adi-red-50 w-fit px-2 py-1 rounded-md';
    }

    // Update Anorganik
    const anorganikTotal = document.querySelector('[data-stat="anorganik-total"]');
    const anorganikChange = document.querySelector('[data-stat="anorganik-change"]');
    if (anorganikTotal) anorganikTotal.textContent = stats.anorganik.total.toFixed(1);
    if (anorganikChange) {
        const change = stats.anorganik.monthlyChange;
        anorganikChange.textContent = `${change > 0 ? '+' : ''}${change}% dari bulan lalu`;
        anorganikChange.parentElement.className = change >= 0
            ? 'mt-4 flex items-center gap-2 text-sm text-adi-blue-600 bg-adi-blue-50 w-fit px-2 py-1 rounded-md'
            : 'mt-4 flex items-center gap-2 text-sm text-adi-red-600 bg-adi-red-50 w-fit px-2 py-1 rounded-md';
    }

    // Update B3
    const b3Total = document.querySelector('[data-stat="b3-total"]');
    const b3Change = document.querySelector('[data-stat="b3-change"]');
    if (b3Total) b3Total.textContent = stats.b3.total.toFixed(1);
    if (b3Change) {
        const change = stats.b3.monthlyChange;
        b3Change.textContent = `${change > 0 ? '+' : ''}${change}% dari bulan lalu`;
        // For B3, negative is good
        b3Change.parentElement.className = change <= 0
            ? 'mt-4 flex items-center gap-2 text-sm text-adi-green-600 bg-adi-green-50 w-fit px-2 py-1 rounded-md'
            : 'mt-4 flex items-center gap-2 text-sm text-adi-red-600 bg-adi-red-50 w-fit px-2 py-1 rounded-md';
    }
}

// ==================== RECORDS LOADING ====================

/**
 * Load recent records
 */
async function loadRecentRecords(filters = {}) {
    try {
        const records = await bsaDB.getWasteRecords({ ...filters, limit: 10 });
        updateRecordsTable(records);
    } catch (error) {
        console.error('Error loading records:', error);
    }
}

/**
 * Update records table
 */
function updateRecordsTable(records) {
    const tbody = document.querySelector('#recordsTable tbody');

    if (!tbody) return;

    if (records.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="py-8 text-center text-slate-400">
                    Belum ada data penimbangan
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = records.map(record => {
        const typeColors = {
            organik: 'text-adi-green-600',
            anorganik: 'text-adi-blue-600',
            b3: 'text-adi-red-600'
        };

        const statusBadges = {
            selesai: 'px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs',
            pending: 'px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs'
        };

        const typeLabels = {
            organik: 'Organik',
            anorganik: 'Anorganik',
            b3: 'B3'
        };

        const statusLabels = {
            selesai: 'Selesai',
            pending: 'Pending'
        };

        return `
            <tr class="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-50 dark:border-slate-700" data-record-id="${record.id}">
                <td class="py-4 px-2">${formatDate(record.date)}</td>
                <td class="py-4 px-2">
                    <div class="flex items-center gap-2">
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(record.officer)}&background=random&size=24" 
                             class="rounded-full" alt="${record.officer}">
                        <div>
                            <div>${record.officer}</div>
                            <div class="text-xs text-slate-400">${record.class || '-'}</div>
                        </div>
                    </div>
                </td>
                <td class="py-4 px-2 ${typeColors[record.type]}">${typeLabels[record.type]}</td>
                <td class="py-4 px-2">${record.weight.toFixed(1)}</td>
                <td class="py-4 px-2">
                    <span class="${statusBadges[record.status]}">${statusLabels[record.status]}</span>
                </td>
                <td class="py-4 px-2">
                    <div class="flex gap-2 justify-end">
                        <button onclick="editRecord('${record.id}')" 
                            class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                            title="Edit">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </button>
                        <button onclick="deleteRecord('${record.id}')" 
                            class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                            title="Hapus">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Format date to Indonesian format
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

// ==================== CHARTS ====================

/**
 * Load and render charts
 */
async function loadCharts() {
    try {
        await loadMainChart();
        await loadDoughnutChart();
    } catch (error) {
        console.error('Error loading charts:', error);
    }
}

/**
 * Load main bar chart
 */
async function loadMainChart() {
    const chartData = await bsaDB.getMonthlyChartData();

    if (!chartData) return;

    const ctx = document.getElementById('mainChart');
    if (!ctx) return;

    // Destroy existing chart if any
    if (mainChart) {
        mainChart.destroy();
    }

    mainChart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: chartData.labels,
            datasets: [
                {
                    label: 'Organik',
                    data: chartData.organik,
                    backgroundColor: '#22c55e',
                    borderRadius: 4,
                },
                {
                    label: 'Anorganik',
                    data: chartData.anorganik,
                    backgroundColor: '#0ea5e9',
                    borderRadius: 4,
                },
                {
                    label: 'B3',
                    data: chartData.b3,
                    backgroundColor: '#ef4444',
                    borderRadius: 4,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    align: 'end',
                    labels: {
                        usePointStyle: true,
                        boxWidth: 8,
                        font: { family: 'Outfit', size: 12 }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#f1f5f9' },
                    ticks: { font: { family: 'Outfit' } }
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { family: 'Outfit' } }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false,
            },
        }
    });
}

/**
 * Load doughnut chart
 */
async function loadDoughnutChart() {
    const compositionData = await bsaDB.getCompositionData();

    if (!compositionData) return;

    const ctx = document.getElementById('doughnutChart');
    if (!ctx) return;

    // Destroy existing chart if any
    if (doughnutChart) {
        doughnutChart.destroy();
    }

    doughnutChart = new Chart(ctx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: compositionData.labels,
            datasets: [{
                data: compositionData.data,
                backgroundColor: ['#22c55e', '#0ea5e9', '#ef4444'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const percentage = compositionData.percentages[context.dataIndex];
                            return `${label}: ${value.toFixed(1)} kg (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '75%',
        }
    });
}

// ==================== ENVIRONMENTAL IMPACT ====================

/**
 * Load environmental impact
 */
async function loadEnvironmentalImpact() {
    try {
        const impact = await bsaDB.getEnvironmentalImpact();

        if (impact) {
            updateImpactUI(impact);
        }
    } catch (error) {
        console.error('Error loading environmental impact:', error);
    }
}

/**
 * Update impact UI
 */
function updateImpactUI(impact) {
    const treesElement = document.querySelector('[data-impact="trees"]');
    const energyElement = document.querySelector('[data-impact="energy"]');

    if (treesElement) treesElement.textContent = impact.treesSaved;
    if (energyElement) energyElement.textContent = `${impact.energySaved} kwh`;
}

// ==================== REAL-TIME LISTENERS ====================

/**
 * Setup real-time listeners
 */
function setupRealtimeListeners() {
    // Listen to stats changes
    statsUnsubscribe = bsaDB.listenToStats((stats) => {
        updateStatsUI(stats);
    });

    // Listen to records changes
    recordsUnsubscribe = bsaDB.listenToWasteRecords((records) => {
        updateRecordsTable(records);
    }, { limit: 10 });

    // Listen to environmental impact changes
    db.collection('environmental_impact').doc('current')
        .onSnapshot(doc => {
            if (doc.exists) {
                updateImpactUI(doc.data());
            }
        });
}

/**
 * Cleanup listeners
 */
function cleanupListeners() {
    if (statsUnsubscribe) statsUnsubscribe();
    if (recordsUnsubscribe) recordsUnsubscribe();
}

// ==================== EVENT LISTENERS ====================

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Input Data Baru button
    const inputDataBtn = document.querySelector('[data-action="input-data"]');
    if (inputDataBtn) {
        inputDataBtn.addEventListener('click', showInputModal);
    }

    // Export PDF button
    const exportPdfBtn = document.querySelector('[data-action="export-pdf"]');
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', exportToPDF);
    }

    // Filter button
    const filterBtn = document.querySelector('[data-action="filter"]');
    if (filterBtn) {
        filterBtn.addEventListener('click', applyFilters);
    }

    // Filter inputs change
    const filterInputs = document.querySelectorAll('[data-filter]');
    filterInputs.forEach(input => {
        input.addEventListener('change', applyFilters);
    });
}

// ==================== MODAL MANAGEMENT ====================

/**
 * Show input modal
 */
function showInputModal() {
    // Create modal HTML
    const modalHTML = `
        <div id="inputModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-[fadeInUp_0.3s_ease-out]">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-bold text-slate-800 dark:text-white">Input Data Penimbangan</h3>
                    <button onclick="closeInputModal()" class="text-slate-400 hover:text-slate-600">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                
                <form id="inputDataForm" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tanggal</label>
                        <input type="date" name="date" required
                            class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-adi-green-500 focus:border-transparent"
                            value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Petugas</label>
                        <input type="text" name="officer" required
                            class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-adi-green-500 focus:border-transparent"
                            placeholder="Nama Petugas">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Kelas</label>
                        <select name="class" required
                            class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-adi-green-500 focus:border-transparent">
                            <option value="">Pilih Kelas</option>
                            <option value="1A">1A</option>
                            <option value="1B">1B</option>
                            <option value="1C">1C</option>
                            <option value="1D">1D</option>
                            <option value="2A">2A</option>
                            <option value="2B">2B</option>
                            <option value="2C">2C</option>
                            <option value="2D">2D</option>
                            <option value="3A">3A</option>
                            <option value="3B">3B</option>
                            <option value="3C">3C</option>
                            <option value="3D">3D</option>
                            <option value="4A">4A</option>
                            <option value="4B">4B</option>
                            <option value="4C">4C</option>
                            <option value="4D">4D</option>
                            <option value="5A">5A</option>
                            <option value="5B">5B</option>
                            <option value="5C">5C</option>
                            <option value="5D">5D</option>
                            <option value="6A">6A</option>
                            <option value="6B">6B</option>
                            <option value="6C">6C</option>
                            <option value="6D">6D</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Jenis Sampah</label>
                        <select name="type" required
                            class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-adi-green-500 focus:border-transparent">
                            <option value="">Pilih Jenis</option>
                            <option value="organik">Organik</option>
                            <option value="anorganik">Anorganik</option>
                            <option value="b3">B3</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Berat (Kg)</label>
                        <input type="number" name="weight" step="0.1" min="0" required
                            class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-adi-green-500 focus:border-transparent"
                            placeholder="0.0">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Status</label>
                        <select name="status" required
                            class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-adi-green-500 focus:border-transparent">
                            <option value="selesai">Selesai</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>
                    
                    <div class="flex gap-3 pt-4">
                        <button type="button" onclick="closeInputModal()"
                            class="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium">
                            Batal
                        </button>
                        <button type="submit"
                            class="flex-1 px-4 py-2 bg-adi-green-600 text-white rounded-lg hover:bg-adi-green-700 font-medium">
                            Simpan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Add to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Setup form submit
    const form = document.getElementById('inputDataForm');
    form.addEventListener('submit', handleInputSubmit);
}

/**
 * Close input modal
 */
function closeInputModal() {
    const modal = document.getElementById('inputModal');
    if (modal) {
        modal.remove();
    }
}

/**
 * Handle input form submit
 */
async function handleInputSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = {
        date: formData.get('date'),
        officer: formData.get('officer'),
        class: formData.get('class'),
        type: formData.get('type'),
        weight: parseFloat(formData.get('weight')),
        status: formData.get('status')
    };

    // Show loading
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Menyimpan...';
    submitBtn.disabled = true;

    try {
        const result = await bsaDB.addWasteRecord(data);

        if (result.success) {
            showNotification('Data berhasil disimpan!', 'success');
            closeInputModal();

            // Reload data
            await loadStats();
            await loadCharts();
            await loadEnvironmentalImpact();
        } else {
            showNotification('Gagal menyimpan data: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Error submitting data:', error);
        showNotification('Terjadi kesalahan saat menyimpan data', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// ==================== FILTERS ====================

/**
 * Apply filters
 */
async function applyFilters() {
    const dateFilter = document.querySelector('[data-filter="date"]');
    const typeFilter = document.querySelector('[data-filter="type"]');
    const statusFilter = document.querySelector('[data-filter="status"]');

    const filters = {};

    if (dateFilter && dateFilter.value) {
        filters.startDate = dateFilter.value;
    }

    if (typeFilter && typeFilter.value) {
        filters.type = typeFilter.value;
    }

    if (statusFilter && statusFilter.value) {
        filters.status = statusFilter.value;
    }

    await loadRecentRecords(filters);
}

// ==================== EXPORT ====================

/**
 * Export to PDF
 */
function exportToPDF() {
    showNotification('Fitur export PDF akan segera tersedia', 'info');
    // TODO: Implement PDF export using jsPDF or similar library
}

// ==================== NOTIFICATIONS ====================

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500'
    };

    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-[fadeInUp_0.3s_ease-out]`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ==================== EDIT & DELETE RECORDS ====================

/**
 * Edit record
 */
async function editRecord(recordId) {
    try {
        // Get record data
        const records = await bsaDB.getWasteRecords({});
        const record = records.find(r => r.id === recordId);

        if (!record) {
            showNotification('Data tidak ditemukan', 'error');
            return;
        }

        // Create edit modal
        const modalHTML = `
            <div id="editModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-[fadeInUp_0.3s_ease-out]">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-xl font-bold text-slate-800 dark:text-white">Edit Data Penimbangan</h3>
                        <button onclick="closeEditModal()" class="text-slate-400 hover:text-slate-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <form id="editDataForm" class="space-y-4">
                        <input type="hidden" name="recordId" value="${recordId}">
                        
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tanggal</label>
                            <input type="date" name="date" required
                                class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-adi-green-500 focus:border-transparent"
                                value="${record.date}">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Petugas</label>
                            <input type="text" name="officer" required
                                class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-adi-green-500 focus:border-transparent"
                                value="${record.officer}">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Kelas</label>
                            <select name="class" required
                                class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-adi-green-500 focus:border-transparent">
                                <option value="">Pilih Kelas</option>
                                ${['1A', '1B', '1C', '1D', '2A', '2B', '2C', '2D', '3A', '3B', '3C', '3D', '4A', '4B', '4C', '4D', '5A', '5B', '5C', '5D', '6A', '6B', '6C', '6D']
                .map(c => `<option value="${c}" ${record.class === c ? 'selected' : ''}>${c}</option>`).join('')}
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Jenis Sampah</label>
                            <select name="type" required
                                class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-adi-green-500 focus:border-transparent">
                                <option value="organik" ${record.type === 'organik' ? 'selected' : ''}>Organik</option>
                                <option value="anorganik" ${record.type === 'anorganik' ? 'selected' : ''}>Anorganik</option>
                                <option value="b3" ${record.type === 'b3' ? 'selected' : ''}>B3</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Berat (Kg)</label>
                            <input type="number" name="weight" step="0.1" min="0" required
                                class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-adi-green-500 focus:border-transparent"
                                value="${record.weight}">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Status</label>
                            <select name="status" required
                                class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-adi-green-500 focus:border-transparent">
                                <option value="selesai" ${record.status === 'selesai' ? 'selected' : ''}>Selesai</option>
                                <option value="pending" ${record.status === 'pending' ? 'selected' : ''}>Pending</option>
                            </select>
                        </div>
                        
                        <div class="flex gap-3 pt-4">
                            <button type="button" onclick="closeEditModal()"
                                class="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium">
                                Batal
                            </button>
                            <button type="submit"
                                class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                                Update
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Setup form submit
        const form = document.getElementById('editDataForm');
        form.addEventListener('submit', handleEditSubmit);

    } catch (error) {
        console.error('Error editing record:', error);
        showNotification('Gagal memuat data', 'error');
    }
}

/**
 * Close edit modal
 */
function closeEditModal() {
    const modal = document.getElementById('editModal');
    if (modal) {
        modal.remove();
    }
}

/**
 * Handle edit form submit
 */
async function handleEditSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const recordId = formData.get('recordId');
    const data = {
        date: formData.get('date'),
        officer: formData.get('officer'),
        class: formData.get('class'),
        type: formData.get('type'),
        weight: parseFloat(formData.get('weight')),
        status: formData.get('status')
    };

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Mengupdate...';
    submitBtn.disabled = true;

    try {
        const result = await bsaDB.updateWasteRecord(recordId, data);

        if (result.success) {
            showNotification('Data berhasil diupdate!', 'success');
            closeEditModal();

            // Reload data
            await loadStats();
            await loadCharts();
            await loadEnvironmentalImpact();
        } else {
            showNotification('Gagal mengupdate data: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Error updating data:', error);
        showNotification('Terjadi kesalahan saat mengupdate data', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

/**
 * Delete record
 */
async function deleteRecord(recordId) {
    const confirmed = confirm('Apakah Anda yakin ingin menghapus data ini?\n\nData yang sudah dihapus tidak dapat dikembalikan.');

    if (!confirmed) return;

    try {
        showNotification('Menghapus data...', 'info');

        const result = await bsaDB.deleteWasteRecord(recordId);

        if (result.success) {
            showNotification('Data berhasil dihapus!', 'success');

            // Reload data
            await loadStats();
            await loadCharts();
            await loadEnvironmentalImpact();
        } else {
            showNotification('Gagal menghapus data: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Error deleting data:', error);
        showNotification('Terjadi kesalahan saat menghapus data', 'error');
    }
}

// ==================== WINDOW LOAD ====================

// Make functions globally available
window.closeInputModal = closeInputModal;
window.closeEditModal = closeEditModal;
window.editRecord = editRecord;
window.deleteRecord = deleteRecord;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortal);
} else {
    initPortal();
}

// Cleanup on page unload
window.addEventListener('beforeunload', cleanupListeners);
