<template>
  <div>
    <v-expansion-panel class="mt-3">
      <v-expansion-panel-content>
        <template v-slot:header>
          <strong>Imprimir segunda via do ticket</strong>
        </template>
        <v-card>
          <v-card-text>
            <form @submit.prevent="imprimirSegundaVia">
              <v-layout row wrap>
                <v-flex xs12 sm10>
                  <v-text-field
                    box
                    v-model="matricula"
                    return-masked-value
                    mask="nnnnnn-nn"
                    prepend-inner-icon="credit_card"
                    label="Matrícula"
                    hide-details
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 sm2>
                  <v-btn
                    color="primary"
                    block
                    depressed
                    large
                    @click="imprimirSegundaVia"
                    :disabled="!matricula"
                  >
                    <v-icon>print</v-icon>
                  </v-btn>
                  <button type="submit" style="display: none;">Imprimir</button>
                </v-flex>
              </v-layout>
            </form>
          </v-card-text>
        </v-card>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </div>
</template>

<script>
export default {
  name: 'SegundaVia',
  data() {
    return {
      matricula: '',
      evento: {},
      prices: {}
    }
  },
  methods: {
    imprimirSegundaVia() {
      this.$api(`ultimoFluxo/${this.matricula}`)
        .then(res => {
          if (res.data.nome) {
            this.evento = res.data
            window.sendToElectron({
              evento: this.evento.evento === 'entrada' ? 'Entrada' : 'Saída',
              created_at: this.evento.created_at,
              nome: this.evento.nome,
              formaPagamento: this.evento.pagamento,
              placa: this.evento.placa,
              price: this.evento.valor,
              matricula: this.evento.matricula,
              precos: { ...this.prices }
            })
            this.$store.commit('snackbar/showMessage', {
              text: 'Segunda via impressa com sucesso',
              color: 'primary'
            })
            this.reset()
          } else {
            this.$store.commit('snackbar/showMessage', {
              text:
                'Esta matrícula não possui registro de fluxos em nosso histórico',
              color: 'error'
            })
            this.reset()
          }
        })
        .catch(err => {
          this.$store.commit('snackbar/showMessage', {
            text: err.response.data,
            color: 'error'
          })
        })
    },
    reset() {
      this.matricula = ''
      this.evento = {}
    },
    getPrices() {
      this.$api('configuracoes')
        .then(res => {
          this.prices = res.data
        })
        .catch(err => {
          this.$store.commit('snackbar/showMessage', {
            text: err.response.data,
            color: 'error'
          })
        })
    }
  },
  created() {
    this.getPrices()
  }
}
</script>

<style lang="scss" scoped>
</style>