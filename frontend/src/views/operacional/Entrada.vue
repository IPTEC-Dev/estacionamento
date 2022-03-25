<template>
  <div>
    <PageTitle title="Entrada" description="Reconhecimento automático de carteirinhas" />
    <GlobalEvents @keydown="readRegistration"></GlobalEvents>
    <v-layout row wrap>
      <v-flex>
        <span style="display: none;">{{ charactersFromReader }}</span>
        <v-stepper v-model="step" vertical>
          <v-stepper-step :complete="step > 1" step="1">
            Informe a matrícula
            <small>É obrigatório o uso do leitor de código de barras</small>
          </v-stepper-step>

          <v-stepper-content step="1">
            <form @submit.prevent="step = 2">
              <v-layout class="mb-3" row wrap>
                <v-flex>
                  <v-text-field
                    box
                    hide-details
                    v-model="entrada.matricula"
                    label="Matrícula"
                    disabled
                    prepend-inner-icon="credit_card"
                  ></v-text-field>
                </v-flex>
              </v-layout>
              <button type="submit" style="display: none;">Próximo</button>
            </form>
            <v-btn color="primary" @click="step = 2" :loading="step1Loading">Continuar</v-btn>
            <v-btn flat @click="reset">Cancelar</v-btn>
          </v-stepper-content>

          <v-stepper-step :complete="step > 2" step="2">Confirme os dados</v-stepper-step>

          <v-stepper-content step="2">
            <template v-if="step === 2">
              <div class="mb-3" v-if="entrada.pessoa.tipo === 'Sócio'">
                <v-layout row wrap>
                  <v-flex>
                    <v-layout class="mb-3" row wrap>
                      <v-flex>
                        <v-text-field
                          id="placa"
                          box
                          label="Placa"
                          prepend-inner-icon="directions_car"
                          mask="AAAAAAAA"
                          v-model="entrada.veiculo"
                          hide-details
                        ></v-text-field>
                      </v-flex>
                    </v-layout>
                    <v-layout row wrap>
                      <v-flex xs12 md4 text-xs-center>
                        <v-card color="primary" dark>
                          <v-img
                            :src="entrada.pessoa.foto ? entrada.pessoa.foto : ''"
                            aspect-ratio="1"
                          ></v-img>
                          <v-card-title>
                            <div>
                              <p
                                class="font-weight-bold mb-0 text-xs-center"
                              >{{ entrada.pessoa.nome }}</p>
                              <v-divider class="my-2"></v-divider>
                              <div>
                                <span class="text-xs-center">{{ entrada.pessoa.matricula }}</span>
                              </div>
                            </div>
                          </v-card-title>
                        </v-card>
                      </v-flex>
                      <v-flex
                        text-xs-center
                        xs12
                        md3
                        v-for="dependente in entrada.pessoa.dependentes"
                        :key="dependente.matricula"
                      >
                        <v-card
                          :dark="!dependente.adimplente"
                          :color="dependente.adimplente ? 'white' : 'red'"
                        >
                          <v-img alt="teste" :src="dependente.foto" aspect-ratio="1"></v-img>
                          <v-card-title>
                            <div>
                              <p class="font-weight-bold mb-0">{{ dependente.nome }}</p>
                              <v-divider class="my-2"></v-divider>
                              <div>{{ dependente.matricula }}</div>
                            </div>
                          </v-card-title>
                        </v-card>
                      </v-flex>
                    </v-layout>
                  </v-flex>
                </v-layout>
              </div>
              <div class="mb-3" v-else>
                <v-layout row wrap>
                  <v-flex xs12 sm6>
                    <v-layout row wrap>
                      <v-flex xs12>
                        <v-text-field
                          label="Nome"
                          prepend-inner-icon="person"
                          v-model="entrada.pessoa.nome"
                          disabled
                          hide-details
                          box
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12>
                        <v-text-field
                          label="Tipo"
                          prepend-inner-icon="category"
                          v-model="entrada.pessoa.tipo"
                          disabled
                          hide-details
                          box
                        ></v-text-field>
                      </v-flex>
                      <v-flex v-if="entrada.pessoa.tipo === 'Credenciado'" xs12>
                        <v-text-field
                          label="Autorizante"
                          prepend-inner-icon="verified_user"
                          v-model="entrada.pessoa.autorizante"
                          disabled
                          hide-details
                          box
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12>
                        <v-text-field
                          label="Matrícula"
                          prepend-inner-icon="credit_card"
                          v-model="entrada.pessoa.matricula"
                          disabled
                          hide-details
                          box
                        ></v-text-field>
                      </v-flex>
                    </v-layout>
                  </v-flex>
                  <v-flex xs12 sm6>
                    <v-layout row wrap>
                      <v-flex>
                        <v-autocomplete
                          id="placa"
                          outline
                          :items="veiculos"
                          v-model="entrada.veiculo"
                          label="Veículo"
                          item-value="id"
                          item-text="placa"
                          prepend-inner-icon="directions_car"
                          no-data-text="Essa pessoa não tem veículos em seu nome"
                          :hint="`Selecione um veículo cadastrado no nome de ${entrada.pessoa.nome}`"
                          persistent-hint
                        >
                          <template slot="selection" slot-scope="data">
                            <strong>{{ data.item.modelo }}</strong>
                            &nbsp;
                            -&nbsp;{{ data.item.placa }}
                          </template>
                          <template slot="item" slot-scope="data">
                            <strong>{{ data.item.modelo }}</strong>
                            &nbsp;
                            -&nbsp;{{ data.item.placa }}
                          </template>
                        </v-autocomplete>
                      </v-flex>
                    </v-layout>
                  </v-flex>
                </v-layout>
              </div>
            </template>
            <v-btn color="primary" @click="step = 3">Continuar</v-btn>
            <v-btn flat @click="reset">Cancelar</v-btn>
          </v-stepper-content>

          <v-stepper-step :complete="step > 3" step="3">Select an ad format and name ad unit</v-stepper-step>

          <v-stepper-content step="3">
            <v-card color="grey lighten-1" class="mb-5" height="200px"></v-card>
            <v-btn color="primary" @click="step = 4">Continue</v-btn>
            <v-btn flat>Cancel</v-btn>
          </v-stepper-content>

          <v-stepper-step step="4">View setup instructions</v-stepper-step>
          <v-stepper-content step="4">
            <v-card color="grey lighten-1" class="mb-5" height="200px"></v-card>
            <v-btn color="primary" @click="step = 1">Continue</v-btn>
            <v-btn flat>Cancel</v-btn>
          </v-stepper-content>
        </v-stepper>
      </v-flex>
    </v-layout>
    <SegundaVia />
  </div>
