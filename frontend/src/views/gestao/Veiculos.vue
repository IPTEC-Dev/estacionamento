<template>
  <div>
    <PageTitle
      title="Veículos cadastrados"
      description="Controle todos os veículos previamente cadastrados no sistema"
    />
    <v-layout row wrap>
      <v-flex>
        <v-card>
          <v-card-title>
            <v-text-field
              box
              v-model="search"
              prepend-inner-icon="search"
              label="Pesquisar em veículos cadastrados"
              clearable
              hide-details
            ></v-text-field>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :loading="loadingData"
              :headers="headers"
              :items="veiculos"
              :search="search"
              no-data-text="Não há veículos cadastrados"
              rows-per-page-text="Veículos por página"
              :rows-per-page-items="[25, 50, 100, {'text':'Todos','value':-1}]"
            >
              <template slot="items" slot-scope="props">
                <tr @click="props.expanded = !props.expanded">
                  <td>
                    <strong>{{ props.item.placa }}</strong>
                  </td>
                  <td>{{ props.item.nome }}</td>
                  <td>{{ props.item.matricula }}</td>
                  <td>{{ props.item.tipo }}</td>
                  <td>{{ props.item.autorizante }}</td>
                  <td>{{ props.item.modelo }}</td>
                  <td>{{ props.item.cor }}</td>
                  <td>{{ props.item.operador }}</td>
                  <td>{{ props.item.updated_at | formatDate }}</td>
                  <td>
                    <v-btn icon ripple>
                      <v-menu offset-y left>
                        <v-icon slot="activator" color="grey">more_vert</v-icon>
                        <v-list>
                          <v-list-tile @click="edit(props.item.id)">
                            <v-list-tile-title>Editar</v-list-tile-title>
                          </v-list-tile>
                          <v-list-tile @click="remove(props.item.id)">
                            <v-list-tile-title>Excluir</v-list-tile-title>
                          </v-list-tile>
                        </v-list>
                      </v-menu>
                    </v-btn>
                  </td>
                </tr>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <v-dialog v-model="dialog" width="500">
      <template v-slot:activator="{ on }">
        <v-btn color="primary" dark fab bottom fixed right v-on="on">
          <v-icon>add</v-icon>
        </v-btn>
      </template>
      <v-card>
        <v-card-title
          class="headline primary white--text"
        >{{ veiculo.id ? 'Editar veículo' : 'Cadastrar veículo' }}</v-card-title>
        <v-card-text>
          <form @submit.prevent="save">
            <v-layout row wrap>
              <v-flex xs12>
                <v-autocomplete
                  :items="pessoas"
                  v-model="veiculo.pessoa"
                  label="Pessoa"
                  item-value="id"
                  item-text="nome"
                  prepend-inner-icon="person"
                  no-data-text="Não há pessoas para serem exibidas"
                >
                  <template
                    slot="selection"
                    slot-scope="data"
                  >{{ data.item.nome }} - {{ data.item.matricula }}</template>
                  <template
                    slot="item"
                    slot-scope="data"
                  >{{ data.item.nome }} - {{ data.item.matricula }}</template>
                </v-autocomplete>
              </v-flex>
              <v-flex xs12>
                <v-text-field
                  label="Placa"
                  prepend-inner-icon="directions_car"
                  v-model="veiculo.placa"
                  mask="NNNNNNNNN"
                ></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-text-field label="Modelo" prepend-inner-icon="bookmark" v-model="veiculo.modelo"></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-text-field label="Cor" prepend-inner-icon="color_lens" v-model="veiculo.cor"></v-text-field>
              </v-flex>
              <button type="submit" style="display: none;">Cadastrar</button>
            </v-layout>
          </form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click="reset">Cancelar</v-btn>
          <v-btn color="primary" flat @click="save">{{ veiculo.id ? 'Editar' : 'Cadastrar' }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import PageTitle from '@/components/template/PageTitle'
import { mapGetters } from 'vuex'

export default {
  name: 'Veiculos',
  components: { PageTitle },
  computed: mapGetters('user', ['getUser']),
  data() {
    return {
      search: '',
      dialog: false,
      loadingData: true,
      veiculo: {},
      veiculos: [],
      pessoas: [],
      headers: [
        { text: 'Placa', value: 'placa' },
        { text: 'Motorista', value: 'nome' },
        { text: 'Matrícula', value: 'matricula' },
        { text: 'Tipo', value: 'tipo' },
        { text: 'Autorizante', value: 'autorizante' },
        { text: 'Veículo', value: 'modelo' },
        { text: 'Cor', value: 'cor' },
        { text: 'Operador', value: 'operador' },
        { text: 'Data de atualização', value: 'updated_at' },
        { text: ' ', value: 'actions', sortable: false }
      ]
    }
  },
  methods: {
    remove(id) {
      this.$api
        .delete(`veiculos/${id}`)
        .then(() => {
          this.reset()
          this.$store.commit('snackbar/showMessage', {
            text: 'Veículo deletado com sucesso',
            color: 'primary'
          })
        })
        .catch(err => {
          this.$store.commit('snackbar/showMessage', {
            text: err.response.data,
            color: 'error'
          })
        })
    },
    edit(id) {
      this.$api(`veiculos/${id}`)
        .then(response => {
          this.veiculo = response.data
          this.dialog = true
        })
        .catch(err => {
          this.$store.commit('snackbar/showMessage', {
            text: err.response.data,
            color: 'error'
          })
        })
    },
    save() {
      if (this.veiculo.id) {
        this.veiculo.operador = this.getUser.username
        delete this.veiculo.created_at
      }
      this.$api
        .post(`veiculos${this.veiculo.id ? '/' + this.veiculo.id : ''}`, {
          ...this.veiculo,
          operador: this.getUser.username
        })
        .then(() => {
          this.reset()
          this.$store.commit('snackbar/showMessage', {
            text: 'Veículo saldo com sucesso',
            color: 'primary'
          })
        })
        .catch(err => {
          this.$store.commit('snackbar/showMessage', {
            text: err.response.data,
            color: 'error'
          })
        })
    },
    reset() {
      this.search = ''
      this.dialog = false
      this.veiculo = {}
      this.loadData()
    },
    loadData() {
      this.loadingData = true
      this.$api('veiculos')
        .then(response => {
          this.veiculos = response.data
        })
        .catch(err => {
          this.$store.commit('snackbar/showMessage', {
            text: err.response.data,
            color: 'error'
          })
        })
      this.$api('pessoas')
        .then(response => {
          this.loadingData = false
          this.pessoas = response.data
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
    this.loadData()
  }
}
</script>

<style lang="scss" scoped>
</style>