import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import router from '@/config/router'
import store from '@/config/store/store'
import '@/config/axios'

window.sendToElectron = function (data, modulo) {
  if (data.formaPagamento === 'Selo Digital Pendente') data.formaPagamento = 'Selo Digital'

  if (window.hasOwnProperty('ipc') && data !== 'readRegistration') {
    window.ipc(data, modulo)
  }

  if (window.hasOwnProperty('ReactNativeWebView')) {
    if (data === 'readRegistration') {
      window.ReactNativeWebView.postMessage(data)
    } else {
      window.ReactNativeWebView.postMessage(JSON.stringify({ data, modulo }))
    }
  }
}

Vue.config.productionTip = false

Vue.filter('formatDate', value => {
  if (value) {
    Number.prototype.padLeft = function (base, chr) {
      var len = String(base || 10).length - String(this).length + 1
      return len > 0 ? new Array(len).join(chr || '0') + this : this
    }
    var d = new Date(value),
      dformat =
        [
          d.getDate().padLeft(),
          (d.getMonth() + 1).padLeft(),
          d.getFullYear()
        ].join('/') +
        ' às ' +
        [
          d.getHours().padLeft(),
          d.getMinutes().padLeft(),
          d.getSeconds().padLeft()
        ].join(':')
    return dformat
  }
})

Vue.filter('formatPrice', value => {
  if (value) {
    return 'R$ ' + value.toFixed(2).replace('.', ',')
  } else {
    return 'R$ 0,00'
  }
})

new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')
