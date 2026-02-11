import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// 导入开发模式工具
import { setupAPIInterceptor, setupGlobalErrorHandler, setupConsoleInterceptor } from './utils/apiInterceptor'

// 创建应用实例
const app = createApp(App)

// 使用 Pinia 和 Router
app.use(createPinia())
app.use(router)

// 在开发模式下启用拦截器和错误处理
if (import.meta.env.DEV) {
  console.log('\n🔧 Development Mode Enabled')
  console.log('   - API Interceptor: ON')
  console.log('   - Global Error Handler: ON')
  console.log('   - Console Interceptor: ON')
  console.log('   - Dev Panel: ON\n')

  // 设置拦截器
  setupAPIInterceptor()
  setupGlobalErrorHandler()
  setupConsoleInterceptor()
}

// 挂载应用
app.mount('#app')
