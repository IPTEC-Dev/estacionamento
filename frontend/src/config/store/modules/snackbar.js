export default {
  namespaced: true,
  state: {
    snackbar: { snackbar: false, color: 'dark', timeout: 5000, text: '' }
  },
  getters: {},
  mutations: {
    showMessage(state, settings) {
      if (settings) {
        state.snackbar.color = settings.color ? settings.color : 'dark'
        state.snackbar.text = settings.text ? settings.text : 'Erro inesperado'
      } else {
        state.snackbar.color = 'error'
        state.snackbar.text = 'Erro inesperado'
      }
      state.snackbar.snackbar = true
    }
  },
  actions: {}
}
