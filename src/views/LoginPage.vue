<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="title">🔐 Login</h1>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="form.username"
            type="email"
            placeholder="Masukkan username"
            required
            class="input-field"
          />
        </div>

        <div class="form-group">
          <label for="password">Kata Sandi</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="Masukkan kata sandi"
            required
            class="input-field"
          />
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          <span v-if="loading">⏳ Memproses...</span>
          <span v-else>Masuk</span>
        </button>
      </form>

    </div>
    <ToastNotification 
      v-model="showToast" 
      :message="toastMessage" 
      :type="toastType" 
    />

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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { sha512 } from 'js-sha512'
import ToastNotification from '../components/ToastNotification.vue'
import { getEnv } from '../utils/config'

const router = useRouter()

// State form
const form = ref({
  username: '',
  password: ''
})

// State loading button
const loading = ref(false)
const error = ref(null)

// Toast State
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('info')

const triggerToast = (message, type = 'info') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
}

// Fungsi handleLogin
const handleLogin = async () => {
  error.value = null

  // Validasi dasar
  if (!form.value.username || !form.value.password) {
    triggerToast('Harap isi semua field!', 'error')
    return
  }

  // Set loading true agar tombol tidak bisa diklik berulang
  loading.value = true

  try {
    // Kirim POST request ke API
    const hashedPassword = sha512(form.value.password)
    const backendUrl = getEnv('VUE_APP_BACKEND_URL') || ''
    console.log(backendUrl)
    const response = await fetch(`${backendUrl}/merchants/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: form.value.username,
        password: hashedPassword
      })
    })

    // Cek status respons
    if (response.ok) {
      const data = await response.json()
      // Example: token location may vary depending on backend
      const token = data.token || data.access_token || data.data?.token
      const merchantId = data.merchant?.id || data.id || data.merchant_id

      // Save token and merchant (adjust to your security policy)
      if (token) localStorage.setItem('auth_token', token)
      if (data.merchant) localStorage.setItem('merchant', JSON.stringify(data.merchant))

      // Notify user (optional)
      triggerToast(`Login berhasil! Selamat datang, ${data.name || 'Merchant'}`, 'success')

      // Navigate to merchant page. Prefer route name for clarity — see router setup below.
      setTimeout(() => {
        if (merchantId) {
          // replace so user can't go back to login easily
          router.replace({ name: 'MerchantHome', params: { id: merchantId } })
        } else {
          // fallback route if backend doesn't return id
          router.replace({ path: '/merchants' })
        }
      }, 1000) // Delay slightly to show success toast
    } else {
      const errData = await response.json().catch(() => ({}))
      const errorMsg = errData.message || 'Login gagal: Cek kembali username dan password'
      triggerToast(errorMsg, 'error')
    }
  } catch (error) {
    console.error('Error saat login:', error)
    triggerToast('Kesalahan jaringan: Tidak bisa terhubung ke server.', 'error')
  } finally {
    // Hentikan loading
    loading.value = false
  }
}

// GPS Guard Logic
// Check if GPS is required based on environment
const gpsRequired = getEnv('NODE_ENV') === 'production'

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
      gpsMessage.value = "Mohon aktifkan GPS dan izinkan akses lokasi untuk melanjutkan."
    }
  )
}

onMounted(() => {
  checkGPS()
})
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  /* Fallback for browsers that don't support dvh */
  min-height: 100dvh;
  padding: 20px;
  box-sizing: border-box;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  overflow-y: auto;
}

.login-card {
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  padding: 40px;
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.title {
  color: #333;
  margin-bottom: 24px;
  font-size: 2em;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  text-align: left;
  font-weight: 600;
  color: #555;
  margin-bottom: 6px;
  font-size: 0.95em;
}

.input-field {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1em;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.input-field:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3);
}

.submit-btn {
  background-color: #667eea;
  color: white;
  border: none;
  padding: 14px 30px;
  width: 100%;
  border-radius: 8px;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-btn:hover {
  background-color: #5a67d8;
}

.submit-btn:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.info-text {
  margin-top: 20px;
  color: #666;
  font-size: 0.9em;
}

.link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.link:hover {
  text-decoration: underline;
}

.gps-guard-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255,255,255,0.95);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.gps-card {
  text-align: center;
  padding: 30px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
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