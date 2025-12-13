<template>
  <div class="merchant-product">
    <div class="product-table-container">
      <table class="product-table">
        <thead>
          <tr>
            <th>Nama Produk</th>
            <th class="text-right">Stok</th>
            <th class="text-right">Harga</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="product in products" 
            :key="product.id"
            :class="{ 'low-stock': product.stock < 50 }"
          >
            <td>{{ product.name }}</td>
            <td class="text-right">{{ product.stock }}</td>
            <td class="text-right">{{ formatCurrency(product.price) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const products = ref([
  { id: 1, name: 'Kopi Susu Gula Aren', stock: 120, price: 18000 },
  { id: 2, name: 'Croissant Butter', stock: 30, price: 25000 },
  { id: 3, name: 'Americano Hot', stock: 8, price: 15000 },
  { id: 4, name: 'Matcha Latte', stock: 75, price: 22000 },
  { id: 5, name: 'Sandwich Tuna', stock: 45, price: 30000 },
  { id: 6, name: 'Mineral Water', stock: 200, price: 5000 }
])

const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value)
}
</script>

<style scoped>
.merchant-product {
  width: 100%;
}

.product-table-container {
  overflow-x: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.product-table {
  width: 100%;
  border-collapse: collapse;
}

.product-table th,
.product-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.product-table th {
  background-color: #f7fafc;
  color: #4a5568;
  font-weight: 600;
  font-size: 0.9em;
  white-space: nowrap;
}

.product-table tr:last-child td {
  border-bottom: none;
}

.product-table td {
  color: #2d3748;
  font-size: 0.95em;
}

.text-right {
  text-align: right;
}

/* Low stock warning */
.low-stock {
  background-color: #fffbeb; /* Yellow-50 equivalent */
}

.low-stock:hover {
  background-color: #fef3c7; /* Yellow-100 */
}
</style>
