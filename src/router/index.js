import {createRouter, createWebHistory} from 'vue-router'
import LoginPage from '../views/LoginPage.vue'
import MerchantHome from '../views/MerchantHome.vue'

const routes = [
    {path: '/', redirect: '/login'},
    {path: '/login', name: 'Login', component: LoginPage},
    {path: '/merchants/:id', name: 'MerchantHome', component: MerchantHome, props: true, meta: { requiresAuth: true } },
    { path: '/merchants', name: 'Merchants', component: MerchantHome } // fallback if you want a list route
]


const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router