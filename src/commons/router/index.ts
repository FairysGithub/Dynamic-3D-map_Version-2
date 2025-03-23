        import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
            history: createWebHistory(),
routes: [
        {
        path: '/',
        redirect: '/page',
        },
        {
        path: '/page',
        name: '无标题',
        component: () => import('@/page/index.vue')
        }
]
})

router.beforeEach((to, form, next) => {
/** 清楚所有页面内部的定时器 */
window.SHJDatasourceV2Timer && window.SHJDatasourceV2Timer.forEach(item => {
item.timer && clearInterval(item.timer)
})
window.SHJDatasourceV2Timer = []

next()
})

export default router