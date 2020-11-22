import { createApp } from 'vue'
import App from './App.vue'
import myPlugin from './plugins/myPlugin.js'
import Antd from 'ant-design-vue';
console.log('createApp--', myPlugin)
import 'ant-design-vue/dist/antd.css';
const app = createApp(App)
app.use(myPlugin)
app.use(Antd) 
app.mount('#app')




