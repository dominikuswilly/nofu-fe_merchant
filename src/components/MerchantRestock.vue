<template>
  <div class="merchant-restock">
    <div class="form-section">
      <h3>Permintaan Restock</h3>
      
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
              </span>
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
        <div v-for="request in restockRequests" :key="request.id" class="request-card" :class="'status-' + request.status">
          <div class="card-body">
            <div class="card-icon" :class="request.status">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
            <div class="card-info">
              <div class="card-title-row">
                <span class="card-id">#{{ request.id.toString().slice(-6).toUpperCase() }}</span>
                <span class="status-pill" :class="request.status">
                  {{ getStatusLabel(request.status) }}
                </span>
              </div>
              <h4 class="card-title">Permintaan Restock</h4>
              <p class="card-time">{{ formatDate(request.date) }}</p>
            </div>
          </div>
          <div class="card-actions">
            <button class="btn-detail">Lihat Detail</button>
            <button class="btn-history" @click="fetchHistory(request)">Riwayat</button>
          </div>
        </div>
      </div>
    </div>

    <!-- History Modal -->
    <div v-if="showHistoryModal" class="modal-overlay" @click.self="showHistoryModal = false">
      <div class="modal-content history-modal">
        <div class="modal-header">
          <h3>Riwayat Status</h3>
          <button class="close-btn" @click="showHistoryModal = false">✕</button>
        </div>
        
        <div v-if="isHistoryLoading" class="modal-loader">
          <div class="spinner"></div>
          <p>Memuat riwayat...</p>
        </div>
        
        <div v-else-if="historyData.length === 0" class="empty-history">
          Tidak ada data riwayat
        </div>
        
        <div v-else class="history-table-container">
          <table class="history-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Status</th>
                <th>Waktu</th>
                <th>Oleh</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in historyData" :key="row.id">
                <td>{{ row.seq }}</td>
                <td>
                  <span class="status-badge" :class="row.status.toLowerCase()">
                    {{ row.status }}
                  </span>
                </td>
                <td>{{ row.createdAt }}</td>
                <td>{{ row.createdBy }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { transactionApi } from '@/utils/api'
import { getMerchantId } from '@/utils/auth'

// Products data
const products = ref([])
const isLoading = ref(false)
const error = ref(null)

const form = ref({
  productId: '',
  quantity: null,

})

const cart = ref([])
const restockRequests = ref([])

// History Modal State
const showHistoryModal = ref(false)
const historyData = ref([])
const isHistoryLoading = ref(false)

const fetchProducts = async () => {
  isLoading.value = true
  error.value = null
  try {
    const merchantId = getMerchantId()
    if (!merchantId) {
      throw new Error('Merchant ID not found')
    }
    
    const response = await transactionApi.get(`/stock?merchant_id=${merchantId}`)
    if (response && response.data && response.data.stockDetail) {
      products.value = response.data.stockDetail.map(item => ({
        id: item.productId,
        name: item.productName,
        stock: item.qty,
        price: parseFloat(item.priceSell || 0)
      }))
    }
  } catch (err) {
    console.error('Failed to fetch products:', err)
    error.value = 'Gagal memuat data produk'
  } finally {
    isLoading.value = false
  }
}

const fetchRestockList = async () => {
  try {
    const response = await transactionApi.get('/restock')
    // Handle both { data: { restockDetail: [] } } and { data: [] }
    const list = response?.data?.restockDetail || response?.data || []
    
    if (Array.isArray(list)) {
      restockRequests.value = list.map(item => ({
        id: item.id || item.transactionId || Math.random().toString(),
        productId: item.productId || item.product?.id,
        productName: item.productName || item.product?.name || 'Produk',
        quantity: item.qty || item.quantity || 0,
        status: item.status || 'pending',
        date: item.tsCreatedAt || item.ts_created_at || item.createdAt || new Date().toISOString(),
        latitude: item.latitude,
        longitude: item.longitude
      }))
    }
  } catch (err) {
    console.error('Failed to fetch restock history:', err)
  }
}

onMounted(() => {
  fetchProducts()
  fetchRestockList()
})

const canAdd = computed(() => {
  return form.value.productId && form.value.quantity && form.value.quantity > 0
})

const addToCart = () => {
  // form.value.productId is now the string UUID from API
  const product = products.value.find(p => p.id === form.value.productId)
  if (!product) return

  cart.value.push({
    productId: product.id,
    productName: product.name,
    quantity: form.value.quantity,

  })

  // Reset form partialy
  form.value.productId = ''
  form.value.quantity = null

  // keep priority
}

const removeFromCart = (index) => {
  cart.value.splice(index, 1)
}

const getGeolocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'))
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (err) => {
          reject(err)
        }
      )
    }
  })
}

