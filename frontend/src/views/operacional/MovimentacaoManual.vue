<template>
  <div id="myDiv" @keydown="keyMonitor" tabindex="0" style="outline: none !important;">
    <GlobalEvents @keydown="readRegistration"></GlobalEvents>
    <v-dialog persistent v-model="divida.modal" width="900">
      <v-card>
        <v-card-title
          class="headline primary white--text text-uppercase"
        >{{ divida.dataEntrada ? 'Cobrança pendente' : 'Horário limite excedido' }}</v-card-title>
        <v-card-text>
          <v-layout row wrap>
            <v-flex xs12 sm6>
              <v-layout row wrap>
                <v-flex xs12>
                  <h1>{{divida.valor | formatPrice}}</h1>
                  <h2>{{divida.selos}} selos</h2>
                  <span
                    v-if="divida.dataEntrada"
                  >Referente ao período de {{divida.dataEntrada | formatDate}} a {{ divida.dataSaida | formatDate }}</span>
                </v-flex>
                <v-flex xs12>Cobrança pelas {{divida.horasUteis}} horas úteis</v-flex>
              </v-layout>
            </v-flex>
            <v-flex xs12 sm6>
              <v-select
                prepend-inner-icon="attach_money"
                :items="['Dinheiro', 'Selo Físico', 'Selo Digital', 'Cartão de débito', 'Cartão de crédito', 'Pendência de Leitura de Carteirinha']"
                label="Forma de pagamento"
                v-model="evento.formaPagamento"
              ></v-select>
              <v-flex v-if="(!getUser.simpleMode) && evento.formaPagamento === 'Selo Digital'">
                <v-alert
                  :value="true"
                  type="info"
                  class="mb-3"
                >Para confirmar o pagamento, o sócio deve passar a carteirinha no leitor.</v-alert>
              </v-flex>
              <v-flex
                v-if="(!getUser.simpleMode) && evento.formaPagamento === 'Pendência de Leitura de Carteirinha'"
              >
                <v-alert :value="true" type="warning" class="mb-3">
                  Ao selecionar a forma de pagamento
                  <strong>Pendência de Leitura de Carteirinha</strong>, você concorda com os seguintes passos automáticos que o sistema realizará:
                  <ol class="mt-4">
                    <li>Será registrada uma movimentação paga com Pendência de Leitura de Carteirinha;</li>
                    <li>A movimentação será ajustada para Selo Digital e será debitado da carteira de selos digitais do sócio;</li>
                    <li>Uma ocorrência será aberta automaticamente para documentar que este método de pagamento foi utilizado;</li>
                    <li>Um e-mail será enviado para os administradores do sistema como um alerta;</li>
                    <li>O veículo será liberado normalmente como ocorre em outras formas de pagamento.</li>
                  </ol>
                </v-alert>
              </v-flex>
              <!-- <template v-else-if="evento.formaPagamento === 'Selo Digital'">
                Confirme a matrícula do sócio para realizar o pagamento com selos digitais
                <form @submit.prevent="verifyRegistrationToPay">
                  <v-text-field
                    v-model="registrationVerification"
                    mask="######-##"
                    label="Confirme a matrícula do sócio"
                    prepend-inner-icon="credit_card"
                  ></v-text-field>
                  <button type="submit" style="display: none !important;">Confirmar</button>
                </form>
              </template>-->
            </v-flex>
          </v-layout>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-btn color="secondary" flat @click="reset(true)" :loading="requestingToApi">Cancelar</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            depressed
            @click="done"
            :loading="requestingToApi"
            :disabled="!evento.formaPagamento || evento.formaPagamento === 'Selo Digital' || requestingToApi"
          >Finalizar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-layout row wrap>
      <div id="loading_area" class="deactive">
        <img src="/root/estacionamento/frontend/src/assets/loading.gif" class="loading-img">
      </div>
      <v-flex xs12>
        <v-stepper v-if="!caixa.estado" v-model="step">
          <v-stepper-header
            :style="`background-color: ${evento.evento === 'Entrada' ? 'rgba(0, 0, 255, 0.2)' : evento.evento === 'Saída' ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0)'};`"
          >
            <v-stepper-step :complete="step > 1" step="1">Selecione o tipo de evento</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step :complete="step > 2" step="2">Informe a placa e/ou matrícula</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step :complete="step > 3" step="3">Verifique os dados</v-stepper-step>
          </v-stepper-header>
          <v-stepper-items>
            <v-stepper-content step="1">
              <v-layout align-center justify-center row wrap>
                <v-btn
                  id="btn-entrada"
                  depressed
                  :disabled="step > 1"
                  color="primary"
                  large
                  @click="setEvent('Entrada')"
                >Entrada</v-btn>
                <v-btn
                  id="btn-saida"
                  depressed
                  :disabled="step > 1"
                  color="red"
                  dark
                  large
                  @click="setEvent('Saída')"
                >Saída</v-btn>
              </v-layout>
            </v-stepper-content>
            <v-stepper-content step="2">
              <v-layout align-center justify-center row wrap>
                <v-flex xs12 :sm6="evento.evento === 'Entrada' ? true : false">
                  <v-text-field
                    v-model="evento.placa"
                    autofocus
                    label="Placa"
                    :disabled="evento.placa === 'BICICLETA'"
                    mask="NNNNNNNNN"
                  ></v-text-field>
                </v-flex>
                <v-flex v-if="evento.evento === 'Entrada'" xs12 sm6>
                  <v-text-field
                    v-model="evento.matricula"
                    return-masked-value
                    mask="nnnnnn-nn"
                    label="Matrícula"
                    id="campo-matricula"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 sm4>
                  <v-checkbox
                    class="my-0 py-0"
                    v-if="evento.evento === 'Entrada'"
                    v-model="carro"
                    label="Carro"
                  ></v-checkbox>
                </v-flex>
                <v-flex xs12 sm4>
                  <v-checkbox
                    class="my-0 py-0"
                    v-if="evento.evento === 'Entrada'"
                    v-model="motocicleta"
                    label="Moto"
                  ></v-checkbox>
                </v-flex>
                <v-flex xs12 sm4>
                  <v-checkbox
                    class="my-0 py-0"
                    v-if="evento.evento === 'Entrada'"
                    id="btn-bicicleta"
                    v-model="bicicleta"
                    label="Bicicleta"
                  ></v-checkbox>
                </v-flex>
              </v-layout>
              <v-divider class="mb-2"></v-divider>
              <v-layout row wrap>
                <v-flex xs12>
                    <v-btn
                      :disabled="!((evento.placa) && (carro || motocicleta || bicicleta))"
                      color="primary"
                      depressed
                      id="continue-1"
                      @click="next"
                    >Continuar</v-btn>
                  <v-btn
                    :disabled="!evento.placa"
                    color="primary"
                    id="check-multiple-1"
                    flat
                    v-if="evento.evento === 'Entrada'"
                    @click="multiplasMatriculasModal = true"
                  >Verificar múltiplas matrículas</v-btn>
                  <v-btn flat id="reset-1" @click="reset(true)" :loading="requestingToApi">Cancelar</v-btn>
                </v-flex>
              </v-layout>
            </v-stepper-content>
            <v-stepper-content step="3">
              <v-layout justify-center align-center row wrap>
                <v-flex xs6 sm2 v-if="evento.matricula">
                  <v-flex xs12 v-if="evento.matricula">
                    <v-img :src="getProfilePicture"></v-img>
                  </v-flex>
                </v-flex>
                <v-flex
                  :xs10="evento.matricula ? true : false"
                  :xs12="evento.matricula ? false : true"
                >
                  <v-layout row wrap>
                    <v-flex v-if="evento.tipo === 'Sócio'" xs12>
                      <v-text-field
                        prepend-inner-icon="credit_card"
                        :value="evento.matricula"
                        label="Matrícula"
                        disabled
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs12 sm6>
                      <v-text-field
                        prepend-inner-icon="person"
                        :value="evento.nome"
                        label="Nome do motorista"
                        disabled
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs12 sm6>
                      <v-text-field
                        prepend-inner-icon="accessibility"
                        :value="evento.tipo"
                        label="Tipo de pessoa"
                        disabled
                      ></v-text-field>
                    </v-flex>
                    <v-flex v-if="evento.tipo === 'Credenciado'" xs12>
                      <v-text-field
                        prepend-inner-icon="verified_user"
                        :value="evento.autorizante"
                        label="Autorizante"
                        disabled
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs12 :sm4="evento.modelo">
                      <v-text-field
                        prepend-inner-icon="directions_car"
                        :value="evento.placa"
                        label="Placa do veículo"
                        id="campo-placa"
                        disabled
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs12 sm4>
                      <v-text-field
                        v-if="!evento.matricula"
                        prepend-inner-icon="bookmark"
                        :value="evento.modelo"
                        label="Modelo do veículo"
                        disabled
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs12 sm4>
                      <v-text-field
                        v-if="!evento.matricula"
                        prepend-inner-icon="color_lens"
                        :value="evento.cor"
                        label="Cor do veículo"
                        disabled
                      ></v-text-field>
                    </v-flex>
                    <v-layout row wrap v-if="evento.matricula">
                      <v-flex xs12 sm4>
                        <v-text-field
                          prepend-inner-icon="card_giftcard"
                          :value="saldoSelosDigitais.cortesia"
                          label="Selos de cortesia"
                          :error="saldoSelosDigitais.cortesia <= 2"
                          :hint="saldoSelosDigitais.cortesia <= 2 ? 'Saldo baixo de selos digitais de cortesia' : ''"
                          :persistent-hint="saldoSelosDigitais.cortesia <= 2"
                          readonly
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm4>
                        <v-text-field
                          prepend-inner-icon="credit_card"
                          :value="saldoSelosDigitais.normalMoto"
                          label="Selos digitais de motocicleta"
                          :error="saldoSelosDigitais.normalMoto <= 2"
                          :hint="saldoSelosDigitais.normalMoto <= 2 ? 'Saldo baixo de selos digitais de motocicleta' : ''"
                          :persistent-hint="saldoSelosDigitais.normalMoto <= 2"
                          readonly
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm4>
                        <v-text-field
                          prepend-inner-icon="credit_card"
                          :value="saldoSelosDigitais.normalCarro"
                          label="Selos digitais de carro"
                          :error="saldoSelosDigitais.normalCarro <= 2"
                          :hint="saldoSelosDigitais.normalCarro <= 2 ? 'Saldo baixo de selos digitais de carro' : ''"
                          :persistent-hint="saldoSelosDigitais.normalCarro <= 2"
                          readonly
                        ></v-text-field>
                      </v-flex>
                    </v-layout>
                  </v-layout>
                </v-flex>
              </v-layout>
              <v-layout row wrap>
                <v-flex xs12 sm3 v-for="dependente in evento.dependentes" :key="dependente.cod_dep">
                  <v-card :class="(fotosInvalidas[dependente.foto]) ? 'error' : ''">
                    <v-layout>
                      <v-flex xs6 sm5>
                        <v-img :src="dependente.foto" @error="onDependenteFotoError" contain></v-img>
                        <div v-if="!dependente.valido" class="overlay">
                          <div class="text">Inadimplente</div>
                        </div>
                      </v-flex>
                      <v-flex xs7>
                        <v-card-title primary-title>
                          <div>
                            <div class="headline">{{ dependente.nome }}</div>
                            <div>{{ dependente.matricula_completa }}</div>
                          </div>
                        </v-card-title>
                      </v-flex>
                    </v-layout>
                  </v-card>
                </v-flex>
              </v-layout>
              <v-divider class="my-2"></v-divider>
              <v-layout row wrap>
                <v-flex xs12>
                  <v-btn
                    id="continue-2"
                    depressed
                    color="primary"
                    @click="next"
                    :loading="requestingToApi"
                  >Finalizar</v-btn>
                  <v-btn
                    id="back-2"
                    flat
                    color="secondary"
                    @click="reset"
                    :loading="requestingToApi"
                  >Voltar</v-btn>
                  <v-btn flat id="reset-2" @click="reset(true)" :loading="requestingToApi">Cancelar</v-btn>
                </v-flex>
              </v-layout>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
        <v-alert
          v-else
          :value="true"
          type="error"
        >Atenção! Não é possível utilizar o sistema sem um caixa aberto. Abra um novo caixa.</v-alert>
      </v-flex>
      <v-dialog v-model="dialog" width="700">
        <v-card>
          <v-card-title
            class="headline error white--text text-uppercase"
          >{{`${bloqueio.tipo} ${bloqueio.valor} está bloqueada`}}</v-card-title>
          <v-card-text>
            <p>Bloqueio realizado em {{ bloqueio.data | formatDate }}</p>
            <p>O motivo do bloqueio é o seguinte:</p>
            <p>
              <strong>{{ bloqueio.motivo }}</strong>
            </p>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn color="secondary" flat @click="reset(true)" :loading="requestingToApi">Cancelar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="multiplasMatriculasModal" width="800">
        <v-card>
          <v-card-title class="headline primary white--text">Verificar múltiplas matrículas</v-card-title>
          <v-card-text>
            <v-layout v-for="n in (matriculas.qtd)" :key="n" row wrap class="mb-2">
              <v-flex xs12>
                <v-text-field
                  v-model="matriculas.lista[n]"
                  prepend-inner-icon="credit_card"
                  :label="n === 1 ? 'Matrícula do motorista' : 'Matrícula do acompanhante ' + n"
                  return-masked-value
                  mask="nnnnnn-nn"
                ></v-text-field>
              </v-flex>
            </v-layout>
            <v-layout row wrap align-center>
              <v-flex
                class="ma-2"
                v-for="i in matriculas.resultados"
                :key="i.registration"
                xs12
                sm4
              >
                <v-card>
                  <v-img :src="i.profilePicture" aspect-ratio="1"></v-img>
                  <v-card-title>
                    <div>
                      <h3 class="headline mb-0">{{ i.nome }}</h3>
                      <div>{{ i.registration }}</div>
                    </div>
                  </v-card-title>
                </v-card>
              </v-flex>
            </v-layout>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn
              color="secondary"
              flat
              @click="multiplasMatriculasModal = false"
              :loading="requestingToApi"
            >Cancelar</v-btn>
            <v-spacer></v-spacer>
            <v-btn
              color="error"
              v-if="matriculas.qtd > 1"
              id="multiple-minus"
              flat
              @click="matriculas.qtd--"
            >Remover matrícula</v-btn>
            <v-btn
              color="primary"
              id="multiple-plus"
              flat
              @click="matriculas.qtd++"
            >Adicionar matrícula</v-btn>
            <v-btn
              color="primary"
              flat
              @click="verifyMultipleRegistrations"
              :loading="requestingToApi"
            >Verificar</v-btn>
            <v-btn
              color="primary"
              depressed
              :disabled="!evento.matricula"
              @click="next"
              :loading="requestingToApi"
            >Continuar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>
    <SegundaVia></SegundaVia>
  </div>
