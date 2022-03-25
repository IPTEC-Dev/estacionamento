<template>
  <v-app>
    <Header />
    <Loading v-if="validatingToken" />
    <Content v-else />
    <Snackbar />
  </v-app>
</template>

<script>
import Header from '@/components/template/Header'
import Content from '@/components/template/Content'
import Snackbar from '@/components/template/Snackbar'
import Loading from '@/components/template/Loading'
import { userKey } from '@/global'
import { mapGetters } from 'vuex'

export default {
  name: 'App',
  components: { Header, Content, Snackbar, Loading },
  data() {
    return {
      validatingToken: true,
      ambiente: null
    }
  },
  methods: {
    async validateToken() {
      this.validatingToken = true
      const userDataFromLocalStorage = JSON.parse(localStorage.getItem(userKey))
      if (!userDataFromLocalStorage) {
        this.$store.dispatch('user/setUser', null)
        this.$router.push({ path: '/login' })
      } else {
        await this.$api
          .post('validateToken', userDataFromLocalStorage)
          .then(user => {
            if (user.data) {
              // antiga funcionalidade de confirmação de matrícula para pagamento com selo digital
              // const machineDataFromLocalStorage = JSON.parse(
              //   localStorage.getItem('_machineData_')
              // )

              // let simpleMode

              // if (machineDataFromLocalStorage) {
              //   simpleMode = machineDataFromLocalStorage.value
              // } else {
              //   simpleMode = false
              // }

              if (window.hasOwnProperty('ReactNativeWebView')) {
                this.ambiente = 'mobile'
              } else {
                this.ambiente = 'desktop'
              }

              this.$store.dispatch('user/setUser', {
                ...user.data,
                simpleMode: false,
                ambiente: this.ambiente
              })

              if (this.$route.path === '/login')
                this.$router.push({ path: '/' })
            } else {
              this.$store.dispatch('user/setUser', null)
              this.$router.push({ path: '/login' })
            }
          })
      }
      this.validatingToken = false
    }
  },
  created() {
    this.validateToken()

    if (window.hasOwnProperty('ReactNativeWebView')) {
      this.ambiente = 'mobile'
    } else {
      this.ambiente = 'desktop'
    }

    this.$store.dispatch('user/setUser', {
      ...this.getUser,
      ambiente: this.ambiente
    })
  },
  mounted() {},
  computed: mapGetters('user', ['getUser'])
}
</script>

<style>
</style>