const submitCart = async () => {
  if (cart.value.length === 0) return
  isLoading.value = true

  try {
    let location = { latitude: 0, longitude: 0 }
    try {
      location = await getGeolocation()
    } catch (locErr) {
      console.warn('Could not get geolocation:', locErr)
      // Proceed with 0,0 or handle as error? User example shows them included.
    }

    const payload = {
      item: cart.value.map(item => ({
        productId: item.productId,
        qty: item.quantity
      })),
      latitude: location.latitude,
      longitude: location.longitude
    }

    const response = await transactionApi.post('/restock/create', payload)
    
    if (response) {
      alert(`${cart.value.length} permintaan restock berhasil dikirim`)
      cart.value = []
      await fetchRestockList()
    }
  } catch (err) {
    console.error('Failed to submit restock:', err)
    alert('Gagal mengirim permintaan restock. Silakan coba lagi.')
  } finally {
    isLoading.value = false
  }
}

const fetchHistory = async (request) => {
  isHistoryLoading.value = true
  showHistoryModal.value = true
  historyData.value = []
  
  try {
    // The history endpoint needs the items array. 
    // If not available in the request object, we use the product info we have
    const items = request.item || [
      {
        productId: request.productId || 'string',
        qty: request.quantity || 1
      }
    ]

    const payload = {
      item: items
    }

    const response = await transactionApi.post(`/restock/${request.id}/history`, payload)
    
    if (response && response.responseCode === "200") {
      historyData.value = response.data || []
    } else {
      console.warn('History API responded with non-200 code:', response)
    }
  } catch (err) {
    console.error('Failed to fetch history:', err)
  } finally {
    isHistoryLoading.value = false
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

/* Modern Request Card Styles */
.requests-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.request-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #edf2f7;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.request-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.card-body {
  padding: 16px;
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-icon.pending {
  background: #fffaf0;
  color: #d97706;
}

.card-icon.approved {
  background: #f0fdf4;
  color: #16a34a;
}

.card-icon.rejected {
  background: #fef2f2;
  color: #dc2626;
}

.card-info {
  flex: 1;
}

.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.card-id {
  font-family: monospace;
  font-size: 0.75rem;
  font-weight: 600;
  color: #a0aec0;
  letter-spacing: 0.5px;
}

.status-pill {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 999px;
}

.status-pill.pending { background: #fee2e2; color: #991b1b; } /* Orange-ish fallback */
.status-pill.pending { background: #fef3c7; color: #92400e; }
.status-pill.approved { background: #dcfce7; color: #166534; }
.status-pill.rejected { background: #fee2e2; color: #991b1b; }

.card-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #1a202c;
}

.card-time {
  margin: 2px 0 0 0;
  font-size: 0.85rem;
  color: #718096;
}

.card-actions {
  display: flex;
  gap: 1px;
  background: #edf2f7;
  border-top: 1px solid #edf2f7;
}

.card-actions button {
  flex: 1;
  background: white;
  border: none;
  padding: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s;
}

.card-actions button:hover {
  background: #f8fafc;
  color: #2d3748;
}

.btn-detail {
  border-right: 1px solid #edf2f7 !important;
}

@media (max-width: 640px) {
  .card-body {
    padding: 12px;
  }
  .card-icon {
    width: 40px;
    height: 40px;
  }
}



@media (max-width: 640px) {
  .form-row {
    flex-direction: column;
    gap: 16px;
  }

  .product-group, .quantity-group {
    width: 100%;
  }

  .add-btn {
    width: 100%;
    align-self: stretch;
    display: flex;
    justify-content: center;
    margin-top: 8px;
  }

  .form-section, .requests-section {
    padding: 16px;
  }

  .detail-row .label {
    min-width: 70px;
  }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #edf2f7;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #2d3748;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #a0aec0;
  cursor: pointer;
}

.modal-loader {
  padding: 40px;
  text-align: center;
  color: #718096;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #4a90e2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.history-table-container {
  overflow-x: auto;
  padding: 20px;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.history-table th {
  text-align: left;
  padding: 12px;
  background: #f8fafc;
  color: #64748b;
  font-weight: 600;
  border-bottom: 2px solid #e2e8f0;
}

.history-table td {
  padding: 12px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.status-badge.pending { background: #fef3c7; color: #92400e; }
.status-badge.approved { background: #dcfce7; color: #166534; }
.status-badge.rejected { background: #fee2e2; color: #991b1b; }

.empty-history {
  padding: 40px;
  text-align: center;
  color: #a0aec0;
}
</style>
