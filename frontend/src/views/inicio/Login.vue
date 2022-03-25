<template>
  <div id="app">
    <v-content>
      <v-container fluid>
        <v-layout align-center justify-center>
          <v-flex xs12 sm6 md4>
            <v-card>
              <v-toolbar dark>
                <v-toolbar-title>
                  <div class="headline">Entrar</div>
                </v-toolbar-title>
              </v-toolbar>
              <v-card-text>
                <v-form @submit.prevent="signin">
                  <v-text-field
                    prepend-inner-icon="person"
                    v-model="user.username"
                    label="Usuário"
                    type="text"
                  ></v-text-field>
                  <v-text-field
                    prepend-inner-icon="lock"
                    v-model="user.password"
                    label="Senha"
                    type="password"
                  ></v-text-field>
                  <v-radio-group v-model="user.local" row>
                    <v-radio v-for="local in ['P1', 'P3', 'Tamboréu']" :key="local" color="dark" :label="local" :value="local"></v-radio>
                  </v-radio-group>
                  <button type="submit" style="display: none;">Entrar</button>
                </v-form>
              </v-card-text>
              <v-divider></v-divider>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="signin" depressed dark>Entrar</v-btn>
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      user: {
        local: 'P1'
      },
      ambiente: null
    }
  },
  methods: {
    signin() {
      this.$api
        .post('/signin', this.user)
        .then(res => {
          if (window.hasOwnProperty('ReactNativeWebView')) {
            this.ambiente = 'mobile'
          } else {
            this.ambiente = 'desktop'
          }

          // Antiga funcionalidade de permitir a digitação da matrícula para confirmar o pagamento em selos digitais
          // const machineDataFromLocalStorage = JSON.parse(
          //   localStorage.getItem('_machineData_')
          // )

          // let simpleMode

          // if (machineDataFromLocalStorage) {
          //   simpleMode = machineDataFromLocalStorage.value
          // } else {
          //   simpleMode = false
          // }

          this.$store.dispatch('user/setUser', {
            ...res.data,
            ambiente: this.ambiente,
            local: this.user.local,
            simpleMode: false
          })
          this.$router.push({ path: '/' })
        })
        .catch(err => {
          this.$store.commit('snackbar/showMessage', {
            text: err.response.data,
            color: 'error'
          })
        })
    }
  }
}
</script>

<style>
</style>
