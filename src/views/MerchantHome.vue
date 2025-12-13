<template>
  <div class="merchant-home">
    <MerchantHeader @logout="handleLogout" @checkIn="handleCheckIn" />
    
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

      <div v-else-if="activeTab === 'balance'" class="tab-content">
        <h2>Saldo Merchant</h2>
        <div class="card balance-card">
          <h3>Rp 0</h3>
          <p>Saldo Tersedia</p>
          <button class="action-btn outline">Tarik Dana</button>
        </div>
      </div>
    </main>

    <MerchantMenu v-model="activeTab" />

    <!-- GPS Guard Overlay -->
    <div v-if="!gpsAllowed" class="gps-guard-overlay">
      <div class="gps-card">
        <div class="gps-icon">📍</div>
        <h2>Akses Lokasi Diperlukan</h2>
        <p>{{ gpsMessage }}</p>
        <button v-if="gpsError" class="retry-btn" @click="checkGPS">Coba Lagi</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MerchantHeader from '../components/MerchantHeader.vue'
import MerchantMenu from '../components/MerchantMenu.vue'
import MerchantHistory from '../components/MerchantHistory.vue'
import MerchantProduct from '../components/MerchantProduct.vue'
import MerchantTransaction from '../components/MerchantTransaction.vue'

const router = useRouter()
const activeTab = ref('transaction')

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
const gpsAllowed = ref(false)
const gpsMessage = ref('Memeriksa izin lokasi...')
const gpsError = ref(false)

const checkGPS = () => {
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

.action-btn {
  background-color: #667eea;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 10px;
}

.action-btn.outline {
  background-color: transparent;
  border: 2px solid #667eea;
  color: #667eea;
}

.balance-card {
  text-align: center;
}

.balance-card h3 {
  font-size: 2em;
  color: #2d3748;
  margin: 10px 0;
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

.retry-btn {
  margin-top: 20px;
  background-color: #667eea;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
}
</style>