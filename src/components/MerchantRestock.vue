<template>
  <div class="merchant-restock">
    <div class="form-section">
      <h3>Permintaan Restock</h3>
      <p>DUMMY DATA</p>
      <form @submit.prevent="submitRequest" class="restock-form">
        <div class="form-group">
          <label for="product">Pilih Produk</label>
          <select id="product" v-model="form.productId" required class="input-field">
            <option value="">-- Pilih Produk --</option>
            <option v-for="product in products" :key="product.id" :value="product.id">
              {{ product.name }} (Stok: {{ product.stock }})
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="quantity">Jumlah Permintaan</label>
          <input 
            id="quantity" 
            v-model.number="form.quantity" 
            type="number" 
            min="1" 
            required 
            class="input-field"
            placeholder="Masukkan jumlah"
          />
        </div>

        <div class="form-group">
          <label for="priority">Prioritas</label>
          <select id="priority" v-model="form.priority" class="input-field">
            <option value="normal">Normal</option>
            <option value="urgent">Mendesak</option>
          </select>
        </div>

        <div class="form-group">
          <label for="notes">Catatan (Opsional)</label>
          <textarea 
            id="notes" 
            v-model="form.notes" 
            class="input-field"
            rows="3"
            placeholder="Alasan atau catatan tambahan..."
          ></textarea>
        </div>

        <button type="submit" class="submit-btn" :disabled="!canSubmit">
          Kirim Permintaan
        </button>
      </form>
    </div>

    <div class="requests-section">
      <h3>Riwayat Permintaan</h3>
      <div v-if="restockRequests.length === 0" class="empty-state">
        Belum ada permintaan restock
      </div>
      <div v-else class="requests-list">
        <div v-for="request in restockRequests" :key="request.id" class="request-item" :class="'status-' + request.status">
          <div class="item-header">
            <span class="product-name">{{ request.productName }}</span>
            <span class="status-badge" :class="request.status">
              {{ getStatusLabel(request.status) }}
            </span>
          </div>
          <div class="item-details">
            <div class="detail-row">
              <span class="label">Jumlah:</span>
              <span class="value">{{ request.quantity }} pcs</span>
            </div>
            <div class="detail-row">
              <span class="label">Prioritas:</span>
              <span class="value" :class="'priority-' + request.priority">
                {{ request.priority === 'urgent' ? 'Mendesak' : 'Normal' }}
              </span>
            </div>
            <div class="detail-row">
              <span class="label">Tanggal:</span>
              <span class="value">{{ formatDate(request.date) }}</span>
            </div>
          </div>
          <p v-if="request.notes" class="notes">{{ request.notes }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Mock products data
const products = ref([
  { id: 1, name: 'Kopi Susu Gula Aren', stock: 120, price: 18000 },
  { id: 2, name: 'Croissant Butter', stock: 30, price: 25000 },
  { id: 3, name: 'Americano Hot', stock: 8, price: 15000 },
  { id: 4, name: 'Matcha Latte', stock: 75, price: 22000 },
  { id: 5, name: 'Sandwich Tuna', stock: 45, price: 30000 },
  { id: 6, name: 'Mineral Water', stock: 200, price: 5000 }
])

const form = ref({
  productId: '',
  quantity: null,
  priority: 'normal',
  notes: ''
})

const restockRequests = ref([])

const canSubmit = computed(() => {
  return form.value.productId && form.value.quantity && form.value.quantity > 0
})

const submitRequest = () => {
  const product = products.value.find(p => p.id === parseInt(form.value.productId))
  
  if (!product) return

  // Add to requests
  restockRequests.value.unshift({
    id: Date.now(),
    productName: product.name,
    quantity: form.value.quantity,
    priority: form.value.priority,
    notes: form.value.notes,
    status: 'pending', // pending, approved, rejected
    date: new Date().toISOString()
  })

  // Show success message
  alert(`Permintaan restock ${form.value.quantity} ${product.name} berhasil dikirim ke admin`)

  // Reset form
  form.value = {
    productId: '',
    quantity: null,
    priority: 'normal',
    notes: ''
  }
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak'
  }
  return labels[status] || status
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.merchant-restock {
  padding-bottom: 20px;
}

.form-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.form-section h3 {
  margin-top: 0;
  color: #2d3748;
  margin-bottom: 20px;
}

.restock-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 6px;
  font-size: 0.9em;
}

.input-field {
  padding: 10px 12px;
  border: 1px solid #cbd5e0;
  border-radius: 8px;
  font-size: 1em;
  transition: border-color 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.submit-btn {
  background-color: #667eea;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background-color: #5a67d8;
}

.submit-btn:disabled {
  background-color: #cbd5e0;
  cursor: not-allowed;
}

.requests-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.requests-section h3 {
  margin-top: 0;
  color: #2d3748;
  margin-bottom: 16px;
}

.empty-state {
  text-align: center;
  color: #a0aec0;
  padding: 40px 20px;
}

.requests-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.request-item {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  background-color: #f7fafc;
}

.request-item.status-pending {
  border-left: 4px solid #f6ad55;
}

.request-item.status-approved {
  border-left: 4px solid #48bb78;
}

.request-item.status-rejected {
  border-left: 4px solid #fc8181;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.product-name {
  font-weight: 600;
  color: #2d3748;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 600;
}

.status-badge.pending {
  background-color: #fef5e7;
  color: #d97706;
}

.status-badge.approved {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.rejected {
  background-color: #fee2e2;
  color: #991b1b;
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.9em;
}

.detail-row {
  display: flex;
  gap: 8px;
}

.detail-row .label {
  color: #718096;
  min-width: 80px;
}

.detail-row .value {
  color: #2d3748;
  font-weight: 500;
}

.priority-urgent {
  color: #e53e3e;
  font-weight: 600;
}

.notes {
  margin-top: 8px;
  font-size: 0.9em;
  color: #4a5568;
  font-style: italic;
  padding-top: 8px;
  border-top: 1px solid #e2e8f0;
}
</style>