</template>

<script>
import PageTitle from '@/components/template/PageTitle'
import SegundaVia from '@/components/inicio/SegundaVia'
import GlobalEvents from 'vue-global-events'

export default {
  name: 'Entrada',
  components: { SegundaVia, PageTitle, GlobalEvents },
  data() {
    return {
      step1Loading: false,
      entrada: {},
      step: 1,
      charactersFromReader: [],
      veiculos: []
    }
  },
  methods: {
    readRegistration(event) {
      if (this.charactersFromReader.length > 1) {
        if (
          this.charactersFromReader[this.charactersFromReader.length - 1]
            .key === '*'
        ) {
          this.charactersFromReader = []
        }
      }

      if (event.key !== 'Shift' && event.key !== 'Enter' && event.key !== '!') {
        this.charactersFromReader.push({
          key: event.key
        })
      }

      if (event.key === '*') this.formatCharactersFromReader()
    },
    formatCharactersFromReader() {
      let formatedRegistration
      for (let index = 0; index < this.charactersFromReader.length; index++) {
        if (this.charactersFromReader[index].key !== '*') {
          formatedRegistration += this.charactersFromReader[index].key
        }
      }

      formatedRegistration = formatedRegistration.replace('undefined', '')

      if (formatedRegistration.length > 8) {
        formatedRegistration = formatedRegistration.substring(
          formatedRegistration.length - 8,
          formatedRegistration.length
        )
      } else {
        formatedRegistration = formatedRegistration.substring(
          formatedRegistration.length - 4,
          formatedRegistration.length
        )
      }
      // this.entrada.matricula = formatedRegistration
      this.entrada.matricula = '11310000'
      this.getPerson()
    },
    reset() {
      this.step1Loading = false
      this.charactersFromReader = []
      this.entrada = {}
      this.step = 1
      this.veiculos = []
    },
    getPerson() {
      this.step1Loading = true
      this.$api(`pessoas/matricula/${this.entrada.matricula}`)
        .then(response => {
          this.entrada.pessoa = response.data.pessoa
          this.veiculos = response.data.veiculos
          this.step1Loading = false
          this.step = 2
        })
        .catch(err => {
          if (
            err.response.data ===
            'Esta matrícula não está cadastrada no sistema'
          ) {
            this.$crediTimaoAPI(`creditimao/${this.entrada.matricula}`)
              .then(response => {
                this.entrada.pessoa = response.data
                this.entrada.pessoa.tipo = 'Sócio'
                this.step1Loading = false
                this.step = 2
              })
              .catch(err => {
                this.step1Loading = false
                this.step = 1
                this.$store.commit('snackbar/showMessage', {
                  text: err.response.data,
                  color: 'error'
                })
              })
          } else {
            this.step1Loading = false
            this.step = 1
            this.$store.commit('snackbar/showMessage', {
              text: err.response.data,
              color: 'error'
            })
          }
        })
    }
  }
}
</script>

<style scoped>
</style>