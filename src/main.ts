// @ts-ignore
import { createApp } from 'vue'

import pinia from './commons/utils/piniaInstance'

import './commons/styles/reset.scss'

import 'animate.css'

// @ts-ignore
import router from './commons/router'
import App from './commons/App.vue'
/** 加载组件库 */
import zerovWidgets from '@shjjs/visual-ui'
/** 加载组件库样式 */
import '@shjjs/visual-ui/es/style.css'


createApp(App).use(router).use(zerovWidgets).use(pinia).mount('#app')