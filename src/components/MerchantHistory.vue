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
      <p>DUMMY DATA</p>
      <table class="history-table">
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
import { ref, computed } from 'vue'

const currentFilter = ref('today')
const expandedIds = ref(new Set())

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

const switchFilter = (val) => {
  currentFilter.value = val
  expandedIds.value.clear()
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
</style>
