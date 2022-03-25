<template>
  <div>
    <PageTitle title="Caixa" description="Abra e feche caixas, gere relatórios e registre saídas" />
    <v-layout row wrap>
      <v-dialog persistent v-model="divergencia.modal" width="600">
        <v-card>
          <v-card-title
            class="headline error white--text text-uppercase"
          >Necessário fazer uma retirada</v-card-title>
          <v-card-text>
            <v-layout row wrap>
              <v-flex xs12>
                <p>
                  Há uma diferença de
                  <strong>{{divergencia.valor | formatPrice}}</strong>
                  .
                  {{divergencia.valor >= 0 ? 'É necessário fazer uma retirada para atingir o saldo inicial padrão definido pelo administrador.' : 'É necessário fazer uma entrada para atingir os saldo inicial padrão definido pelo administrador.'}}
                </p>
                <p>Deseja mesmo continuar?</p>
              </v-flex>
            </v-layout>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn color="secondary" flat @click="divergencia = {modal: false, value: 0}">Cancelar</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="error" @click="autoWithdraw">Sim, continuar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog persistent v-model="movimentacao.modal" width="900">
        <v-card>
          <v-card-title class="primary white--text">
            <div>
              <div class="headline text-uppercase">Editar movimentação</div>
              <span>Corrija informações que foram inseridas incorretamente</span>
            </div>
          </v-card-title>
          <v-card-text>
            <v-layout row class="mb-2">
              <v-flex xs4>
                <v-text-field
                  hide-details
                  prefix="R$"
                  v-model.number="movimentacao.valor"
                  label="Valor"
                  type="number"
                ></v-text-field>
              </v-flex>
              <v-flex xs4 class="mx-2">
                <v-select
                  hide-details
                  prepend-inner-icon="attach_money"
                  :items="['Dinheiro', 'Selo Físico', 'Cartão de débito', 'Cartão de crédito']"
                  label="Forma de pagamento"
                  v-model="movimentacao.pagamento"
                ></v-select>
              </v-flex>
              <v-flex xs4>
                <v-select
                  hide-details
                  prepend-inner-icon="directions_car"
                  :items="['Carro', 'Motocicleta', 'Bicicleta']"
                  label="Porte"
                  v-model="movimentacao.porte"
                ></v-select>
              </v-flex>
            </v-layout>
            <v-layout row>
              <v-flex xs12>
                <v-textarea hide-details v-model="movimentacao.motivo" label="Motivo"></v-textarea>
              </v-flex>
            </v-layout>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn color="secondary" flat @click="movimentacao = { modal: false }">Cancelar</v-btn>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              depressed
              @click="salvarMovimentacao"
              :disabled="!movimentacao.motivo"
            >Salvar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-flex xs12>
        <v-card>
          <v-responsive>
            <v-container fluid>
              <v-layout align-center>
                <v-flex>
                  <div
                    v-if="caixa.estado"
                    class="headline mb-3"
                  >Não há um caixa aberto no momento. Deseja abrir um agora?</div>
                  <div
                    v-else
                    class="headline mb-3"
                  >O caixa #{{ caixa.id }} está aberto no momento. Deseja fechá-lo?</div>
                  <!-- Modal de abertura de caixa -->
                  <v-dialog v-if="caixa.estado" v-model="openModal" width="500">
                    <template v-slot:activator="{ on }">
                      <v-btn color="primary" v-on="on">Abrir caixa</v-btn>
                    </template>
                    <v-card>
                      <v-card-title class="headline primary white--text text-uppercase">Abrir caixa</v-card-title>
                      <v-card-text>
                        <v-flex
                          class="mb-3"
                        >Digite o saldo inicial do caixa a ser aberto. Por padrão, o saldo inicial é o saldo final real do caixa anterior.</v-flex>
                        <v-flex>
                          <v-text-field
                            v-model="saldoInicial"
                            label="Saldo inicial"
                            prefix="R$"
                            type="number"
                            hint="Por padrão, o saldo inicial é o saldo final real do caixa anterior."
                            persistent-hint
                          ></v-text-field>
                        </v-flex>
                      </v-card-text>
                      <v-divider></v-divider>
                      <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" flat @click="openCashbox">Abrir</v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                  <v-btn
                    v-else
                    :disabled="getUser.role !== 'gestao'"
                    color="error"
                    @click="closeCashbox"
                  >Fechar caixa</v-btn>
                  <!-- Modal de retirada -->
                  <v-dialog v-if="getUser.role === 'gestao'" v-model="withdrawModal" width="500">
                    <template v-slot:activator="{ on }">
                      <v-btn v-if="!caixa.estado" color="primary" flat v-on="on">Retirar manualmente</v-btn>
                    </template>
                    <v-card>
                      <v-card-title
                        class="headline primary white--text text-uppercase"
                      >Retirar manualmente</v-card-title>
                      <v-card-text>
                        <v-flex
                          class="mb-3"
                        >Digite o montante que será retirado do caixa. Lembre-se que o montante não pode ser maior que o valor real do caixa.</v-flex>
                        <v-flex>
                          <v-text-field
                            v-model="withdraw"
                            label="Montante de retirada"
                            prefix="R$"
                            type="number"
                          ></v-text-field>
                        </v-flex>
                        <v-flex>
                          <v-text-field v-model="withdrawReason" label="Motivo da retirada"></v-text-field>
                        </v-flex>
                      </v-card-text>
                      <v-divider></v-divider>
                      <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                          color="primary"
                          flat
                          @click="onWithdraw"
                          :disabled="!withdrawReason"
                        >Retirar</v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </v-flex>
              </v-layout>
            </v-container>
          </v-responsive>
        </v-card>
      </v-flex>
      <v-flex v-if="caixa.id" xs12>
        <v-card>
          <v-card-title primary-title>
            <div>
              <div class="headline">Informações do caixa #{{ caixa.id }}</div>
              <span>Tenha acesso a informações como o operador inicial, data e hora inicial, saldo inicial, operador final, data e hora final, saldo final bruto, saldo final real e montante retirado</span>
            </div>
          </v-card-title>
          <v-card-text>
            <v-layout row wrap>
              <v-flex xs12 sm6>
                <v-flex xs12>
                  Operador inicial:
                  <strong>{{caixa.operadorInicial }}</strong>
                </v-flex>
                <v-flex xs12>
                  Data e hora inicial:
                  <strong>{{caixa.created_at | formatDate }}</strong>
                </v-flex>
                <v-flex xs12>
                  Saldo inicial:
                  <strong>{{caixa.saldoInicial | formatPrice }}</strong>
                </v-flex>
              </v-flex>
              <v-flex xs12 sm6>
                <v-flex xs12>
                  Operador final:
                  <strong>{{caixa.operadorFinal }}</strong>
                </v-flex>
                <v-flex xs12>
                  Data e hora final:
                  <strong v-if="caixa.estado">{{caixa.updated_at | formatDate }}</strong>
                  <strong v-else></strong>
                </v-flex>
                <v-flex xs12>
                  Saldo final bruto (saldo inicial + dinheiro + cartão):
                  <strong
                    v-if="caixa.estado"
                  >{{caixa.saldoFinalBruto | formatPrice }}</strong>
                  <strong v-else>{{ saldoFinalBruto | formatPrice }}</strong>
                </v-flex>
                <v-flex xs12>
                  Saldo final real (saldo inicial + dinheiro):
                  <strong
                    v-if="caixa.estado"
                  >{{caixa.saldoFinalReal | formatPrice }}</strong>
                  <strong v-else>{{ saldoFinalReal | formatPrice }}</strong>
                </v-flex>
                <v-flex xs12>
                  Montante retirado:
                  <strong
                    v-if="caixa.estado"
                  >{{caixa.montanteRetirado | formatPrice }}</strong>
                  <strong v-else>{{montanteRetirado | formatPrice }}</strong>
                </v-flex>
              </v-flex>
            </v-layout>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex v-if="caixa.id && getUser.role === 'gestao'" xs12>
        <v-card>
          <v-card-title>
            <h2 class="headline">Histórico de movimentações</h2>
            <v-text-field class="mx-3" v-model="search" label="Pesquise por movimentações"></v-text-field>
            <v-select
              v-model="caixaId"
              :items="caixas"
              item-value="id"
              no-data-text="Não há histórico de caixas"
              label="Selecione um caixa"
            >
              <template slot="selection" slot-scope="data">
                <template
                  v-if="data.item.id !== '*'"
                >Caixa #{{data.item.id}} - Aberto em {{data.item.created_at | formatDate}}</template>
                <template v-else>
                  <strong>Todos os caixas - Desde {{data.item.created_at | formatDate}}</strong>
                </template>
              </template>
              <template slot="item" slot-scope="data">
                <template
                  v-if="data.item.id !== '*'"
                >Caixa #{{data.item.id}} - Aberto em {{data.item.created_at | formatDate}}</template>
                <template v-else>
                  <strong>Todos os caixas - Desde {{data.item.created_at | formatDate}}</strong>
                </template>
              </template>
            </v-select>

            <v-dialog
              ref="dialog"
              v-model="modal1"
              :return-value.sync="date1"
              persistent
              lazy
              full-width
              width="290px"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  v-model="date1"
                  type="date"
                  class="mx-2"
                  label="Data inicial"
                  prepend-inner-icon="event"
                  readonly
                  v-on="on"
                  clearable
                ></v-text-field>
              </template>
              <v-date-picker v-model="date1" locale="pt-br" scrollable>
                <v-spacer></v-spacer>
                <v-btn flat color="primary" @click="modal1 = false">Cancelar</v-btn>
                <v-btn flat color="primary" @click="$refs.dialog.save(date1)">OK</v-btn>
              </v-date-picker>
            </v-dialog>

            <v-dialog
              ref="dialog2"
              v-model="modal2"
              :return-value.sync="date2"
              persistent
              lazy
              full-width
              width="290px"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  v-model="date2"
                  type="date"
                  class="mx-2"
                  label="Data final"
                  prepend-inner-icon="event"
                  readonly
                  v-on="on"
                  clearable
                ></v-text-field>
              </template>
              <v-date-picker v-model="date2" locale="pt-br" scrollable>
                <v-spacer></v-spacer>
                <v-btn flat color="primary" @click="modal2 = false">Cancelar</v-btn>
                <v-btn flat color="primary" @click="$refs.dialog2.save(date2)">OK</v-btn>
              </v-date-picker>
            </v-dialog>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :loading="loadingAllCashboxes"
              :headers="headers"
              :search="search"
              :items="fluxosConsultas"
              :no-data-text="`Não há movimentações cadastradas no caixa #${caixaId} que atendem os filtros aplicados`"
              rows-per-page-text="Movimentações por página"
              :rows-per-page-items="[25, 50, 100, {'text':'Todas','value':-1}]"
            >
              <template v-slot:items="props">
                <tr :class="props.item.cancelado ? 'grey--text red-line' : ''">
                  <td class="text-xs-center">
                    <v-icon
                      :color="props.item.valor >= 0 ? props.item.cancelado ? 'grey' : 'primary' : 'error'"
                    >{{ props.item.valor >= 0 ? props.item.cancelado ? props.item.pagamento === 'Pendência de Leitura de Carteirinha' ? 'credit_card' : 'block' : 'add_circle' : 'remove_circle' }}</v-icon>
                  </td>
                  <td
                    v-if="props.item.pagamento !== 'Selo Digital' && props.item.pagamento !== 'Selo Físico' && props.item.pagamento !== 'Pendência de Leitura de Carteirinha'"
                  >{{ props.item.valor | formatPrice }}</td>
                  <td v-else>{{ props.item.valor }} selos</td>
                  <td class="text-capitalize">{{ props.item.pagamento }}</td>
                  <td class="text-capitalize">{{ props.item.evento }}</td>
                  <td>{{ props.item.matricula }}</td>
                  <td>{{ props.item.placa }}</td>
                  <td>{{ props.item.nome }}</td>
                  <td>{{ props.item.porte }}</td>
                  <td>{{ props.item.motivoRetirada }}</td>
                  <td>{{ props.item.operador }}</td>
                  <td>{{ props.item.local }}</td>
                  <td>{{ props.item.ambiente }}</td>
                  <td>{{ props.item.created_at | formatDate }}</td>
                  <td>{{ props.item.id }}</td>
                  <td>{{ props.item.parente }}</td>
                  <td>
                    <v-btn
                      v-if="!props.item.cancelado && props.item.movimentacao !== 'retirada' && props.item.caixa === caixa.id && props.item.pagamento !== 'Selo Digital'"
                      @click="editarMovimentacao(props.item)"
                      flat
                      icon
                    >
                      <v-icon>create</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import PageTitle from '@/components/template/PageTitle'
