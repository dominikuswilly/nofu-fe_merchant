<template>
  <div class="merchant-restock">
    <div class="form-section">
      <h3>Permintaan Restock</h3>
      <p>DUMMY DATA</p>
      
      <!-- Input Form -->
      <div class="restock-form">
        <div class="form-row">
          <div class="form-group product-group">
            <label for="product">Pilih Produk</label>
            <select id="product" v-model="form.productId" class="input-field">
              <option value="">-- Pilih Produk --</option>
              <option v-for="product in products" :key="product.id" :value="product.id">
                {{ product.name }} (Stok: {{ product.stock }})
              </option>
            </select>
          </div>

          <div class="form-group quantity-group">
            <label for="quantity">Jumlah</label>
            <input 
              id="quantity" 
              v-model.number="form.quantity" 
              type="number" 
              min="1" 
              class="input-field"
              placeholder="Qty"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="priority">Prioritas Item</label>
          <select id="priority" v-model="form.priority" class="input-field">
            <option value="normal">Normal</option>
            <option value="urgent">Mendesak</option>
          </select>
        </div>

        <div class="form-group">
          <label for="notes">Catatan per Item (Opsional)</label>
          <input 
            id="notes" 
            v-model="form.notes" 
            type="text"
            class="input-field"
            placeholder="Catatan..."
          />
        </div>

        <button @click="addToCart" class="add-btn" :disabled="!canAdd">
          + Tambah ke Daftar
        </button>
      </div>

      <!-- Draft List (Cart) -->
      <div v-if="cart.length > 0" class="cart-section">
        <h4>Daftar Permintaan ({{ cart.length }} Item)</h4>
        <div class="cart-list">
          <div v-for="(item, index) in cart" :key="index" class="cart-item">
            <div class="cart-item-info">
              <span class="cart-product">{{ item.productName }}</span>
              <span class="cart-details">
                {{ item.quantity }} pcs 
                <span v-if="item.priority === 'urgent'" class="badge-urgent">Urgent</span>
              </span>
              <span v-if="item.notes" class="cart-notes">{{ item.notes }}</span>
            </div>
            <button @click="removeFromCart(index)" class="remove-btn" title="Hapus">
              ✕
            </button>
          </div>
        </div>
        
        <div class="cart-actions">
          <button @click="submitCart" class="submit-btn full-width">
            Kirim {{ cart.length }} Permintaan
          </button>
        </div>
      </div>
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

const cart = ref([])
const restockRequests = ref([])

const canAdd = computed(() => {
  return form.value.productId && form.value.quantity && form.value.quantity > 0
})

const addToCart = () => {
  const product = products.value.find(p => p.id === parseInt(form.value.productId))
  if (!product) return

  cart.value.push({
    productId: product.id,
    productName: product.name,
    quantity: form.value.quantity,
    priority: form.value.priority,
    notes: form.value.notes
  })

  // Reset form partialy
  form.value.productId = ''
  form.value.quantity = null
  form.value.notes = ''
  // keep priority
}

const removeFromCart = (index) => {
  cart.value.splice(index, 1)
}

const submitCart = () => {
  if (cart.value.length === 0) return

  // Mock API call simulation - batch process
  const newRequests = cart.value.map(item => ({
    id: Date.now() + Math.random(),
    productName: item.productName,
    quantity: item.quantity,
    priority: item.priority,
    notes: item.notes,
    status: 'pending',
    date: new Date().toISOString()
  }))

  restockRequests.value.unshift(...newRequests)

  alert(`${cart.value.length} permintaan restock berhasil dikirim ke admin`)
  cart.value = []
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
  border-bottom: 1px solid #edf2f7;
  padding-bottom: 20px;
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.product-group {
  flex: 2;
}

.quantity-group {
  flex: 1;
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

.add-btn {
  background-color: #48bb78;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  align-self: flex-start;
  transition: background-color 0.2s;
}

.add-btn:hover:not(:disabled) {
  background-color: #38a169;
}

.add-btn:disabled {
  background-color: #cbd5e0;
  cursor: not-allowed;
}

/* Cart Styles */
.cart-section h4 {
  margin: 0 0 12px 0;
  color: #4a5568;
  font-size: 1em;
}

.cart-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f7fafc;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.cart-item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cart-product {
  font-weight: 600;
  color: #2d3748;
}

.cart-details {
  font-size: 0.85em;
  color: #718096;
}

.badge-urgent {
  background-color: #fed7d7;
  color: #c53030;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 0.9em;
  margin-left: 6px;
}

.cart-notes {
  font-size: 0.8em;
  color: #718096;
  font-style: italic;
}

.remove-btn {
  background: none;
  border: none;
  font-size: 1.2em;
  color: #cbd5e0;
  cursor: pointer;
  padding: 4px;
}

.remove-btn:hover {
  color: #fc8181;
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

.submit-btn.full-width {
  width: 100%;
}

.submit-btn:hover {
  background-color: #5a67d8;
}

/* Requests List (Existing) */
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
