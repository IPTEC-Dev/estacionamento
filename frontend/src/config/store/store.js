import Vue from 'vue'
import Vuex from 'vuex'

import snackbar from './modules/snackbar'
import user from './modules/user'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: { snackbar, user }
})