import { mapGetters } from 'vuex'

export default {
  name: 'Caixa',
  components: { PageTitle },
  data() {
    return {
      date1: null,
      date2: null,
      modal1: false,
      modal2: false,
      loadingAllCashboxes: true,
      loadingCashbox: true,
      divergencia: {
        modal: false,
        valor: false
      },
      movimentacao: {
        modal: false
      },
      search: '',
      saldoInicial: 0,
      withdrawModal: false,
      withdrawReason: '',
      openModal: false,
      caixaId: 1,
      withdraw: null,
      caixa: {},
      caixas: [],
      fluxos: [],
      fluxosConsultas: [],
      headers: [
        {
          text: '',
          value: 'movimentacao'
        },
        { text: 'Valor', value: 'valor' },
        { text: 'Pagamento', value: 'pagamento' },
        { text: 'Evento', value: 'evento' },
        { text: 'Matrícula', value: 'matricula' },
        { text: 'Placa', value: 'placa' },
        { text: 'Nome', value: 'nome' },
        { text: 'Porte', value: 'porte' },
        { text: 'Motivo', value: 'motivoRetirada' },
        { text: 'Operador', value: 'operador' },
        { text: 'Local', value: 'local' },
        { text: 'Dispositivo', value: 'ambiente' },
        { text: 'Data', value: 'created_at' },
        { text: 'ID', value: 'id' },
        { text: 'Referência', value: 'parente' },
        { text: '', value: 'actions' }
      ]
    }
  },
  computed: {
    ...mapGetters('user', ['getUser']),
    saldoFinalBruto() {
      let retiradas = 0
      let lucroTotal = this.caixa.saldoInicial
      this.fluxos.forEach(fluxo => {
        if (
          fluxo.evento !== 'divergência' &&
          !fluxo.cancelado &&
          fluxo.pagamento !== 'Selo Digital' &&
          fluxo.pagamento !== 'Selo Físico'
        ) {
          if (fluxo.movimentacao !== 'retirada') lucroTotal += fluxo.valor
          if (fluxo.movimentacao === 'retirada') retiradas += fluxo.valor
        }
      })
      return lucroTotal + retiradas
    },
    saldoFinalReal() {
      let retiradas = 0
      let lucroAReceber = 0
      let lucroTotal = this.caixa.saldoInicial
      this.fluxos.forEach(fluxo => {
        if (
          fluxo.evento !== 'divergência' &&
          !fluxo.cancelado &&
          fluxo.pagamento !== 'Selo Digital' &&
          fluxo.pagamento !== 'Selo Físico'
        ) {
          if (fluxo.movimentacao !== 'retirada') lucroTotal += fluxo.valor
          if (fluxo.movimentacao === 'retirada') retiradas += fluxo.valor
          if (
            (fluxo.movimentacao === 'pagamento' &&
              fluxo.pagamento === 'Cartão de débito') ||
            fluxo.pagamento === 'Cartão de crédito'
          )
            lucroAReceber += fluxo.valor
        }
      })
      return lucroTotal - lucroAReceber + retiradas
    },
    montanteRetirado() {
      let retiradas = 0
      this.fluxos.forEach(fluxo => {
        if (
          fluxo.evento !== 'divergência' &&
          !fluxo.cancelado &&
          fluxo.pagamento !== 'Selo Digital' &&
          fluxo.pagamento !== 'Selo Físico'
        ) {
          if (fluxo.movimentacao === 'retirada') retiradas += fluxo.valor
        }
      })
      return retiradas
    }
  },
  methods: {
    autoWithdraw() {
      this.$api
        .post('cash/withdraw', {
          id: this.caixa.id,
          movimentacao: 'retirada',
          pagamento: 'Dinheiro',
          evento: this.divergencia.valor > 0 ? 'retirada' : 'entrada',
          tipo: 'Funcionário',
          valor: this.divergencia.valor * -1,
          operador: this.getUser.username,
          motivoRetirada: `[Motivo automático] ${
            this.divergencia.valor > 0 ? 'Retirada' : 'Entrada'
          } para atingir o saldo inicial do caixa definido pelo administrador.`
        })
        .then(() => {
          this.divergencia = {
            modal: false,
            valor: 0
          }
          this.withdrawModal = false
          this.withdraw = null
          this.withdrawReason = ''
          this.loadLastCashbox()
          this.loadCashboxes()
          setTimeout(() => {
            this.$api
              .post('cash/close', {
                id: this.caixa.id,
                operadorFinal: this.getUser.username,
                saldoFinalBruto: this.saldoFinalBruto,
                saldoFinalReal: this.saldoFinalReal,
                montanteRetirado: this.montanteRetirado
              })
              .then(() => {
                this.$store.commit('snackbar/showMessage', {
                  text: 'Caixa fechado com sucesso',
                  color: 'primary'
                })
                this.loadLastCashbox()
                this.loadCashboxes()
              })
              .catch(err => {
                if (err.response.data.error === 'divergência') {
                  this.divergencia = {
                    modal: true,
                    valor: err.response.data.value
                  }
                } else {
                  this.$store.commit('snackbar/showMessage', {
                    text: err.response.data,
                    color: 'error'
                  })
                }
              })
          }, 250)
        })
        .catch(err => {
          this.$store.commit('snackbar/showMessage', {
            text: err.response.data,
            color: 'error'
          })
        })
    },
    editarMovimentacao(item) {
      this.movimentacao = Object.assign({}, item)
      this.movimentacao.modal = true
    },
    salvarMovimentacao() {
      this.movimentacao.operador = this.getUser.username
      this.$api
        .post('fluxos/editar', this.movimentacao)
        .then(() => {
          this.$store.commit('snackbar/showMessage', {
            text: 'Fluxo editado com sucesso',
            color: 'primary'
          })
          this.loadLastCashbox()
          this.loadCashboxes()
          this.$api(`cash/${this.movimentacao.caixa}`)
            .then(res => (this.fluxosConsultas = res.data))
            .catch(err => {
              this.$store.commit('snackbar/showMessage', {
                text: err.response.data,
                color: 'error'
              })
            })
          this.movimentacao = {
            modal: false
          }
        })
        .catch(err => {
          this.$store.commit('snackbar/showMessage', {
            text: err.response.data,
            color: 'error'
          })
        })
    },
    onWithdraw() {
      if (this.withdraw < 0) {
        this.withdraw = this.withdraw * -1
      }
      this.$api
        .post('cash/withdraw', {
          id: this.caixa.id,
          movimentacao: 'retirada',
          pagamento: 'Dinheiro',
          evento: 'retirada',
          tipo: 'Funcionário',
          valor: this.withdraw * -1,
          operador: this.getUser.username,
          motivoRetirada: this.withdrawReason
        })
        .then(() => {
          this.withdrawModal = false
          this.withdraw = null
          this.withdrawReason = ''
          this.loadLastCashbox()
          this.loadCashboxes()
        })
        .catch(err => {
          this.$store.commit('snackbar/showMessage', {
            text: err.response.data,
            color: 'error'
          })
        })
    },
    loadCashboxes() {
      this.$api('cash/all')
        .then(res => (this.caixas = res.data))
        .catch(err => {
          this.$store.commit('snackbar/showMessage', {
            text: err.response.data,
            color: 'error'
          })
        })
    },
    loadLastCashbox() {
      this.$api('cash')
        .then(response => {
          this.caixa = response.data.caixa
          if (response.data.caixa.saldoFinalReal)
            this.saldoInicial = response.data.caixa.saldoFinalReal
          this.fluxos = response.data.fluxos
          this.fluxosConsultas = response.data.fluxos
          this.caixaId = response.data.caixa.id
          this.loadingCashbox = false
        })
        .catch(err => {
          this.$store.commit('snackbar/showMessage', {
            text: err.response.data,
            color: 'error'
          })
        })
    },
    openCashbox() {
      if (this.caixa.saldoFinalReal !== this.saldoInicial) {
        this.$api
          .post('cash/open', {
            operadorInicial: this.getUser.username,
            saldoInicial: this.saldoInicial
          })
          .then(() => {
            this.$store.commit('snackbar/showMessage', {
              text: 'Caixa aberto com sucesso',
              color: 'primary'
            })
            this.loadLastCashbox()
            this.loadCashboxes()
          })
          .catch(err => {
            this.$store.commit('snackbar/showMessage', {
              text: err.response.data,
              color: 'error'
            })
          })
      } else {
        this.$api
          .post('cash/open', {
            operadorInicial: this.getUser.username,
            saldoInicial: this.saldoInicial
          })
          .then(() => {
            this.$store.commit('snackbar/showMessage', {
              text: 'Caixa aberto com sucesso',
              color: 'primary'
            })
            this.loadLastCashbox()
            this.loadCashboxes()
          })
          .catch(err => {
            this.$store.commit('snackbar/showMessage', {
              text: err.response.data,
              color: 'error'
            })
          })
      }
    },
    closeCashbox() {
      this.$api
        .post('cash/close', {
          id: this.caixa.id,
          operadorFinal: this.getUser.username,
          saldoFinalBruto: this.saldoFinalBruto,
          saldoFinalReal: this.saldoFinalReal,
          montanteRetirado: this.montanteRetirado
        })
        .then(() => {
          this.$store.commit('snackbar/showMessage', {
            text: 'Caixa fechado com sucesso',
            color: 'primary'
          })
          this.loadLastCashbox()
          this.loadCashboxes()
        })
        .catch(err => {
          if (err.response.data.error === 'divergência') {
            this.divergencia = {
              modal: true,
              valor: err.response.data.value
            }
          } else {
            this.$store.commit('snackbar/showMessage', {
              text: err.response.data,
              color: 'error'
            })
          }
        })
    }
  },
  created() {
    this.user = this.getUser
    this.loadLastCashbox()
    this.loadCashboxes()
  },
  watch: {
    caixaId(newValue, oldValue) {
      if (this.getUser.role === 'gestao') {
        this.loadingAllCashboxes = true
        this.$api(
          `cash/${newValue}?${this.date1 ? `de=${this.date1}` : ''}${
            this.date2 ? `&ate=${this.date2}` : ''
          }`
        )
          .then(res => {
            this.fluxosConsultas = res.data
            this.loadingAllCashboxes = false
          })
          .catch(err => {
            this.$store.commit('snackbar/showMessage', {
              text: err.response.data,
              color: 'error'
            })
          })

          this.modal1 = false
          this.modal2 = false
          this.date1 = false
          this.date2 = false
      }
    }
  }
}
</script>

<style>
</style>
