import {
	createSSRApp
} from "vue"
import App from "./App.vue"
import store from '@/store'
import { ConfigProvider } from 'vant'
// 按需导入需要主动引用样式
import 'vant/es/toast/style'
import 'vant/es/dialog/style'
import 'vant/es/notify/style'
import 'vant/es/image-preview/style'
import '@/style/index.css'

export function createApp() {
	const app = createSSRApp(App)
		.use(store)
		.use(ConfigProvider)
	return {
		app,
	}
}