<template>
  <div>
    <v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
      <v-btn icon slot="activator">
        <v-icon color="error">report_problem</v-icon>
      </v-btn>
      <v-card>
        <v-toolbar dark color="error">
          <v-btn icon dark @click="reset">
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>Registrar ocorrência</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn dark flat @click="open" :disabled="!matricula || !descricao || loading">Enviar</v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-progress-linear v-if="loading" :indeterminate="true"></v-progress-linear>
        <v-card-text>
          <v-layout row wrap>
            <v-flex xs12 sm4>
              <v-card class="mx-3 mb-3">
                <v-img :src="foto" aspect-ratio="1"></v-img>
                <v-card-title>
                  <div>
                    <h3 class="headline mb-0">{{ nome || 'Não identificado' }}</h3>
                    <div>{{ matricula || 'Sem matrícula' }}</div>
                  </div>
                </v-card-title>
              </v-card>
            </v-flex>
            <v-flex xs12 sm8>
              <v-layout row wrap>
                <v-flex xs12>
                  <v-text-field
                    v-model="matricula"
                    return-masked-value
                    :disabled="loading"
                    mask="nnnnnn-nn"
                    label="Matrícula"
                    required
                  ></v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-textarea v-model="descricao" label="Descrição" required :disabled="loading"></v-textarea>
                </v-flex>
              </v-layout>
            </v-flex>
          </v-layout>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Ocorrencias',
  computed: { ...mapGetters('user', ['getUser']) },
  data() {
    return {
      dialog: false,
      loading: false,
      matricula: '',
      descricao: '',
      foto: '',
      nome: ''
    }
  },
  methods: {
    reset() {
      this.dialog = false
      this.matricula = ''
      this.descricao = ''
      this.foto = ''
      this.nome = ''
      this.loading = false
    },
    open() {
      this.loading = true
      this.$api
        .post('ocorrencias', {
          matricula: this.matricula,
          descricao: this.descricao,
          operador: this.getUser.username
        })
        .then(() => {
          this.reset()
          this.$store.commit('snackbar/showMessage', {
            text: 'Ocorrência registrada com sucesso',
            color: 'primary'
          })
        })
        .catch(err => {
          this.$store.commit('snackbar/showMessage', {
            text: err.response.data,
            color: 'error'
          })
        })
    }
  },
  watch: {
    matricula(newValue, oldValue) {
      if (newValue.length === 9) {
        this.$api
          .post('omni/matricula', {
            registration: newValue.substring(0, 6),
            code: newValue.substring(7, 9)
          })
          .then(res => {
            if (res.data.nome) {
              this.nome = res.data.nome
              this.foto =
                'http://sccp14/' + this.matricula.replace('-', '') + '.jpg'
            } else {
              this.$store.commit('snackbar/showMessage', {
                text: 'Matrícula não encontrada',
                color: 'error'
              })
            }
          })
          .catch(err => {
            this.$store.commit('snackbar/showMessage', {
              text: err.response.data,
              color: 'error'
            })
          })
      } else {
        this.nome = ''
        this.foto = ''
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>