<template>
  <div class="merchant-history">
    <div class="filters">
      <button 
        v-for="filter in filters" 
        :key="filter.value"
        class="filter-btn"
        :class="{ active: currentFilter === filter.value }"
        @click="currentFilter = filter.value"
      >
        {{ filter.label }}
      </button>
    </div>

    <div class="history-table-container">
      <table class="history-table">
        <thead>
          <tr>
            <th>Nama Produk</th>
            <th>Total Kuantitas</th>
            <th v-if="currentFilter === 'today'">Waktu Transaksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredData" :key="item.id">
            <td>{{ item.productName }}</td>
            <td class="text-center">{{ item.totalQty }}</td>
            <td v-if="currentFilter === 'today'">
              <span class="times">{{ item.times.join(', ') }}</span>
            </td>
          </tr>
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
import { ref, computed } from 'vue'

const currentFilter = ref('today')

const filters = [
  { label: 'Hari Ini', value: 'today' },
  { label: 'Minggu Ini', value: 'week' },
  { label: 'Bulan Ini', value: 'month' }
]

// Mock Data
const mockData = {
  today: [
    { id: 1, productName: 'Kopi Susu Gula Aren', totalQty: 15, times: ['08:30', '10:15', '13:45'] },
    { id: 2, productName: 'Croissant Butter', totalQty: 8, times: ['09:00', '11:20'] },
    { id: 3, productName: 'Americano Hot', totalQty: 12, times: ['08:00', '08:45', '14:00', '16:30'] }
  ],
  week: [
    { id: 101, productName: 'Kopi Susu Gula Aren', totalQty: 85 },
    { id: 102, productName: 'Croissant Butter', totalQty: 40 },
    { id: 103, productName: 'Americano Hot', totalQty: 60 },
    { id: 104, productName: 'Matcha Latte', totalQty: 25 }
  ],
  month: [
    { id: 201, productName: 'Kopi Susu Gula Aren', totalQty: 350 },
    { id: 202, productName: 'Croissant Butter', totalQty: 180 },
    { id: 203, productName: 'Americano Hot', totalQty: 240 },
    { id: 204, productName: 'Matcha Latte', totalQty: 110 },
    { id: 205, productName: 'Sandwich Tuna', totalQty: 90 }
  ]
}

const filteredData = computed(() => {
  return mockData[currentFilter.value] || []
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

.text-center {
  text-align: center;
}

.times {
  font-size: 0.85em;
  color: #718096;
}

.empty-state {
  text-align: center;
  padding: 30px;
  color: #a0aec0;
}
</style>
