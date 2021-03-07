import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import router from './router'
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'
import store from './store'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueLodash from 'vue-lodash'
import lodash from 'lodash'

Vue.use(Buefy)

Vue.use(VueRouter)

Vue.use(VueAxios, axios)

Vue.use(VueLodash, { name: 'custom' , lodash: lodash })

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
