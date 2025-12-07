<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="title">🔐 Login</h1>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="Masukkan email"
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

        <button type="submit" class="submit-btn">Masuk</button>
      </form>

      <p class="info-text">
        Belum punya akun? <a href="#" class="link">Daftar sekarang</a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const form = ref({
  email: '',
  password: ''
})

const handleLogin = () => {
  if (form.value.email && form.value.password) {
    alert(`Login berhasil! Email: ${form.value.email}`)
    // Di sini bisa lanjut ke routing ke dashboard
  } else {
    alert('Harap isi semua field!')
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
