/**
 * Portal BSA - Bank Sampah Adiwiyata
 * Firebase Database Management
 */

// Database Collections
const COLLECTIONS = {
    WASTE_RECORDS: 'waste_records',
    STATS: 'stats',
    IMPACT: 'environmental_impact'
};

// Waste Types
const WASTE_TYPES = {
    ORGANIC: 'organik',
    INORGANIC: 'anorganik',
    B3: 'b3'
};

// ==================== STATS MANAGEMENT ====================

/**
 * Get current statistics
 */
async function getStats() {
    try {
        const statsRef = db.collection(COLLECTIONS.STATS).doc('current');
        const doc = await statsRef.get();

        if (doc.exists) {
            return doc.data();
        } else {
            // Initialize default stats
            const defaultStats = {
                organik: { total: 0, monthlyChange: 0 },
                anorganik: { total: 0, monthlyChange: 0 },
                b3: { total: 0, monthlyChange: 0 },
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            };
            await statsRef.set(defaultStats);
            return defaultStats;
        }
    } catch (error) {
        console.error('Error getting stats:', error);
        return null;
    }
}

/**
 * Update statistics
 */
async function updateStats(type, weight, isAdd = true) {
    try {
        const statsRef = db.collection(COLLECTIONS.STATS).doc('current');
        const increment = isAdd ? weight : -weight;

        await statsRef.update({
            [`${type}.total`]: firebase.firestore.FieldValue.increment(increment),
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });

        return true;
    } catch (error) {
        console.error('Error updating stats:', error);
        return false;
    }
}

/**
 * Calculate monthly changes
 */
async function calculateMonthlyChanges() {
    try {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const lastMonthData = await getMonthlyTotal(lastMonth);
        const thisMonthData = await getMonthlyTotal(thisMonth);

        const changes = {};
        for (const type of Object.values(WASTE_TYPES)) {
            const lastTotal = lastMonthData[type] || 0;
            const thisTotal = thisMonthData[type] || 0;
            changes[type] = lastTotal > 0 ? ((thisTotal - lastTotal) / lastTotal * 100).toFixed(1) : 0;
        }

        // Update stats with monthly changes
        const statsRef = db.collection(COLLECTIONS.STATS).doc('current');
        await statsRef.update({
            'organik.monthlyChange': parseFloat(changes.organik),
            'anorganik.monthlyChange': parseFloat(changes.anorganik),
            'b3.monthlyChange': parseFloat(changes.b3),
        });

        return changes;
    } catch (error) {
        console.error('Error calculating monthly changes:', error);
        return null;
    }
}

/**
 * Get monthly total for a specific month
 */
async function getMonthlyTotal(date) {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

    const snapshot = await db.collection(COLLECTIONS.WASTE_RECORDS)
        .where('timestamp', '>=', startOfMonth)
        .where('timestamp', '<=', endOfMonth)
        .get();

    const totals = { organik: 0, anorganik: 0, b3: 0 };
    snapshot.forEach(doc => {
        const data = doc.data();
        totals[data.type] = (totals[data.type] || 0) + data.weight;
    });

    return totals;
}

// ==================== WASTE RECORDS MANAGEMENT ====================

/**
 * Add new waste record
 */
