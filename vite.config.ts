import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
// @ts-ignore
import { defineConfig, loadEnv } from 'vite'

// https://vitejs.dev/config/
export default ({ mode }: any) => defineConfig({
    plugins: [vue()],
    resolve: { alias: { '@': resolve(__dirname, './src') } },
    css: {
        preprocessorOptions: {
            scss: {
                silenceDeprecations: ['legacy-js-api'],
                api: "modern-compiler"
            }
        }
    }
})