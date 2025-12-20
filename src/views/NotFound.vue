<template>
  <div class="not-found-container">
    <div class="not-found-card">
      <div class="error-animation">
        <div class="error-icon">🔍</div>
        <div class="error-code">404</div>
      </div>
      
      <h1 class="error-title">Halaman Tidak Ditemukan</h1>
      <p class="error-message">
        Maaf, halaman yang Anda cari tidak dapat ditemukan atau mungkin telah dipindahkan.
      </p>
      
      <div class="action-buttons">
        <button @click="goHome" class="primary-btn">
          <span class="btn-icon">🏠</span>
          Kembali ke Beranda
        </button>
        <button @click="goBack" class="secondary-btn">
          <span class="btn-icon">↩️</span>
          Kembali
        </button>
      </div>
      
      <div class="help-section">
        <p class="help-text">Butuh bantuan?</p>
        <div class="quick-links">
          <router-link v-if="isAuthenticated" to="/merchants" class="link">Dashboard</router-link>
          <router-link v-else to="/login" class="link">Login</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { isAuthenticated as checkAuth } from '../utils/auth'

const router = useRouter()
const isAuthenticated = checkAuth()

const goHome = () => {
  if (isAuthenticated) {
    router.push({ name: 'Merchants' })
  } else {
    router.push({ name: 'LoginPage' })
  }
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  min-height: 100dvh;
  padding: 20px;
  box-sizing: border-box;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.not-found-card {
  background-color: #ffffff;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 40px 30px;
  width: 100%;
  max-width: 480px;
  text-align: center;
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-animation {
  margin-bottom: 30px;
  position: relative;
}

.error-icon {
  font-size: 4em;
  margin-bottom: 16px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.error-code {
  font-size: 5em;
  font-weight: 900;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: 20px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.error-title {
  color: #2d3748;
  font-size: 1.75em;
  margin-bottom: 16px;
  font-weight: 700;
}

.error-message {
  color: #4a5568;
  font-size: 1em;
  line-height: 1.6;
  margin-bottom: 32px;
  padding: 0 10px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 32px;
}

.primary-btn,
.secondary-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  border: none;
  border-radius: 12px;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.primary-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.primary-btn:active {
  transform: translateY(0);
}

.secondary-btn {
  background-color: #f7fafc;
  color: #4a5568;
  border: 2px solid #e2e8f0;
}

.secondary-btn:hover {
  background-color: #edf2f7;
  border-color: #cbd5e0;
}

.btn-icon {
  font-size: 1.2em;
}

.help-section {
  padding-top: 24px;
  border-top: 2px solid #e2e8f0;
}

.help-text {
  color: #718096;
  font-size: 0.9em;
  margin-bottom: 12px;
}

.quick-links {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95em;
  transition: all 0.2s ease;
  padding: 8px 16px;
  border-radius: 8px;
  background-color: #f7fafc;
}

.link:hover {
  background-color: #edf2f7;
  transform: translateY(-1px);
}

/* Responsive Design */
@media (max-width: 480px) {
  .not-found-card {
    padding: 30px 20px;
  }

  .error-code {
    font-size: 4em;
  }

  .error-title {
    font-size: 1.5em;
  }

  .error-message {
    font-size: 0.95em;
  }

  .primary-btn,
  .secondary-btn {
    padding: 12px 20px;
    font-size: 0.95em;
  }
}

@media (max-width: 360px) {
  .error-icon {
    font-size: 3em;
  }

  .error-code {
    font-size: 3.5em;
  }

  .error-title {
    font-size: 1.3em;
  }
}

/* Dark mode support (optional) */
@media (prefers-color-scheme: dark) {
  .not-found-container {
    background: linear-gradient(135deg, #4c51bf 0%, #5a3d7f 100%);
  }
}
</style>