async function addWasteRecord(data) {
    try {
        const record = {
            date: data.date || new Date().toISOString().split('T')[0],
            officer: data.officer || 'Admin Petugas',
            class: data.class || '-',
            type: data.type,
            weight: parseFloat(data.weight),
            status: data.status || 'selesai',
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            createdAt: new Date().toISOString()
        };

        // Add to database
        const docRef = await db.collection(COLLECTIONS.WASTE_RECORDS).add(record);

        // Update statistics
        await updateStats(record.type, record.weight, true);

        // Recalculate monthly changes
        await calculateMonthlyChanges();

        // Recalculate environmental impact
        await calculateEnvironmentalImpact();

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error adding waste record:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get waste records with optional filters
 */
async function getWasteRecords(filters = {}) {
    try {
        let query = db.collection(COLLECTIONS.WASTE_RECORDS);

        // Apply filters
        if (filters.type) {
            query = query.where('type', '==', filters.type);
        }
        if (filters.status) {
            query = query.where('status', '==', filters.status);
        }
        if (filters.startDate) {
            query = query.where('date', '>=', filters.startDate);
        }
        if (filters.endDate) {
            query = query.where('date', '<=', filters.endDate);
        }

        // Order by timestamp descending
        query = query.orderBy('timestamp', 'desc');

        // Limit results
        if (filters.limit) {
            query = query.limit(filters.limit);
        }

        const snapshot = await query.get();
        const records = [];

        snapshot.forEach(doc => {
            records.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return records;
    } catch (error) {
        console.error('Error getting waste records:', error);
        return [];
    }
}

/**
 * Update waste record
 */
async function updateWasteRecord(id, data) {
    try {
        const docRef = db.collection(COLLECTIONS.WASTE_RECORDS).doc(id);
        const oldDoc = await docRef.get();

        if (!oldDoc.exists) {
            throw new Error('Record not found');
        }

        const oldData = oldDoc.data();

        // Update the record
        await docRef.update({
            ...data,
            updatedAt: new Date().toISOString()
        });

        // If weight or type changed, update stats
        if (data.weight !== undefined || data.type !== undefined) {
            const oldWeight = oldData.weight;
            const oldType = oldData.type;
            const newWeight = data.weight !== undefined ? data.weight : oldWeight;
            const newType = data.type !== undefined ? data.type : oldType;

            // Subtract old values
            await updateStats(oldType, oldWeight, false);
            // Add new values
            await updateStats(newType, newWeight, true);

            // Recalculate monthly changes
            await calculateMonthlyChanges();

            // Recalculate environmental impact
            await calculateEnvironmentalImpact();
        }

        return { success: true };
    } catch (error) {
        console.error('Error updating waste record:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete waste record
 */
async function deleteWasteRecord(id) {
    try {
        const docRef = db.collection(COLLECTIONS.WASTE_RECORDS).doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            throw new Error('Record not found');
        }

        const data = doc.data();

        // Delete the record
        await docRef.delete();

        // Update statistics
        await updateStats(data.type, data.weight, false);

        // Recalculate monthly changes
        await calculateMonthlyChanges();

        // Recalculate environmental impact
        await calculateEnvironmentalImpact();

        return { success: true };
    } catch (error) {
        console.error('Error deleting waste record:', error);
        return { success: false, error: error.message };
    }
}

// ==================== CHART DATA ====================

/**
 * Get monthly chart data for the year
 */
async function getMonthlyChartData(year = new Date().getFullYear()) {
    try {
        const chartData = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
            organik: Array(12).fill(0),
            anorganik: Array(12).fill(0),
            b3: Array(12).fill(0)
        };

        // Get all records for the year
        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year, 11, 31, 23, 59, 59);

        const snapshot = await db.collection(COLLECTIONS.WASTE_RECORDS)
            .where('timestamp', '>=', startOfYear)
            .where('timestamp', '<=', endOfYear)
            .get();

        snapshot.forEach(doc => {
            const data = doc.data();
            const date = data.timestamp ? data.timestamp.toDate() : new Date(data.date);
            const month = date.getMonth();

            chartData[data.type][month] += data.weight;
        });

        return chartData;
    } catch (error) {
        console.error('Error getting chart data:', error);
        return null;
    }
}

/**
 * Get composition data for doughnut chart
 */
async function getCompositionData() {
    try {
        const stats = await getStats();

        if (!stats) return null;

        const total = stats.organik.total + stats.anorganik.total + stats.b3.total;

        if (total === 0) {
            return {
                labels: ['Organik', 'Anorganik', 'B3'],
                data: [0, 0, 0],
                percentages: [0, 0, 0]
            };
        }

        return {
            labels: ['Organik', 'Anorganik', 'B3'],
            data: [stats.organik.total, stats.anorganik.total, stats.b3.total],
            percentages: [
                ((stats.organik.total / total) * 100).toFixed(1),
                ((stats.anorganik.total / total) * 100).toFixed(1),
                ((stats.b3.total / total) * 100).toFixed(1)
            ]
        };
    } catch (error) {
        console.error('Error getting composition data:', error);
        return null;
    }
}

// ==================== ENVIRONMENTAL IMPACT ====================

/**
 * Calculate environmental impact
 */
async function calculateEnvironmentalImpact() {
    try {
        const stats = await getStats();

        if (!stats) return null;

        // Calculation formulas (these are estimates)
        // 1 kg of recycled waste = 0.05 trees saved
        // 1 kg of recycled waste = 2 kWh energy saved

        const totalWaste = stats.organik.total + stats.anorganik.total;

        const impact = {
            treesSaved: Math.round(totalWaste * 0.05),
            energySaved: Math.round(totalWaste * 2),
            co2Reduced: Math.round(totalWaste * 0.8), // kg CO2
            lastUpdated: new Date().toISOString()
        };

        // Save to database
        await db.collection(COLLECTIONS.IMPACT).doc('current').set(impact);

        return impact;
    } catch (error) {
        console.error('Error calculating environmental impact:', error);
        return null;
    }
}

/**
 * Get environmental impact
 */
async function getEnvironmentalImpact() {
    try {
        const doc = await db.collection(COLLECTIONS.IMPACT).doc('current').get();

        if (doc.exists) {
            return doc.data();
        } else {
            return await calculateEnvironmentalImpact();
        }
    } catch (error) {
        console.error('Error getting environmental impact:', error);
        return null;
    }
}

// ==================== REAL-TIME LISTENERS ====================

/**
 * Listen to stats changes
 */
function listenToStats(callback) {
    return db.collection(COLLECTIONS.STATS).doc('current')
        .onSnapshot(doc => {
            if (doc.exists) {
                callback(doc.data());
            }
        }, error => {
            console.error('Error listening to stats:', error);
        });
}

/**
 * Listen to waste records changes
 */
function listenToWasteRecords(callback, filters = {}) {
    let query = db.collection(COLLECTIONS.WASTE_RECORDS);

    // Apply filters
    if (filters.type) {
        query = query.where('type', '==', filters.type);
    }
    if (filters.status) {
        query = query.where('status', '==', filters.status);
    }

    query = query.orderBy('timestamp', 'desc');

    if (filters.limit) {
        query = query.limit(filters.limit);
    }

    return query.onSnapshot(snapshot => {
        const records = [];
        snapshot.forEach(doc => {
            records.push({
                id: doc.id,
                ...doc.data()
            });
        });
        callback(records);
    }, error => {
        console.error('Error listening to waste records:', error);
    });
}

// Export functions
window.bsaDB = {
    // Stats
    getStats,
    updateStats,
    calculateMonthlyChanges,

    // Waste Records
    addWasteRecord,
    getWasteRecords,
    updateWasteRecord,
    deleteWasteRecord,

    // Charts
    getMonthlyChartData,
    getCompositionData,

    // Environmental Impact
    calculateEnvironmentalImpact,
    getEnvironmentalImpact,

    // Real-time Listeners
    listenToStats,
    listenToWasteRecords,

    // Constants
    WASTE_TYPES,
    COLLECTIONS
};
