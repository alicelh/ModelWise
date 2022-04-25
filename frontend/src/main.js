import { createApp } from 'vue'
import App from './App.vue'
import { Select, Button, Table, Col, Row, Space, Spin, Switch, Input, List, Popconfirm, Radio, Tabs } from 'ant-design-vue'
import store from './store'
import './index.less'
import './set-operations/css/Glyphter.css'

/**
 * @description: Every Vue application starts by creating a new application instance with the createApp function. The application instance is used to register 'globals' that can then be used by components within that application
 */
const app = createApp(App)
app.config.productionTip = false

app.use(store)
  .use(Select)
  .use(Button)
  .use(Table)
  .use(Col)
  .use(Row)
  .use(Space)
  .use(Spin)
  .use(Switch)
  .use(Input)
  .use(List)
  .use(Popconfirm)
  .use(Radio)
  .use(Tabs)
app.mount('#app')
