import { createApp, h } from 'vue'
import { RouterView } from 'vue-router'
import router from './router'

createApp({
    render: () => h(RouterView)
})
    .use(router)
    .mount('#app')


// PWA Logic
let deferredPrompt;

// Check if app is already installed/running in standalone mode
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

if (!isStandalone) {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        console.log('PWA install prompt captured');
        showInstallPromotion();
    });
}

window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    const btn = document.getElementById('pwa-install-btn');
    if (btn) btn.remove();
    deferredPrompt = null;
});

function showInstallPromotion() {
    // Double check standalone state just in case
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // Check if button already exists
    if (document.getElementById('pwa-install-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'pwa-install-btn';
    btn.textContent = 'Install App';
    Object.assign(btn.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: '9999',
        padding: '12px 24px',
        backgroundColor: '#4DBA87',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 'bold',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        cursor: 'pointer'
    });

    btn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            deferredPrompt = null;
        }
        // Button will be removed by appinstalled event if accepted, 
        // or we can remove it here if preferred. 
        // Let's hide it immediately on click to prevent double clicks.
        btn.style.display = 'none';
    });

    document.body.appendChild(btn);
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(reg => {
            console.log('SW registered: ', reg);
        }).catch(err => {
            console.log('SW registration failed: ', err);
        });
    });
}
