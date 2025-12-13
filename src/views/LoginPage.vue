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
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { sha512 } from 'js-sha512'

const router = useRouter()

// State form
const form = ref({
  username: '',
  password: ''
})

// State loading button
const loading = ref(false)
const error = ref(null)

// Fungsi handleLogin
const handleLogin = async () => {
  error.value = null

  // Validasi dasar
  if (!form.value.username || !form.value.password) {
    alert('Harap isi semua field!')
    return
  }

  // Set loading true agar tombol tidak bisa diklik berulang
  loading.value = true

  try {
    // Kirim POST request ke API
    const hashedPassword = sha512(form.value.password)
    const response = await fetch('/api/merchants/login', {
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
      // alert(`Login berhasil! Selamat datang, ${data.name || 'Merchant'}`)

      // Navigate to merchant page. Prefer route name for clarity — see router setup below.
      if (merchantId) {
        // replace so user can't go back to login easily
        router.replace({ name: 'MerchantHome', params: { id: merchantId } })
      } else {
        // fallback route if backend doesn't return id
        router.replace({ path: '/merchants' })
      }
    } else {
      const errData = await response.json().catch(() => ({}))
      error.value = errData.message || 'Login gagal: Cek kembali username dan password'
    }
  } catch (error) {
    console.error('Error saat login:', error)
    alert('Kesalahan jaringan: Tidak bisa terhubung ke server. Pastikan API berjalan di app.netbird.cloud:8080.')
  } finally {
    // Hentikan loading
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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
</style>