import Vue from 'vue'
import axios from 'axios'

Vue.use({
  install(Vue) {
    Vue.prototype.$api = axios.create({
      baseURL: "/backend"
    })
    Vue.prototype.$crediTimaoAPI = axios.create({
      baseURL: "https://creditimao.sccorinthians.com.br/api"
    })
  }
})

const success = res => res
const error = err => {
  if (401 === err.response.status) {
    window.location = '/login'
  } else {
    return Promise.reject(err)
  }
}

axios.interceptors.response.use(success, error)
