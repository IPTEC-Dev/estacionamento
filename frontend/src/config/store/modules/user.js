import axios from 'axios'
import { userKey } from '@/global'
import Vue from 'vue'

export default {
  namespaced: true,
  state: {
    user: {}
  },
  getters: {
    getUser(state) {
      return state.user
    }
  },
  mutations: {
    setUser(state, user) {
      state.user = user
      if (user) {
        Vue.prototype.$api.defaults.headers.common['Authorization'] = `bearer ${
          user.token
          }`
        Vue.prototype.$crediTimaoAPI.defaults.headers.common[
          'Authorization'
        ] = `bearer ${user.token}`
      } else {
        delete Vue.prototype.$api.defaults.headers.common['Authorization']
        delete Vue.prototype.$crediTimaoAPI.defaults.headers.common[
          'Authorization'
        ]
      }
    }
  },
  actions: {
    setUser({ commit }, payload) {
      if (payload !== null) {
        localStorage.setItem(
          userKey,
          JSON.stringify({
            token: payload.token,
            iat: payload.iat,
            exp: payload.exp
          })
        )
      } else {
        localStorage.removeItem(userKey)
      }
      commit('setUser', payload)
    }
  }
}
