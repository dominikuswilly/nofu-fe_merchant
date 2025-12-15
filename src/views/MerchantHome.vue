<template>
  <div class="merchant-home">
    <MerchantHeader @logout="handleLogout" @checkIn="handleCheckIn" @toTransaction="activeTab = 'transaction'" />
    
    <main class="content-area">
      <div v-if="activeTab === 'transaction'" class="tab-content">
        <h2>Transaksi Baru</h2>
        <MerchantTransaction />
      </div>

      <div v-else-if="activeTab === 'product'" class="tab-content">
        <h2>Daftar Produk</h2>
        <MerchantProduct />
      </div>

      <div v-else-if="activeTab === 'history'" class="tab-content">
        <h2>Riwayat Transaksi</h2>
        <MerchantHistory />
      </div>

      <div v-else-if="activeTab === 'defective'" class="tab-content">
        <h2>Produk Rusak</h2>
        <MerchantDefective />
      </div>

      <div v-else-if="activeTab === 'restock'" class="tab-content">
        <h2>Permintaan Restock</h2>
        <MerchantRestock />
      </div>

      <div v-else-if="activeTab === 'balance'" class="tab-content">
        <h2>Saldo Merchant</h2>
        <MerchantBalance @viewHistory="activeTab = 'history'" />
      </div>
    </main>

    <MerchantMenu v-model="activeTab" />

    <!-- GPS Guard Overlay -->
    <div v-if="gpsRequired && !gpsAllowed" class="gps-guard-overlay">
      <div class="gps-card">
        <div class="gps-icon">📍</div>
        <h2>Akses Lokasi Diperlukan</h2>
        <p class="gps-main-msg">{{ gpsMessage }}</p>
        
        <div v-if="gpsError" class="gps-guide">
          <h3>Cara Mengaktifkan GPS:</h3>
          <ol>
            <li><strong>Chrome/Browser:</strong> Klik ikon kunci/info di address bar → Izinkan Lokasi</li>
            <li><strong>Pengaturan HP:</strong> Pengaturan → Lokasi → Aktifkan</li>
            <li>Setelah aktif, klik "Coba Lagi" di bawah</li>
          </ol>
        </div>
        
        <button v-if="gpsError" class="retry-btn" @click="checkGPS">Coba Lagi</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import MerchantHeader from '../components/MerchantHeader.vue'
import MerchantMenu from '../components/MerchantMenu.vue'
import MerchantHistory from '../components/MerchantHistory.vue'
import MerchantProduct from '../components/MerchantProduct.vue'
import MerchantTransaction from '../components/MerchantTransaction.vue'
import MerchantDefective from '../components/MerchantDefective.vue'
import MerchantRestock from '../components/MerchantRestock.vue'
import MerchantBalance from '../components/MerchantBalance.vue'

const router = useRouter()
// Load saved tab from localStorage or default to 'transaction'
const activeTab = ref(localStorage.getItem('activeTab') || 'transaction')

// Watch for tab changes and save to localStorage
watch(activeTab, (newTab) => {
  localStorage.setItem('activeTab', newTab)
})

const handleLogout = () => {
  const confirmLogout = confirm('Apakah Anda yakin ingin keluar?')
  if (confirmLogout) {
    // Clear auth data
    localStorage.removeItem('auth_token')
    localStorage.removeItem('merchant')
    
    // Compute correct route for login
    router.replace({ name: 'LoginPage' }).catch(() => {
      // Fallback if name not found
      router.replace('/')
    })
  }
}


const handleCheckIn = () => {
  if (gpsAllowed.value) {
    // If we are here, GPS permission is likely granted, but double check logic
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        alert(`Check-in berhasil pada pukul ${time}\nLokasi: ${latitude}, ${longitude}`)
      },
      (error) => {
        console.error(error)
        alert('Gagal mengambil lokasi saat ini.')
      },
      { enableHighAccuracy: true }
    )
  }
}

// GPS Guard Logic
// Check if GPS is required based on environment
const gpsRequired = process.env.NODE_ENV === 'production'

const gpsAllowed = ref(false)
const gpsMessage = ref('Memeriksa izin lokasi...')
const gpsError = ref(false)

const checkGPS = () => {
  if (!gpsRequired) {
    // Skip GPS check in development
    gpsAllowed.value = true
    return
  }
  
  gpsError.value = false
  gpsMessage.value = 'Memeriksa izin lokasi...'
  
  if (!("geolocation" in navigator)) {
    gpsMessage.value = "Browser ini tidak mendukung Geolocation."
    gpsError.value = true
    return
  }

  navigator.geolocation.getCurrentPosition(
    () => {
      gpsAllowed.value = true
    },
    (error) => {
      console.error(error)
      gpsError.value = true
      gpsMessage.value = "Aplikasi ini memerlukan akses lokasi. Mohon aktifkan GPS."
    }
  )
}

onMounted(() => {
  checkGPS()
})
</script>

<style scoped>
.merchant-home {
  min-height: 100vh;
  background-color: #f7fafc;
  padding-bottom: 80px; /* Space for bottom menu */
}

.content-area {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.tab-content h2 {
  color: #2d3748;
  margin-bottom: 20px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  margin-bottom: 16px;
}


.gps-guard-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255,255,255,1);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.gps-card {
  text-align: center;
  padding: 30px;
  max-width: 300px;
}

.gps-icon {
  font-size: 3em;
  margin-bottom: 16px;
}

.gps-main-msg {
  color: #4a5568;
  margin-bottom: 20px;
}

.gps-guide {
  background-color: #f7fafc;
  border-radius: 8px;
  padding: 16px;
  margin: 20px 0;
  text-align: left;
}

.gps-guide h3 {
  margin-top: 0;
  font-size: 1em;
  color: #2d3748;
}

.gps-guide ol {
  margin: 10px 0;
  padding-left: 20px;
}

.gps-guide li {
  margin: 8px 0;
  color: #4a5568;
  font-size: 0.9em;
  line-height: 1.5;
}

.retry-btn {
  margin-top: 20px;
  background-color: #667eea;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.retry-btn:hover {
  background-color: #5a67d8;
}
</style>