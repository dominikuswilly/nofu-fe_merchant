<template>
  <div class="merchant-balance">
    <!-- Main Balance Card -->
    <div class="card main-balance-card">
      <div class="balance-header">
        <span class="icon-circle">💰</span>
        <h3>Saldo Tersedia</h3>
      </div>
      <div v-if="isLoading" class="skeleton skeleton-amount"></div>
      <h2 v-else class="amount">{{ formatCurrency(qrisBalance) }}</h2>
      <button class="action-btn">Tarik Dana</button>
      <p class="update-info">Terakhir diupdate: {{ lastUpdated }}</p>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <!-- Revenue Card -->
      <div class="card stat-card revenue">
        <div class="stat-icon">📈</div>
        <div class="stat-content">
          <p class="stat-label">Omzet Hari Ini</p>
          <div v-if="isLoading" class="skeleton skeleton-stat"></div>
          <p v-else class="stat-value">{{ formatCurrency(balanceData?.totalBalance || 0) }}</p>
          
          <div v-if="isLoading" class="balance-breakdown">
            <div class="skeleton skeleton-breakdown"></div>
            <div class="skeleton skeleton-breakdown"></div>
          </div>
          <div v-else-if="balanceData?.balanceGroup?.length" class="balance-breakdown">
            <div v-for="item in balanceData.balanceGroup" :key="item.paymentMethod" class="breakdown-item">
              <span class="method-label">{{ item.paymentMethod.toUpperCase() }}</span>
              <span class="method-value">{{ formatCurrency(item.totalBalance) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Commission Card -->
      <div class="card stat-card commission">
        <div class="stat-icon">✨</div>
        <div class="stat-content">
          <p class="stat-label">Komisi Hari Ini</p>
          <div v-if="isLoading" class="skeleton skeleton-stat"></div>
          <p v-else class="stat-value text-muted italic">Under Maintenance</p>
        </div>
      </div>
    </div>

    <!-- Recent Activity Hint (Optional Placeholder) -->
    <div class="activity-hint">
      <p>Lihat <a href="#" @click.prevent="$emit('viewHistory')">Riwayat Transaksi</a> untuk detail lengkap.</p>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { transactionApi } from '@/utils/api'

// Mock Data
const balanceData = ref(null)
const isLoading = ref(true)

const qrisBalance = computed(() => {
  if (!balanceData.value || !balanceData.value.balanceGroup) return 0
  const qrisItem = balanceData.value.balanceGroup.find(
    (item) => item.paymentMethod.toLowerCase() === 'qris'
  )
  return qrisItem ? qrisItem.totalBalance : 0
})

const lastUpdated = ref(new Date().toLocaleTimeString('id-ID', { 
  hour: '2-digit', 
  minute: '2-digit' 
}))

const formatCurrency = (value) => {
  if (value === undefined || value === null) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value)
}

const fetchBalance = async () => {
  isLoading.value = true
  try {
    const response = await transactionApi.get('/sales/balance')
    if (response && response.data) {
      balanceData.value = response.data
      lastUpdated.value = new Date().toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
  } catch (error) {
    console.error('Failed to fetch balance:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchBalance()
})

defineEmits(['viewHistory'])
</script>

<style scoped>
.merchant-balance {
  padding-bottom: 20px;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  margin-bottom: 20px;
  transition: transform 0.2s ease;
}

/* Main Balance Card Styles */
.main-balance-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.main-balance-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
  pointer-events: none;
}

.balance-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
  opacity: 0.9;
}

.icon-circle {
  background: rgba(255,255,255,0.2);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 1.2em;
}

.balance-header h3 {
  margin: 0;
  font-size: 0.95em;
  font-weight: 500;
}

.amount {
  font-size: 2.5em;
  font-weight: 700;
  margin: 10px 0 24px;
  letter-spacing: -1px;
}

.action-btn {
  background-color: white;
  color: #667eea;
  border: none;
  padding: 12px 32px;
  border-radius: 24px;
  font-weight: 700;
  cursor: pointer;
  font-size: 1em;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.25);
}

.update-info {
  margin-top: 20px;
  font-size: 0.75em;
  opacity: 0.7;
}

/* Stats Grid Styles */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.stat-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
  overflow: hidden;
  border: 1px solid #edf2f7;
}

.revenue {
  border-left: 4px solid #48bb78;
}

.commission {
  border-left: 4px solid #ed8936;
}

.stat-icon {
  font-size: 2em;
  margin-bottom: 12px;
  background: #f7fafc;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.stat-label {
  font-size: 0.85em;
  color: #718096;
  margin-bottom: 6px;
  font-weight: 600;
}

.stat-value {
  font-size: 1.2em;
  font-weight: 700;
  color: #2d3748;
}

.balance-breakdown {
  margin-top: 12px;
  width: 100%;
  border-top: 1px dashed #e2e8f0;
  padding-top: 8px;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.75em;
  margin-bottom: 4px;
  color: #4a5568;
}

.method-label {
  font-weight: 600;
  opacity: 0.8;
}

.method-value {
  font-weight: 500;
}

.text-muted {
  color: #a0aec0 !important;
}

.italic {
  font-style: italic;
  font-size: 0.9em;
}

.activity-hint {
  text-align: center;
  margin-top: 24px;
  font-size: 0.9em;
  color: #718096;
}

.activity-hint a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.activity-hint a:hover {
  text-decoration: underline;
}

/* Skeleton Loading Animation */
.skeleton {
  background: #edf2f7;
  background: linear-gradient(
    90deg,
    #edf2f7 25%,
    #f7fafc 50%,
    #edf2f7 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

.main-balance-card .skeleton {
  background: rgba(255, 255, 255, 0.1);
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.1) 25%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.1) 75%
  );
  background-size: 200% 100%;
}

.skeleton-amount {
  height: 48px;
  width: 200px;
  margin: 10px auto 24px;
}

.skeleton-stat {
  height: 24px;
  width: 120px;
  margin-bottom: 4px;
}

.skeleton-breakdown {
  height: 16px;
  width: 100%;
  margin-bottom: 8px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@media (max-width: 480px) {
  .amount {
    font-size: 2em;
  }
}
</style>
