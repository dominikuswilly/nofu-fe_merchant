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

    <div class="history-container">
      <div v-if="isLoading" class="state-message">
        <div class="loader"></div>
        <p>Memuat riwayat...</p>
      </div>

      <div v-else-if="error" class="state-message error">
        <p>{{ error }}</p>
        <button @click="fetchHistory" class="retry-btn">Coba Lagi</button>
      </div>

      <div v-else class="cards-list">
        <div 
          v-for="item in filteredData" 
          :key="item.id" 
          class="history-card"
          :class="{ 'expanded': isExpanded(item.id), 'clickable': currentFilter === 'today' }"
          @click="toggleExpand(item.id)"
        >
          <div class="card-header">
            <div class="product-info">
              <span class="product-icon">📦</span>
              <h4 class="product-name">{{ item.productName }}</h4>
            </div>
            <div class="qty-badge">
              <span class="qty-label">Total:</span>
              <span class="qty-value">{{ item.totalQty }}</span>
            </div>
          </div>

          <div v-if="currentFilter === 'today'" class="card-footer">
            <div class="expansion-hint">
              <span>Detail Waktu</span>
              <span class="chevron" :class="{ rotate: isExpanded(item.id) }">▼</span>
            </div>
            
            <transition name="expand">
              <div v-if="isExpanded(item.id)" class="details-content" @click.stop>
                <div class="tags">
                  <span v-for="(time, index) in item.times" :key="index" class="tag">
                    <span class="clock-icon">🕒</span> {{ time }}
                  </span>
                </div>
              </div>
            </transition>
          </div>
        </div>

        <div v-if="filteredData.length === 0" class="empty-state">
          <div class="empty-icon">📂</div>
          <p>Tidak ada data penjualan untuk periode ini.</p>
        </div>
      </div>
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
  { label: '7 Hari Terakhir', value: 'week' },
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
  gap: 12px;
  margin-bottom: 24px;
}

.filter-btn {
  padding: 10px 20px;
  border: 1px solid #e2e8f0;
  background-color: white;
  border-radius: 20px;
  color: #718096;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: 600;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.filter-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.filter-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.history-container {
  width: 100%;
}

.cards-list {
  display: grid;
  gap: 16px;
}

.history-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #edf2f7;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
}

.history-card.clickable {
  cursor: pointer;
}

.history-card.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0,0,0,0.05);
  border-color: #667eea33;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-icon {
  font-size: 1.25em;
  background: #f7fafc;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.product-name {
  margin: 0;
  color: #2d3748;
  font-size: 1.05em;
  font-weight: 700;
}

.qty-badge {
  text-align: right;
  background: #f0fff4;
  padding: 6px 12px;
  border-radius: 10px;
  border: 1px solid #c6f6d5;
}

.qty-label {
  font-size: 0.75em;
  color: #38a169;
  font-weight: 600;
  margin-right: 4px;
}

.qty-value {
  font-size: 1em;
  color: #2f855a;
  font-weight: 700;
}

.card-footer {
  margin-top: 16px;
  border-top: 1px dashed #e2e8f0;
  padding-top: 12px;
}

.expansion-hint {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8em;
  color: #a0aec0;
  font-weight: 600;
}

.chevron {
  font-size: 0.7em;
  transition: transform 0.3s ease;
}

.chevron.rotate {
  transform: rotate(180deg);
}

.details-content {
  margin-top: 12px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background-color: #f7fafc;
  color: #4a5568;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.8em;
  border: 1px solid #edf2f7;
  display: flex;
  align-items: center;
  gap: 4px;
}

.clock-icon {
  font-size: 0.9em;
  opacity: 0.6;
}

/* Transitions */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease-out;
  max-height: 200px;
  opacity: 1;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  margin-top: 0;
  overflow: hidden;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  border: 2px dashed #e2e8f0;
  color: #a0aec0;
}

.empty-icon {
  font-size: 3em;
  margin-bottom: 16px;
}

.state-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #718096;
}

.state-message.error {
  color: #e53e3e;
}

.loader {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.retry-btn {
  margin-top: 16px;
  padding: 8px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.retry-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 15px rgba(102, 126, 234, 0.4);
}
</style>
