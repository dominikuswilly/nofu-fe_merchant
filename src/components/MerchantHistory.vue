<template>
  <div class="merchant-history">
    <div class="filters">
      <button 
        v-for="filter in filters" 
        :key="filter.value"
        class="filter-btn"
        :class="{ active: currentFilter === filter.value }"
        @click="switchFilter(filter.value)"
      >
        {{ filter.label }}
      </button>
    </div>

    <div class="history-table-container">
      <div v-if="isLoading" class="state-message">
        <div class="loader"></div>
        <p>Memuat riwayat...</p>
      </div>

      <div v-else-if="error" class="state-message error">
        <p>{{ error }}</p>
        <button @click="fetchHistory" class="retry-btn">Coba Lagi</button>
      </div>

      <table v-else class="history-table">
        <thead>
          <tr>
            <th>Nama Produk</th>
            <th class="text-right">Total Kuantitas</th>
            <th v-if="currentFilter === 'today'" style="width: 40px"></th>
          </tr>
        </thead>
        <tbody>
          <template v-for="item in filteredData" :key="item.id">
            <tr 
              :class="{ 'expanded': isExpanded(item.id), 'clickable': currentFilter === 'today' }"
              @click="toggleExpand(item.id)"
            >
              <td>{{ item.productName }}</td>
              <td class="text-right">{{ item.totalQty }}</td>
              <td v-if="currentFilter === 'today'" class="text-center">
                <span class="chevron" :class="{ rotate: isExpanded(item.id) }">▼</span>
              </td>
            </tr>
            <tr v-if="currentFilter === 'today' && isExpanded(item.id)" class="details-row">
              <td colspan="3">
                <div class="details-content">
                  <p class="details-title">Waktu Transaksi:</p>
                  <div class="tags">
                    <span v-for="(time, index) in item.times" :key="index" class="tag">
                      {{ time }}
                    </span>
                  </div>
                </div>
              </td>
            </tr>
          </template>
          <tr v-if="filteredData.length === 0">
            <td :colspan="currentFilter === 'today' ? 3 : 2" class="empty-state">
              Tidak ada data penjualan.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { transactionApi } from '@/utils/api'
import { getMerchantId } from '@/utils/auth'

const currentFilter = ref('today')
const historyData = ref([])
const isLoading = ref(false)
const error = ref(null)
const expandedIds = ref(new Set())

const filters = [
  { label: 'Hari Ini', value: 'today' },
  { label: 'Minggu Ini', value: 'week' },
  { label: 'Bulan Ini', value: 'month' }
]

const fetchHistory = async () => {
  isLoading.value = true
  error.value = null
  try {
    const merchantId = getMerchantId()
    if (!merchantId) {
      error.value = 'Merchant ID tidak ditemukan. Silakan login kembali.'
      return
    }

    let endpoint = `/sales/history?time=${currentFilter.value}`
    if (currentFilter.value === 'today') {
      endpoint = '/sales/history/today-grouped'
    }
    
    const response = await transactionApi.get(endpoint)
    
    if (response && (response.responseCode === '200' || response.status === 'success')) {
      const data = response.data?.salesDetail || []
      
      if (currentFilter.value === 'today') {
        const grouped = data.reduce((acc, item) => {
          const pid = item.productId
          if (!acc[pid]) {
            acc[pid] = {
              id: pid,
              productName: item.productName || 'Produk Tidak Diketahui',
              totalQty: 0,
              times: []
            }
          }
          acc[pid].totalQty += (item.totalQuantity || 0)
          if (item.minuteBucket && !acc[pid].times.includes(item.minuteBucket)) {
            acc[pid].times.push(item.minuteBucket)
          }
          return acc
        }, {})
        historyData.value = Object.values(grouped)
      } else {
        // Map API data for week/month filters
        historyData.value = data.map((item, index) => ({
          id: item.productId || index,
          productName: item.productName || 'Produk Tidak Diketahui',
          totalQty: item.totalQuantity || 0,
          times: Array.isArray(item.times) ? item.times : []
        }))
      }
    } else {
      error.value = response?.responseMessage || 'Gagal memuat riwayat penjualan'
    }
  } catch (err) {
    console.error('Failed to fetch history:', err)
    error.value = 'Terjadi kesalahan saat memuat data riwayat'
  } finally {
    isLoading.value = false
  }
}

const filteredData = computed(() => {
  return historyData.value
})

const switchFilter = (val) => {
  currentFilter.value = val
  expandedIds.value.clear()
  fetchHistory()
}

const toggleExpand = (id) => {
  if (currentFilter.value !== 'today') return
  
  if (expandedIds.value.has(id)) {
    expandedIds.value.delete(id)
  } else {
    expandedIds.value.add(id)
  }
}

const isExpanded = (id) => expandedIds.value.has(id)

onMounted(() => {
  fetchHistory()
})
</script>

<style scoped>
.merchant-history {
  width: 100%;
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.filter-btn {
  padding: 8px 16px;
  border: 1px solid #cbd5e0;
  background-color: white;
  border-radius: 20px;
  color: #4a5568;
  cursor: pointer;
  font-size: 0.9em;
  transition: all 0.2s;
}

.filter-btn.active {
  background-color: #667eea;
  color: white;
  border-color: #667eea;
}

.history-table-container {
  overflow-x: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.history-table {
  width: 100%;
  border-collapse: collapse;
}

.history-table th,
.history-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.history-table th {
  background-color: #f7fafc;
  color: #4a5568;
  font-weight: 600;
  font-size: 0.9em;
  white-space: nowrap;
}

.history-table td {
  color: #2d3748;
  font-size: 0.95em;
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

.clickable {
  cursor: pointer;
  transition: background-color 0.2s;
}

.clickable:hover {
  background-color: #f7fafc;
}

.chevron {
  display: inline-block;
  font-size: 0.8em;
  transition: transform 0.3s;
  color: #a0aec0;
}

.chevron.rotate {
  transform: rotate(180deg);
}

.details-row td {
  background-color: #f8fafc;
  border-bottom: 2px solid #edf2f7;
  padding: 0;
}

.details-content {
  padding: 16px;
}

.details-title {
  margin: 0 0 8px 0;
  font-size: 0.85em;
  font-weight: 600;
  color: #718096;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background-color: #e2e8f0;
  color: #4a5568;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.85em;
}

.empty-state {
  text-align: center;
  padding: 30px;
  color: #a0aec0;
}

.state-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #718096;
}

.state-message.error {
  color: #e53e3e;
}

.loader {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.retry-btn {
  margin-top: 12px;
  padding: 6px 16px;
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
}

.retry-btn:hover {
  background-color: #5a67d8;
}
</style>