</template>

<script>
import GlobalEvents from 'vue-global-events'
import SegundaVia from '@/components/inicio/SegundaVia'
import { mapGetters } from 'vuex'
export default {
  name: 'MovimentacaoManual',
  components: { SegundaVia, GlobalEvents },
  data() {
    return {
      fotosInvalidas: {},
      registrationVerification: '',
      saldoSelosDigitais: {
        normalCarro: 0,
        normalMoto: 0,
        cortesia: 0
      },
      requestingToApi: false,
      matricula: '',
      charactersFromReader: [],
      divida: {
        modal: false,
        valor: 0,
        selos: 0,
        horas: 0,
        horasUteis: 0,
        dataEntrada: null,
        consultado: false
      },
      bicicleta: false,
      motocicleta: false,
      carro: false,
      pagoNaEntrada: false,
      caixa: {},
      step: 0,
      evento: {},
      precos: {},
      primeiraEtapaValida: false,
      dialog: false,
      multiplasMatriculasModal: false,
      matriculas: {
        lista: [],
        qtd: 1,
        resultados: [],
        verificado: false
      },
      bloqueio: {}
    }
  },
  watch: {
    bicicleta(newValue, oldValue) {
      if (newValue) {
        this.carro = false
        this.motocicleta = false
        this.evento.placa = 'BICICLETA'
      } else {
        this.evento.placa = ''
      }
    },
    motocicleta(newValue, oldValue) {
      if (newValue) {
        this.carro = false
        this.bicicleta = false
        if (this.evento.placa === 'BICICLETA') this.evento.placa = ''
      }
    },
    carro(newValue, oldValue) {
      if (newValue) {
        this.motocicleta = false
        this.bicicleta = false
        if (this.evento.placa === 'BICICLETA') this.evento.placa = ''
      }
    },
    evento(newValue) {
      if (newValue.formaPagamento && newValue.formaPagamento === 'Selo Digital')
        window.sendToElectron('readRegistration')
    }
  },
  created() {
    const self = this
    this.loadLastCashbox()
    this.loadPrices()
    document.addEventListener('message', function(data) {
      const result = data.data
      const formatedData = `!${result}*`
      for (let index = 0; index < formatedData.length; index++) {
        self.readRegistration({ key: formatedData[index] })
      }
    })
  },
  computed: {
    ...mapGetters('user', ['getUser']),
    getProfilePicture() {
      return 'http://sccp14/' + this.evento.matricula.replace('-', '') + '.jpg'
    }
  },
  methods: {
    verifyRegistrationToPay() {
      if (
        this.registrationVerification.substring(0, 6) ===
        this.evento.matricula.substring(0, 6)
      ) {
        if (!this.requestingToApi) this.done()
      } else {
        this.$store.commit('snackbar/showMessage', {
          text: `Matrículas não coindidem. A matrícula digitada é ${
            this.registrationVerification
          }. Deveria apresentar a matrícula ${this.evento.matricula.replace(
            '-',
            ''
          )}`,
          color: 'error'
        })
      }
    },
    readRegistration(event) {
      if (
        (this.step === 3 && this.divida.modal) ||
        (this.step === 2 && this.evento.evento === 'Entrada')
      ) {
        if (event.key === '!') this.charactersFromReader = []
        if (this.charactersFromReader.length > 1) {
          if (
            this.charactersFromReader[this.charactersFromReader.length - 1]
              .key === '*'
          ) {
            this.charactersFromReader = []
          }
        }
        if (
          event.key !== 'Shift' &&
          event.key !== 'Enter' &&
          event.key !== '!'
        ) {
          this.charactersFromReader.push({
            key: event.key
          })
        }
        if (event.key === '*') {
          this.formatCharactersFromReader()
        }
      }
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
          formatedRegistration.length - 6,
          formatedRegistration.length
        )
      }
      if (this.step === 2 && this.evento.evento === 'Entrada') {
        this.evento.matricula = formatedRegistration
        this.bicicleta = !this.bicicleta
        this.bicicleta = !this.bicicleta
      } else {
        this.matricula = formatedRegistration
        if (this.evento.formaPagamento === 'Selo Digital') {
          if (
            this.matricula.substring(0, 6) ===
            this.evento.matricula.substring(0, 6)
          ) {
            if (!this.requestingToApi) this.done()
          } else {
            this.$store.commit('snackbar/showMessage', {
              text: `Matrículas não coindidem. A matrícula apresentada no cartão é ${
                this.matricula
              }. Deveria apresentar a matrícula ${this.evento.matricula.replace(
                '-',
                ''
              )}`,
              color: 'error'
            })
          }
        }
      }
    },
    loadLastCashbox() {
      this.requestingToApi = true
      this.$api('cash')
        .then(response => {
          this.caixa = response.data.caixa
          this.requestingToApi = false
        })
        .catch(err => {
          console.log(err.response, err)
          this.requestingToApi = false
          this.$store.commit('snackbar/showMessage', {
            text: err.response.data,
            color: 'error'
          })
        })
    },
    verifyMultipleRegistrations() {
      this.matriculas.resltados = []
      for (let i = 1; i < this.matriculas.lista.length; i++) {
        const element = this.matriculas.lista[i]
        this.requestingToApi = true
        this.$api(`omni/multiple/${element}`).then(res => {
          if (i === 1) {
            this.evento.matricula = element
          }
          if (!res.data.message) {
            this.matriculas.resultados.push({
              registration: element,
              ...res.data
            })
          } else {
            this.$store.commit('snackbar/showMessage', {
              text: res.data.message,
              color: 'error'
            })
          }
          this.requestingToApi = false
        })
      }
      this.matriculas.verificado = true
    },
    loadPrices() {
      this.requestingToApi = true
      this.$api('configuracoes')
        .then(res => {
          this.precos = res.data
          this.requestingToApi = false
        })
        .catch(err => {
          console.log(err.response, err)
          this.requestingToApi = false
          this.$store.commit('snackbar/showMessage', {
            text: err.response.data,
            color: 'error'
          })
        })
    },
    keyMonitor(evento) {
      let key = evento.key
      let activeElement = String(document.activeElement)
      if (key === 'v') {
        if (activeElement !== '[object HTMLInputElement]') {
          document.getElementById('check-multiple-1').click()
          document.getElementById('myDiv').focus()
        }
      }
      if (key === '1' && activeElement !== '[object HTMLInputElement]') {
        document.getElementById('btn-entrada').click()
        document.getElementById('myDiv').focus()
      } else if (
        key === '2' &&
        this.step !== 4 &&
        activeElement !== '[object HTMLInputElement]'
      ) {
        document.getElementById('btn-saida').click()
        document.getElementById('myDiv').focus()
      } else if (key === 'Enter') {
        if (this.step === 2) {
          document.getElementById('continue-1').click()
          document.getElementById('myDiv').focus()
        } else if (this.step == 3) {
          document.getElementById('continue-2').click()
          document.getElementById('myDiv').focus()
        } else if (this.step === 4) {
          document.getElementById('continue-3').click()
          document.getElementById('myDiv').focus()
        }
      } else if (key === 'm') {
        if (this.step === 2 && activeElement !== '[object HTMLInputElement]') {
          this.motocicleta = !this.motocicleta
          document.getElementById('myDiv').focus()
        }
      } else if (key === 'b') {
        if (this.step === 2 && activeElement !== '[object HTMLInputElement]') {
          this.bicicleta = !this.bicicleta
          document.getElementById('myDiv').focus()
        }
      } else if (key === 'Escape') {
        if (this.step === 2) {
          document.getElementById('back-1').click()
          document.getElementById('myDiv').focus()
        } else if (this.step == 3) {
          document.getElementById('back-2').click()
          document.getElementById('myDiv').focus()
        } else if (this.step === 4) {
          document.getElementById('back-3').click()
          document.getElementById('myDiv').focus()
        } else if (this.step === 5) {
          document.getElementById('back-4').click()
          document.getElementById('myDiv').focus()
        }
      } else if (key === 'Delete') {
        if (this.step === 2) {
          document.getElementById('reset-1').click()
          document.getElementById('myDiv').focus()
        } else if (this.step == 3) {
          document.getElementById('reset-2').click()
          document.getElementById('myDiv').focus()
        } else if (this.step === 4) {
          document.getElementById('reset-3').click()
          document.getElementById('myDiv').focus()
        } else if (this.step === 5) {
          document.getElementById('reset-4').click()
          document.getElementById('myDiv').focus()
        }
      } else if (key === 'a' && this.step === 4) {
        document.getElementById('avulso').click()
        document.getElementById('myDiv').focus()
      } else if (key === 's' && this.step === 4) {
        document.getElementById('selo').click()
        document.getElementById('myDiv').focus()
      } else if (key === 'm' && this.step === 4) {
        document.getElementById('motorcycle').click()
        document.getElementById('myDiv').focus()
      }
    },
    setEvent(evento) {
      this.evento.evento = evento
      this.step = 2
    },
    onDependenteFotoError(photoSrc) {
      this.fotosInvalidas[photoSrc] = true;
      this.$forceUpdate();
    },
    reset(force = false) {
      this.registrationVerification = ''
      this.charactersFromReader = []
      this.matricula = ''
      this.divida = {
        modal: false,
        valor: 0,
        selos: 0,
        horas: 0,
        horasUteis: 0,
        dataEntrada: null,
        consultado: false
      }
      this.carro = false
      this.bicicleta = false
      this.motocicleta = false
      this.pagoNaEntrada = false
      this.evento = {
        evento: force ? '' : this.evento.evento
      }
      this.step = force ? 1 : 2
      this.primeiraEtapaValida = false
      this.dialog = false
      this.multiplasMatriculasModal = false
      this.matriculas = {
        lista: [],
        qtd: 1,
        resultados: [],
        verificado: false
      }
      this.bloqueio = {},
      this.saldoSelosDigitais = {
        normalCarro: 0,
        normalMoto: 0,
        cortesia: 0
      }
    },
    done() {
      if (!this.requestingToApi) {
        if (this.evento.evento === 'Entrada') {
          if (!this.divida.consultado || !this.evento.formaPagamento) {
            this.requestingToApi = true
            this.$api
              .post('calcularPrecos', {
                ambiente: this.getUser.ambiente,
                local: this.getUser.local,
                placa: this.evento.placa,
                evento: 'entrada',
                porte:
                  !this.motocicleta && !this.bicicleta
                    ? 'Carro'
                    : !this.motocicleta
                    ? 'Bicicleta'
                    : 'Motocicleta',
                tipo: this.evento.tipo,
                operador: this.getUser.username
              })
              .then(response => {
                if (response.data.valorRetorno) {
                  this.evento.modoRetorno = true
                  this.evento.price = response.data.valorRetorno
                  this.evento.formaPagamento = response.data.pagamento
                }
                if (response.data.valor > 0) {
                  this.divida.modal = true
                  this.divida.valor = response.data.valor
                  this.divida.selos = response.data.selos
                  this.divida.horas = response.data.horas
                  this.divida.horasUteis = response.data.horasUteis
                  this.divida.dataEntrada = response.data.dataEntrada
                  this.divida.dataSaida = response.data.dataSaida
                  this.divida.consultado = true
                } else {
                  let novoValor
                  if (
                    this.evento.formaPagamento === 'Selo Físico' ||
                    this.evento.formaPagamento === 'Selo Digital' ||
                    this.evento.formaPagamento ===
                      'Pendência de Leitura de Carteirinha'
                  ) {
                    novoValor = this.divida.selos
                  } else {
                    novoValor = this.divida.valor
                  }
                  if (this.evento.formaPagamento === 'Selo Digital') {
                    this.requestingToApi = true
                    this.$crediTimaoAPI
                      .post(
                        `estacionamento/debito/${this.evento.matricula.replace(
                          '-',
                          ''
                        )}`,
                        {
                          quantia: novoValor,
                          operador: this.getUser.username,
                          porte:
                            !this.motocicleta && !this.bicicleta
                              ? 'Carro'
                              : !this.motocicleta
                              ? 'Bicicleta'
                              : 'Motocicleta'
                        }
                      )
                      .then(response => {
                        this.evento.saldoRestante = response.data
                        this.requestingToApi = true
                        this.$api
                          .post('entries', {
                            ambiente: this.getUser.ambiente,
                            pagouNaEntrada:
                              this.getUser.ambiente === 'mobile'
                                ? true
                                : this.divida.valor > 0
                                ? true
                                : false,
                            veiculo: this.evento.id,
                            matricula: this.evento.matricula,
                            placa: this.evento.placa,
                            nome: this.evento.nome,
                            caixa: this.caixa.id,
                            movimentacao: 'pagamento',
                            pagamento: this.evento.formaPagamento,
                            evento: 'entrada',
                            tipo: this.evento.tipo,
                            valor: novoValor,
                            porte:
                              !this.motocicleta && !this.bicicleta
                                ? 'Carro'
                                : !this.motocicleta
                                ? 'Bicicleta'
                                : 'Motocicleta',
                            operador: this.getUser.username,
                            local: this.getUser.local,
                            ambiente: this.getUser.ambiente
                          })
                          .then(() => {
                            if (this.evento.tipo === 'Sócio') {
                              if (!this.evento.modoRetorno) {
                                if (
                                  this.evento.formaPagamento ===
                                    'Selo Físico' ||
                                  this.evento.formaPagamento === 'Selo Digital'
                                ) {
                                  this.evento.price = this.divida.selos
                                } else {
                                  this.evento.price = this.divida.valor
                                }
                              }
                              window.sendToElectron({
                                ...this.evento,
                                precos: { ...this.precos }
                              })
                              if (this.pagoNaEntrada) {
                              setTimeout(() => {
                                window.sendToElectron({
                                  ...this.evento,
                                  precos: { ...this.precos }
                                })
                              }, 3000)
                              }
                            }
                            this.$store.commit('snackbar/showMessage', {
                              text: 'Entrada cadastrada',
                              color: 'primary'
                            })
                            this.reset()
                            this.requestingToApi = false
                          })
                          .catch(err => {
                            console.log(err.response, err)
                            this.requestingToApi = false
                            if (err.response.data.error === 'unauthorized') {
                              this.bloqueio.motivo = err.response.data.reason
                              this.bloqueio.valor = err.response.data.value
                              this.bloqueio.tipo = err.response.data.type
                              this.bloqueio.data = err.response.data.created_at
                              this.dialog = true
                            } else if (
                              err.response.data.error === 'afterTheCutoffTime'
                            ) {
                              this.pagoNaEntrada = true
                              this.evento.price = err.response.data.price
                            } else {
                              this.$store.commit('snackbar/showMessage', {
                                text: err.response.data,
                                color: 'error'
                              })
                            }
                            this.requestingToApi = false
                          })
                        this.requestingToApi = false
                      })
                      .catch(err => {
                        console.log(err.response, err)
                        this.requestingToApi = false
                        // this.reset()
                        this.$store.commit('snackbar/showMessage', {
                          text: err.response.data,
                          color: 'error'
                        })
                      })
                  } else {
                    this.requestingToApi = true
                    this.$api
                      .post('entries', {
                        ambiente: this.getUser.ambiente,
                        pagouNaEntrada:
                          this.getUser.ambiente === 'mobile'
                            ? true
                            : this.divida.valor > 0
                            ? true
                            : false,
                        veiculo: this.evento.id,
                        matricula: this.evento.matricula,
                        placa: this.evento.placa,
                        nome: this.evento.nome,
                        caixa: this.caixa.id,
                        movimentacao: 'pagamento',
                        pagamento: this.evento.formaPagamento,
                        evento: 'entrada',
                        tipo: this.evento.tipo,
                        valor: novoValor,
                        porte:
                          !this.motocicleta && !this.bicicleta
                            ? 'Carro'
                            : !this.motocicleta
                            ? 'Bicicleta'
                            : 'Motocicleta',
                        operador: this.getUser.username,
                        local: this.getUser.local,
                        ambiente: this.getUser.ambiente
                      })
                      .then(() => {
                        if (this.evento.tipo === 'Sócio') {
                          if (!this.evento.modoRetorno) {
                            if (
                              this.evento.formaPagamento === 'Selo Físico' ||
                              this.evento.formaPagamento === 'Selo Digital' ||
                              this.evento.formaPagamento ===
                                'Pendência de Leitura de Carteirinha'
                            ) {
                              this.evento.price = this.divida.selos
                            } else {
                              this.evento.price = this.divida.valor
                            }
                          }
                          window.sendToElectron({
                            ...this.evento,
                            precos: { ...this.precos }
                          })
                          if (this.pagoNaEntrada) {
                            setTimeout(() => {
                              window.sendToElectron({
                                ...this.evento,
                                precos: { ...this.precos }
                              })
                            }, 3000)
                          }
                        }
                        this.$store.commit('snackbar/showMessage', {
                          text: 'Entrada cadastrada',
                          color: 'primary'
                        })
                        this.reset()
                        this.requestingToApi = false
                      })
                      .catch(err => {
                        console.log(err.response, err)
                        this.requestingToApi = false
                        if (err.response.data.error === 'unauthorized') {
                          this.bloqueio.motivo = err.response.data.reason
                          this.bloqueio.valor = err.response.data.value
                          this.bloqueio.tipo = err.response.data.type
                          this.bloqueio.data = err.response.data.created_at
                          this.dialog = true
                        } else if (
                          err.response.data.error === 'afterTheCutoffTime'
                        ) {
                          this.pagoNaEntrada = true
                          this.evento.price = err.response.data.price
                        } else {
                          this.$store.commit('snackbar/showMessage', {
                            text: err.response.data,
                            color: 'error'
                          })
                        }
                        this.requestingToApi = false
                      })
                  }
                }
                this.requestingToApi = false
              })
              .catch(err => {
                console.log(err.response, err)
                this.requestingToApi = false
                this.$store.commit('snackbar/showMessage', {
                  text: err.response.data,
                  color: 'error'
                })
                this.requestingToApi = false
              })
          } else {
            let novoValor
            if (
              this.evento.formaPagamento === 'Selo Físico' ||
              this.evento.formaPagamento === 'Selo Digital' ||
              this.evento.formaPagamento ===
                'Pendência de Leitura de Carteirinha'
            ) {
              novoValor = this.divida.selos
            } else {
              novoValor = this.divida.valor
            }
            if (this.evento.formaPagamento === 'Selo Digital') {
              this.requestingToApi = true
              this.$crediTimaoAPI
                .post(
                  `estacionamento/debito/${this.evento.matricula.replace(
                    '-',
                    ''
                  )}`,
                  {
                    quantia: novoValor,
                    operador: this.getUser.username,
                    porte:
                      !this.motocicleta && !this.bicicleta
                        ? 'Carro'
                        : !this.motocicleta
                        ? 'Bicicleta'
                        : 'Motocicleta'
                  }
                )
                .then(response => {
                  this.evento.saldoRestante = response.data
                  this.requestingToApi = true
                  this.$api
                    .post('entries', {
                      ambiente: this.getUser.ambiente,
                      pagouNaEntrada:
                        this.getUser.ambiente === 'mobile'
                          ? true
                          : this.divida.valor > 0
                          ? true
                          : false,
                      veiculo: this.evento.id,
                      matricula: this.evento.matricula,
                      placa: this.evento.placa,
                      nome: this.evento.nome,
                      caixa: this.caixa.id,
                      movimentacao: 'pagamento',
                      pagamento: this.evento.formaPagamento,
                      evento: 'entrada',
                      tipo: this.evento.tipo,
                      valor: novoValor,
                      porte:
                        !this.motocicleta && !this.bicicleta
                          ? 'Carro'
                          : !this.motocicleta
                          ? 'Bicicleta'
                          : 'Motocicleta',
                      operador: this.getUser.username,
                      local: this.getUser.local,
                      ambiente: this.getUser.ambiente
                    })
                    .then(() => {
                      if (this.evento.tipo === 'Sócio') {
                        if (!this.evento.modoRetorno) {
                        } else {
                          if (
                            this.evento.formaPagamento === 'Selo Físico' ||
                            this.evento.formaPagamento === 'Selo Digital' ||
                            this.evento.formaPagamento ===
                              'Pendência de Leitura de Carteirinha'
                          ) {
                            this.evento.price = this.divida.selos
                          } else {
                            this.evento.price = this.divida.valor
                          }
                        }
                        window.sendToElectron({
                          ...this.evento,
                          precos: { ...this.precos }
                        })
                        if (this.pagoNaEntrada) {
                          setTimeout(() => {
                            window.sendToElectron({
                              ...this.evento,
                              precos: { ...this.precos }
                            })
                          }, 3000)
                        }
                      }
                      this.$store.commit('snackbar/showMessage', {
                        text: 'Entrada cadastrada',
                        color: 'primary'
                      })
                      this.reset()
                      this.requestingToApi = false
                    })
                    .catch(err => {
                      console.log(err.response, err)
                      this.requestingToApi = false
                      if (err.response.data.error === 'unauthorized') {
                        this.bloqueio.motivo = err.response.data.reason
                        this.bloqueio.valor = err.response.data.value
                        this.bloqueio.tipo = err.response.data.type
                        this.bloqueio.data = err.response.data.created_at
                        this.dialog = true
                      } else if (
                        err.response.data.error === 'afterTheCutoffTime'
                      ) {
                        this.pagoNaEntrada = true
                        this.evento.price = err.response.data.price
                      } else {
                        this.$store.commit('snackbar/showMessage', {
                          text: err.response.data,
                          color: 'error'
                        })
                      }
                      this.requestingToApi = false
                    })
                  this.requestingToApi = false
                })
                .catch(err => {
                  console.log(err.response, err)
                  this.requestingToApi = false
                  // this.reset()
                  this.$store.commit('snackbar/showMessage', {
                    text: err.response.data,
                    color: 'error'
                  })
                  this.requestingToApi = false
                })
            } else {
              this.requestingToApi = true
              this.$api
                .post('entries', {
                  ambiente: this.getUser.ambiente,
                  pagouNaEntrada:
                    this.getUser.ambiente === 'mobile'
                      ? true
                      : this.divida.valor > 0
                      ? true
                      : false,
                  veiculo: this.evento.id,
                  matricula: this.evento.matricula,
                  placa: this.evento.placa,
                  nome: this.evento.nome,
                  caixa: this.caixa.id,
                  movimentacao: 'pagamento',
                  pagamento: this.evento.formaPagamento,
                  evento: 'entrada',
                  tipo: this.evento.tipo,
                  valor: novoValor,
                  porte:
                    !this.motocicleta && !this.bicicleta
                      ? 'Carro'
                      : !this.motocicleta
                      ? 'Bicicleta'
                      : 'Motocicleta',
                  operador: this.getUser.username,
                  local: this.getUser.local,
                  ambiente: this.getUser.ambiente
                })
                .then(() => {
                  if (this.evento.tipo === 'Sócio') {
                    if (!this.evento.modoRetorno) {
                    } else {
                      if (
                        this.evento.formaPagamento === 'Selo Físico' ||
                        this.evento.formaPagamento === 'Selo Digital' ||
                        this.evento.formaPagamento ===
                          'Pendência de Leitura de Carteirinha'
                      ) {
                        this.evento.price = this.divida.selos
                      } else {
                        this.evento.price = this.divida.valor
                      }
                    }
                    window.sendToElectron({
                      ...this.evento,
                      precos: { ...this.precos }
                    })
                    if (this.pagoNaEntrada) {
                      setTimeout(() => {
                        window.sendToElectron({
                          ...this.evento,
                          precos: { ...this.precos }
                        })
                      }, 3000)
                    }
                  }
                  this.$store.commit('snackbar/showMessage', {
                    text: 'Entrada cadastrada',
                    color: 'primary'
                  })
                  this.reset()
                  this.requestingToApi = false
                })
                .catch(err => {
                  console.log(err.response, err)
                  this.requestingToApi = false
                  if (err.response.data.error === 'unauthorized') {
                    this.bloqueio.motivo = err.response.data.reason
                    this.bloqueio.valor = err.response.data.value
                    this.bloqueio.tipo = err.response.data.type
                    this.bloqueio.data = err.response.data.created_at
                    this.dialog = true
                  } else if (err.response.data.error === 'afterTheCutoffTime') {
                    this.pagoNaEntrada = true
                    this.evento.price = err.response.data.price
                  } else {
                    this.$store.commit('snackbar/showMessage', {
                      text: err.response.data,
                      color: 'error'
                    })
                  }
                  this.requestingToApi = false
                })
            }
          }
        } else {
          if (!this.divida.consultado || !this.evento.formaPagamento) {
            this.requestingToApi = true
            this.$api
              .post('calcularPrecos', {
                ambiente: this.getUser.ambiente,
                local: this.getUser.local,
                placa: this.evento.placa,
                evento: 'saída',
                porte: this.evento.porte,
                tipo: this.evento.tipo,
                operador: this.getUser.username
              })
              .then(response => {
                if (response.data.valorRetorno) {
                  this.evento.modoRetorno = true
                  this.evento.price = response.data.valorRetorno
                  this.evento.formaPagamento = response.data.pagamento
                }
                if (response.data.valor > 0) {
                  this.divida.modal = true
                  this.divida.valor = response.data.valor
                  this.divida.selos = response.data.selos
                  this.divida.horas = response.data.horas
                  this.divida.horasUteis = response.data.horasUteis
                  this.divida.dataEntrada = response.data.dataEntrada
                  this.divida.dataSaida = response.data.dataSaida
                  this.divida.consultado = true
                } else {
                  let novoValor
                  if (
                    this.evento.formaPagamento === 'Selo Físico' ||
                    this.evento.formaPagamento === 'Selo Digital' ||
                    this.evento.formaPagamento ===
                      'Pendência de Leitura de Carteirinha'
                  ) {
                    novoValor = this.divida.selos
                  } else {
                    novoValor = this.divida.valor
                  }
                  if (this.evento.formaPagamento === 'Selo Digital') {
                    this.requestingToApi = true
                    this.$crediTimaoAPI
                      .post(
                        `estacionamento/debito/${this.evento.matricula.replace(
                          '-',
                          ''
                        )}`,
                        {
                          operador: this.getUser.username,
                          quantia: novoValor,
                          porte: this.evento.porte
                        }
                      )
                      .then(response => {
                        this.evento.saldoRestante = response.data
                        this.requestingToApi = true
                        this.$api
                          .post('exits', {
                            identry: this.evento.identry,
                            veiculo: this.evento.id,
                            matricula: this.evento.matricula,
                            placa: this.evento.placa,
                            nome: this.evento.nome,
                            caixa: this.caixa.id,
                            movimentacao: 'pagamento',
                            pagamento: this.evento.formaPagamento,
                            evento: 'saída',
                            tipo: this.evento.tipo,
                            valor: novoValor,
                            porte: this.evento.porte,
                            operador: this.getUser.username,
                            local: this.getUser.local,
                            ambiente: this.getUser.ambiente
                          })
                          .then(() => {
                            if (this.evento.tipo === 'Sócio') {
                              if (!this.evento.modoRetorno) {
                                if (
                                  this.evento.formaPagamento ===
                                    'Selo Físico' ||
                                  this.evento.formaPagamento ===
                                    'Selo Digital' ||
                                  this.evento.formaPagamento ===
                                    'Pendência de Leitura de Carteirinha'
                                ) {
                                  this.evento.price = this.divida.selos
                                } else {
                                  this.evento.price = this.divida.valor
                                }
                              }
                              window.sendToElectron(this.evento)
                            }
                            this.$store.commit('snackbar/showMessage', {
                              text: 'Saída cadastrada',
                              color: 'primary'
                            })
                            this.reset()
                            this.requestingToApi = false
                          })
                          .catch(err => {
                            console.log(err.response, err)
                            this.requestingToApi = false
                            this.$store.commit('snackbar/showMessage', {
                              text: err.response.data,
                              color: 'error'
                            })
                            this.requestingToApi = false
                          })
                        this.requestingToApi = false
                      })
                      .catch(err => {
                        console.log(err.response, err)
                        this.requestingToApi = false
                        // this.reset()
                        this.$store.commit('snackbar/showMessage', {
                          text: err.response.data,
                          color: 'error'
                        })
                        this.requestingToApi = false
                      })
                  } else {
                    this.requestingToApi = true
                    this.$api
                      .post('exits', {
                        identry: this.evento.identry,
                        veiculo: this.evento.id,
                        matricula: this.evento.matricula,
                        placa: this.evento.placa,
                        nome: this.evento.nome,
                        caixa: this.caixa.id,
                        movimentacao: 'pagamento',
                        pagamento: this.evento.formaPagamento,
                        evento: 'saída',
                        tipo: this.evento.tipo,
                        valor: novoValor,
                        porte: this.evento.porte,
                        operador: this.getUser.username,
                        local: this.getUser.local,
                        ambiente: this.getUser.ambiente
                      })
                      .then(() => {
                        if (this.evento.tipo === 'Sócio') {
                          if (!this.evento.modoRetorno) {
                            if (
                              this.evento.formaPagamento === 'Selo Físico' ||
                              this.evento.formaPagamento === 'Selo Digital' ||
                              this.evento.formaPagamento ===
                                'Pendência de Leitura de Carteirinha'
                            ) {
                              this.evento.price = this.divida.selos
                            } else {
                              this.evento.price = this.divida.valor
                            }
                          }
                          window.sendToElectron(this.evento)
                        }
                        this.$store.commit('snackbar/showMessage', {
                          text: 'Saída cadastrada',
                          color: 'primary'
                        })
                        this.reset()
                        this.requestingToApi = false
                      })
                      .catch(err => {
                        console.log(err.response, err)
                        this.requestingToApi = false
                        this.$store.commit('snackbar/showMessage', {
                          text: err.response.data,
                          color: 'error'
                        })
                        this.requestingToApi = false
                      })
                  }
                }
                this.requestingToApi = false
              })
              .catch(err => {
                console.log(err.response, err)
                this.requestingToApi = false
                this.$store.commit('snackbar/showMessage', {
                  text: err.response.data,
                  color: 'error'
                })
                this.requestingToApi = false
              })
          } else {
            let novoValor
            if (
              this.evento.formaPagamento === 'Selo Físico' ||
              this.evento.formaPagamento === 'Selo Digital' ||
              this.evento.formaPagamento ===
                'Pendência de Leitura de Carteirinha'
            ) {
              novoValor = this.divida.selos
            } else {
              novoValor = this.divida.valor
            }
            if (this.evento.formaPagamento === 'Selo Digital') {
              this.requestingToApi = true
              this.$crediTimaoAPI
                .post(
                  `estacionamento/debito/${this.evento.matricula.replace(
                    '-',
                    ''
                  )}`,
                  {
                    operador: this.getUser.username,
                    quantia: novoValor,
                    porte: this.evento.porte
                  }
                )
                .then(response => {
                  this.evento.saldoRestante = response.data
                  this.requestingToApi = true
                  this.$api
                    .post('exits', {
                      identry: this.evento.identry,
                      veiculo: this.evento.id,
                      matricula: this.evento.matricula,
                      placa: this.evento.placa,
                      nome: this.evento.nome,
                      caixa: this.caixa.id,
                      movimentacao: 'pagamento',
                      pagamento: this.evento.formaPagamento,
                      evento: 'saída',
                      tipo: this.evento.tipo,
                      valor: novoValor,
                      porte: this.evento.porte,
                      operador: this.getUser.username,
                      local: this.getUser.local,
                      ambiente: this.getUser.ambiente
                    })
                    .then(() => {
                      if (this.evento.tipo === 'Sócio') {
                        if (!this.evento.modoRetorno) {
                          if (
                            this.evento.formaPagamento === 'Selo Físico' ||
                            this.evento.formaPagamento === 'Selo Digital' ||
                            this.evento.formaPagamento ===
                              'Pendência de Leitura de Carteirinha'
                          ) {
                            this.evento.price = this.divida.selos
                          } else {
                            this.evento.price = this.divida.valor
                          }
                        }
                        window.sendToElectron(this.evento)
                      }
                      this.$store.commit('snackbar/showMessage', {
                        text: 'Saída cadastrada',
                        color: 'primary'
                      })
                      this.reset()
                      this.requestingToApi = false
                    })
                    .catch(err => {
                      console.log(err.response, err)
                      this.requestingToApi = false
                      this.$store.commit('snackbar/showMessage', {
                        text: err.response.data,
                        color: 'error'
                      })
                      this.requestingToApi = false
                    })
                  this.requestingToApi = false
                })
                .catch(err => {
                  console.log(err.response, err)
                  this.requestingToApi = false
                  // this.reset()
                  this.$store.commit('snackbar/showMessage', {
                    text: err.response.data,
                    color: 'error'
                  })
                  this.requestingToApi = false
                })
            } else {
              this.requestingToApi = true
              this.$api
                .post('exits', {
                  identry: this.evento.identry,
                  veiculo: this.evento.id,
                  matricula: this.evento.matricula,
                  placa: this.evento.placa,
                  nome: this.evento.nome,
                  caixa: this.caixa.id,
                  movimentacao: 'pagamento',
                  pagamento: this.evento.formaPagamento,
                  evento: 'saída',
                  tipo: this.evento.tipo,
                  valor: novoValor,
                  porte: this.evento.porte,
                  operador: this.getUser.username,
                  local: this.getUser.local,
                  ambiente: this.getUser.ambiente
                })
                .then(() => {
                  if (this.evento.tipo === 'Sócio') {
                    if (!this.evento.modoRetorno) {
                      if (
                        this.evento.formaPagamento === 'Selo Físico' ||
                        this.evento.formaPagamento === 'Selo Digital' ||
                        this.evento.formaPagamento ===
                          'Pendência de Leitura de Carteirinha'
                      ) {
                        this.evento.price = this.divida.selos
                      } else {
                        this.evento.price = this.divida.valor
                      }
                    }
                    window.sendToElectron(this.evento)
                  }
                  this.$store.commit('snackbar/showMessage', {
                    text: 'Saída cadastrada',
                    color: 'primary'
                  })
                  this.reset()
                  this.requestingToApi = false
                })
                .catch(err => {
                  console.log(err.response, err)
                  this.requestingToApi = false
                  this.$store.commit('snackbar/showMessage', {
                    text: err.response.data,
                    color: 'error'
                  })
                  this.requestingToApi = false
                })
            }
          }
        }
      }
    },
    next() {
      switch (this.step) {
        case 2:
          if (this.evento.evento === 'Entrada') {
            if (this.multiplasMatriculasModal) {
              this.multiplasMatriculasModal = false
            }
            if (this.evento.matricula) {
              var element = document.getElementById("loading_area");
              element.classList.remove("deactive");
              element.classList.add("active");
              this.requestingToApi = true
              this.$api
                .post('omni', {
                  registration: this.evento.matricula.substring(0, 6),
                  code: this.evento.matricula.substring(7, 9),
                  plate: this.evento.placa,
                  event: this.evento.evento
                })
                .then(res => {
                  var element = document.getElementById("loading_area");
                  element.classList.remove("active");
                  element.classList.add("deactive");
                  this.evento.nome = res.data.nome
                  this.evento.tipo = 'Sócio'
                  this.evento.identry = res.data.identry
                  this.evento.came_in = res.data.came_in
                  this.evento.dependentes = res.data.dependentes
                  this.requestingToApi = true
                  this.$crediTimaoAPI(
                    `estacionamento/saldo/${this.evento.matricula.replace(
                      '-',
                      ''
                    )}`
                  )
                    .then(response => {
                      this.saldoSelosDigitais.normalCarro =
                        response.data.normalCarro
                      this.saldoSelosDigitais.normalMoto =
                        response.data.normalMoto
                      this.saldoSelosDigitais.cortesia = response.data.cortesia
                      this.step = 3
                      this.requestingToApi = false
                    })
                    .catch(err => {
                      console.log(err.response, err)
                      this.requestingToApi = false
                      this.$store.commit('snackbar/showMessage', {
                        text: err.response.data,
                        color: 'error'
                      })
                    })
                })
                .catch(err => {
                  console.log(err.response, err)
                  this.requestingToApi = false
                  this.$store.commit('snackbar/showMessage', {
                    text: err.response.data,
                    color: 'error'
                  })
                  var element = document.getElementById("loading_area");
                  element.classList.remove("active");
                  element.classList.add("deactive");
                })
            } else {
              this.requestingToApi = true
              this.$api
                .post(`vehicles/${this.evento.placa}`, { evento: 'entrada' })
                .then(res => {
                  if (!res.data.placa) {
                    document.getElementById('campo-matricula').focus()
                    this.$store.commit('snackbar/showMessage', {
                      text: 'Faça a leitura da carteirinha',
                      color: 'warning'
                    })
                  } else {
                    this.evento.id = res.data.id
                    this.evento.nome = res.data.nome
                    this.evento.placa = res.data.placa
                    this.evento.tipo = res.data.tipo
                    this.evento.modelo = res.data.modelo
                    this.evento.cor = res.data.cor
                    this.evento.autorizante = res.data.autorizante
                    this.evento.came_in = res.data.came_in
                    this.evento.identry = res.data.identry
                    this.step = 3
                  }
                  this.requestingToApi = false
                })
                .catch(err => {
                  console.log(err.response, err)
                  this.requestingToApi = false
                  this.$store.commit('snackbar/showMessage', {
                    text: err.response.data,
                    color: 'error'
                  })
                })
            }
          } else {
            this.requestingToApi = true
            this.$api
              .post(`vehicles/${this.evento.placa}`, { evento: 'saída' })
              .then(res => {
                if (res.data.modelo) {
                  this.evento.id = res.data.id
                  this.evento.nome = res.data.nome
                  this.evento.placa = res.data.placa
                  this.evento.tipo = res.data.tipo
                  this.evento.modelo = res.data.modelo
                  this.evento.cor = res.data.cor
                  this.evento.autorizante = res.data.autorizante
                  this.evento.came_in = res.data.came_in
                  this.evento.identry = res.data.identry
                  this.step = 3
                  this.requestingToApi = false
                } else {
                  this.requestingToApi = true
                  this.$api(`getRegistrationByPlate/${this.evento.placa}`)
                    .then(res => {
                      this.evento.tipo = res.data.tipo
                      this.evento.nome = res.data.nome
                      this.evento.identry = res.data.identry
                      this.evento.matricula = res.data.matricula
                      this.evento.porte = res.data.porte
                      this.evento.pagouNaEntrada = res.data.pagoNaEntrada
                      this.$api
                        .post('omni', {
                          registration: this.evento.matricula.substring(0, 6),
                          code: this.evento.matricula.substring(7, 9),
                          plate: this.evento.placa,
                          event: this.evento.evento
                        })
                        .then(res => {
                          this.evento.nome = res.data.nome
                          this.evento.tipo = 'Sócio'
                          this.evento.identry = res.data.identry
                          this.evento.came_in = res.data.came_in
                          this.evento.price = res.data.valor
                          this.evento.porte = res.data.porte
                          this.step = 3
                          if (!res.data.pagoNaEntrada) {
                            this.requestingToApi = true
                            this.$crediTimaoAPI(
                              `estacionamento/saldo/${this.evento.matricula.replace(
                                '-',
                                ''
                              )}`
                            )
                              .then(response => {
                                this.saldoSelosDigitais.normalCarro =
                                  response.data.normalCarro
                                this.saldoSelosDigitais.normalMoto =
                                  response.data.normalMoto
                                this.saldoSelosDigitais.cortesia =
                                  response.data.cortesia
                                this.step = 3
                                this.requestingToApi = false
                              })
                              .catch(err => {
                                console.log(err.response, err)
                                this.requestingToApi = false
                                this.$store.commit('snackbar/showMessage', {
                                  text: err.response.data,
                                  color: 'error'
                                })
                              })
                          } else {
                            this.evento.price = 0
                            if (!this.requestingToApi) this.done(true)
                          }
                          this.requestingToApi = false
                        })
                        .catch(err => {
                          console.log(err.response, err)
                          this.requestingToApi = false
                          this.$store.commit('snackbar/showMessage', {
                            text: err.response.data,
                            color: 'error'
                          })
                        })
                    })
                    .catch(err => {
                      console.log(err.response, err)
                      this.requestingToApi = false
                      this.$store.commit('snackbar/showMessage', {
                        text: err.response.data,
                        color: 'error'
                      })
                    })
                }
              })
              .catch(err => {
                console.log(err.response, err)
                this.requestingToApi = false
                this.$store.commit('snackbar/showMessage', {
                  text: err.response.data,
                  color: 'error'
                })
              })
          }
          break
        case 3:
          if (!this.requestingToApi) this.done()
          this.step = 1;
          break
      }
    }
  },
  mounted() {
    document.getElementById('myDiv').focus()
  }
}
</script>

<style>
.overlay {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100%;
  width: 100%;
  opacity: 0.5;
  background-color: #ff5252;
}
.text {
  color: white;
  font-size: 20px;
  position: absolute;
  top: 50%;
  left: 23%;
  -webkit-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  text-align: center;
}
.v-sheet--offset {
  top: -24px;
  position: relative;
}
#loading_area.deactive {
  display: none;
}
#loading_area.active{
    position: absolute;
    top: 0;
    left: 0;
    background: rgba(0,0,0,0.5);
    width: 100%;
    height: 100%;
    z-index: 1;
}
</style>
