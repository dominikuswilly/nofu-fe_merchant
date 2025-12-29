<template>
  <div class="merchant-defective">
    <div class="form-section">
      <h3>Catat Produk Rusak</h3>
      <form @submit.prevent="submitDefective" class="defective-form">
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
          <label for="quantity">Jumlah Rusak</label>
          <input 
            id="quantity" 
            v-model.number="form.quantity" 
            type="number" 
            min="1" 
            :max="selectedProductStock"
            required 
            class="input-field"
            placeholder="Masukkan jumlah"
          />
          <small v-if="selectedProductStock" class="hint">Maksimal: {{ selectedProductStock }}</small>
        </div>



        <button type="submit" class="submit-btn" :disabled="!canSubmit">
          {{ isSubmitting ? 'Menyimpan...' : 'Catat Produk Rusak' }}
        </button>
      </form>
    </div>

    <div class="history-section">
      <div class="section-header">
        <h3>Riwayat Produk Rusak</h3>
        <button @click="fetchDefectiveHistory" class="refresh-btn" :disabled="isFetchingHistory">
          <span :class="{ 'spinning': isFetchingHistory }">🔄</span>
        </button>
      </div>

      <div v-if="isFetchingHistory" class="loading-state">
        <div class="mini-loader"></div>
        <p>Memuat riwayat...</p>
      </div>
      <div v-else-if="defectiveHistory.length === 0" class="empty-state">
        Belum ada catatan produk rusak
      </div>
      <div v-else class="history-list">
        <div v-for="record in defectiveHistory" :key="record.id" class="history-item">
          <div class="item-header">
            <span class="product-name">{{ record.productName }}</span>
            <div class="header-right">
              <span class="quantity">{{ record.quantity }} pcs</span>
              <button @click="cancelDefectiveRecord(record)" class="cancel-row-btn" title="Batalkan">
                &times;
              </button>
            </div>
          </div>

          <p v-if="record.notes" class="notes">{{ record.notes }}</p>
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
const isSubmitting = ref(false)
const isFetchingHistory = ref(false)
const error = ref(null)

const form = ref({
  productId: '',
  quantity: null
})

const defectiveHistory = ref([])

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
        stockDetailId: item.id,
        productId: item.productId,
        name: item.productName,
        stock: item.qty,
        price: parseFloat(item.priceSell || 0),
        currency: item.currency || 'IDR'
      }))
    }
  } catch (err) {
    console.error('Failed to fetch products:', err)
    error.value = 'Gagal memuat data produk'
  } finally {
    isLoading.value = false
  }
}

const fetchDefectiveHistory = async () => {
  isFetchingHistory.value = true
  try {
    const response = await transactionApi.get('/sales/defect')
    if (response && response.data) {
      // Assuming response.data is an array or contains an array
      const rawData = response.data.defectDetails || response.data || []
      defectiveHistory.value = rawData.map(item => ({
        id: item.id || item.ID,
        productId: item.productId,
        productName: item.productName || 'Produk Tidak Diketahui',
        quantity: item.qty || item.quantity,
        reason: item.reason || 'Rusak',
        notes: item.notes,
        createdAt: item.createdAt || item.date
      }))
    }
  } catch (err) {
    console.error('Failed to fetch defective history:', err)
  } finally {
    isFetchingHistory.value = false
  }
}

onMounted(() => {
  fetchProducts()
  fetchDefectiveHistory()
})

const selectedProductStock = computed(() => {
  if (!form.value.productId) return 0
  const product = products.value.find(p => p.id === form.value.productId)
  return product ? product.stock : 0
})

const canSubmit = computed(() => {
  return form.value.productId && 
         form.value.quantity && 
         form.value.quantity > 0 && 
         form.value.quantity <= selectedProductStock.value &&
         !isSubmitting.value
})

const submitDefective = async () => {
  const product = products.value.find(p => p.id === form.value.productId)
  
  if (!product) return

  isSubmitting.value = true
  try {
    const payload = {
      defectDetails: [
        {
          productId: product.productId,
          qty: form.value.quantity,
          price: product.price,
          currency: product.currency,
          stockDetailId: product.stockDetailId
        }
      ]
    }

    const submittedQty = form.value.quantity
    const response = await transactionApi.post('/sales/defect/create', payload)
    
    if (response) {
      // Reset form
      form.value = {
        productId: '',
        quantity: null
      }

      // Refresh products and history
      await Promise.all([
        fetchProducts(),
        fetchDefectiveHistory()
      ])

      // Show success message
      alert(`Berhasil mencatat ${submittedQty} ${product.name} sebagai produk rusak`)
    }
  } catch (err) {
    console.error('Failed to submit defective product:', err)
    alert(`Gagal mencatat produk rusak: ${err.message}`)
  } finally {
    isSubmitting.value = false
  }
}

const cancelDefectiveRecord = async (record) => {
  if (!confirm(`Apakah Anda yakin ingin membatalkan catatan ${record.productName} (${record.quantity} pcs)?`)) {
    return
  }

  try {
    // DELETE /sales/defect/{product_id}
    await transactionApi.del(`/sales/defect/${record.productId}`)
    
    alert('Catatan berhasil dibatalkan')
    
    // Refresh data
    await Promise.all([
      fetchProducts(),
      fetchDefectiveHistory()
    ])
  } catch (err) {
    console.error('Failed to cancel defective record:', err)
    alert(`Gagal membatalkan catatan: ${err.message}`)
  }
}


</script>

<style scoped>
.merchant-defective {
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

.defective-form {
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

.hint {
  color: #718096;
  font-size: 0.85em;
  margin-top: 4px;
}

.submit-btn {
  background-color: #e53e3e;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background-color: #c53030;
}

.submit-btn:disabled {
  background-color: #cbd5e0;
  cursor: not-allowed;
}

.history-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.history-section h3 {
  margin: 0;
  color: #2d3748;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.refresh-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2em;
  padding: 4px;
  border-radius: 50%;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.refresh-btn:hover:not(:disabled) {
  background-color: #f7fafc;
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinning {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 0;
  color: #718096;
}

.mini-loader {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #e53e3e;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
}

.empty-state {
  text-align: center;
  color: #a0aec0;
  padding: 40px 20px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  background-color: #fef5f5;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.product-name {
  font-weight: 600;
  color: #2d3748;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cancel-row-btn {
  background: #fff;
  color: #e53e3e;
  border: 1px solid #fed7d7;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
  line-height: 1;
}

.cancel-row-btn:hover {
  background: #e53e3e;
  color: white;
  border-color: #e53e3e;
}



.notes {
  margin-top: 8px;
  font-size: 0.9em;
  color: #4a5568;
  font-style: italic;
}
</style>
