import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/components/home/Home'
import Atividade from '@/components/atividade/Atividade'
import Configuracao from '@/components/configuracao/Configuracao'
import AdminPages from '@/components/admin/AdminPages'
import Auth from '@/components/auth/Auth'
import { userKey } from '@/global'

Vue.use(VueRouter)

const routes = [{
    name: 'home',
    path: '/',
    component: Home
}, {
    name: 'atividade',
    path: '/atividade',
    component: Atividade,
    meta: { requiresAdmin: false }
}, {
    name: 'configuracao',
    path: '/configuracao',
    component: Configuracao,
    meta: { requiresAdmin: false }
}, {
    name: 'adminPages',
    path: '/admin',
    component: AdminPages,
    meta: { requiresAdmin: true }
}, {
    name: 'auth',
    path: '/auth',
    component: Auth
}]

const router = new VueRouter({
    mode: 'history',
    routes
})

router.beforeEach((to, from, next) => {
    const json = localStorage.getItem(userKey)

    if (to.matched.some(record => record.meta.requiresAdmin)) {
        const user = JSON.parse(json)
        user && user.admin ? next() : next({ path: '/' })
    } else {
        next()
    }
})

export default router
