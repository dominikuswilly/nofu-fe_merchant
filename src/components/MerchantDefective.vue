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

        <div class="form-group">
          <label for="reason">Alasan (Opsional)</label>
          <select id="reason" v-model="form.reason" class="input-field">
            <option value="">-- Pilih Alasan --</option>
            <option value="Rusak">Rusak</option>
            <option value="Kadaluarsa">Kadaluarsa</option>
            <option value="Cacat Produksi">Cacat Produksi</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>

        <div class="form-group" v-if="form.reason === 'Lainnya'">
          <label for="notes">Catatan</label>
          <textarea 
            id="notes" 
            v-model="form.notes" 
            class="input-field"
            rows="3"
            placeholder="Tulis catatan..."
          ></textarea>
        </div>

        <button type="submit" class="submit-btn" :disabled="!canSubmit">
          {{ isSubmitting ? 'Menyimpan...' : 'Catat Produk Rusak' }}
        </button>
      </form>
    </div>

    <div class="history-section">
      <h3>Riwayat Produk Rusak</h3>
      <div v-if="defectiveHistory.length === 0" class="empty-state">
        Belum ada catatan produk rusak
      </div>
      <div v-else class="history-list">
        <div v-for="record in defectiveHistory" :key="record.id" class="history-item">
          <div class="item-header">
            <span class="product-name">{{ record.productName }}</span>
            <span class="quantity">{{ record.quantity }} pcs</span>
          </div>
          <div class="item-details">
            <span class="date">{{ formatDate(record.date) }}</span>
            <span v-if="record.reason" class="reason">{{ record.reason }}</span>
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
const error = ref(null)

const form = ref({
  productId: '',
  quantity: null,
  reason: '',
  notes: ''
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

onMounted(() => {
  fetchProducts()
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

    const response = await transactionApi.post('/sales/defect/create', payload)
    
    if (response) {
      // Add to local history for immediate UI feedback
      defectiveHistory.value.unshift({
        id: Date.now(),
        productName: product.name,
        quantity: form.value.quantity,
        reason: form.value.reason || 'Tidak disebutkan',
        notes: form.value.notes,
        date: new Date().toISOString()
      })

      // Show success message
      alert(`Berhasil mencatat ${form.value.quantity} ${product.name} sebagai produk rusak`)

      // Reset form
      form.value = {
        productId: '',
        quantity: null,
        reason: '',
        notes: ''
      }

      // Refresh products to get updated stock
      await fetchProducts()
    }
  } catch (err) {
    console.error('Failed to submit defective product:', err)
    alert(`Gagal mencatat produk rusak: ${err.message}`)
  } finally {
    isSubmitting.value = false
  }
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
  margin-top: 0;
  color: #2d3748;
  margin-bottom: 16px;
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

.quantity {
  background-color: #e53e3e;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85em;
  font-weight: 600;
}

.item-details {
  display: flex;
  gap: 12px;
  font-size: 0.85em;
  color: #718096;
}

.reason {
  color: #e53e3e;
  font-weight: 600;
}

.notes {
  margin-top: 8px;
  font-size: 0.9em;
  color: #4a5568;
  font-style: italic;
}
</style>
