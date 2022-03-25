<template>
  <div>
    <PageTitle
      title="Pessoas cadastradas"
      description="Consulte por todas as pessoas cadastradas no sistema"
    />
    <v-layout row wrap>
      <v-flex>
        <v-card>
          <v-card-title>
            <v-text-field
              box
              v-model="search"
              prepend-inner-icon="search"
              label="Pesquisar em pessoas cadastradas"
              clearable
              hide-details
            ></v-text-field>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :loading="loadingPeople"
              :headers="headers"
              :items="pessoas"
              :search="search"
              no-data-text="Não há pessoas cadastradas"
              rows-per-page-text="Pessoas por página"
              :rows-per-page-items="[25, 50, 100, {'text':'Todas','value':-1}]"
            >
              <template slot="items" slot-scope="props">
                <tr @click="props.expanded = !props.expanded">
                  <td>{{ props.item.matricula }}</td>
                  <td>{{ props.item.nome }}</td>
                  <td>{{ props.item.tipo }}</td>
                  <td>{{ props.item.autorizante }}</td>
                  <td>{{ props.item.operador }}</td>
                  <td>{{ props.item.created_at | formatDate }}</td>
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
        >{{ pessoa.id ? 'Editar pessoa' : 'Cadastrar pessoa' }}</v-card-title>
        <v-card-text>
          <form @submit.prevent="save">
            <v-layout row wrap>
              <v-flex xs12>
                <v-text-field label="Nome" prepend-inner-icon="person" v-model="pessoa.nome"></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-text-field
                  label="Matrícula"
                  type="number"
                  prepend-inner-icon="credit_card"
                  v-model="pessoa.matricula"
                ></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-select
                  prepend-inner-icon="category"
                  :items="['Funcionário', 'Credenciado', 'Conselheiro', 'Atleta']"
                  label="Tipo"
                  v-model="pessoa.tipo"
                ></v-select>
              </v-flex>
              <v-flex xs12 v-if="pessoa.tipo === 'Credenciado'">
                <v-text-field
                  label="Autorizante"
                  prepend-inner-icon="lock"
                  v-model="pessoa.autorizante"
                ></v-text-field>
              </v-flex>
              <button type="submit" style="display: none;">Cadastrar</button>
            </v-layout>
          </form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click="reset">Cancelar</v-btn>
          <v-btn color="primary" flat @click="save">{{ pessoa.id ? 'Editar' : 'Cadastrar' }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import PageTitle from '@/components/template/PageTitle'
import { mapGetters } from 'vuex'

export default {
  name: 'Pessoas',
  components: { PageTitle },
  computed: {
    ...mapGetters('user', ['getUser']),
    filteredPeople() {
      return this.pessoas.filter(pessoa => {
        return (
          pessoa.nome.toLowerCase().includes(this.search.toLowerCase()) ||
          pessoa.tipo.toLowerCase().includes(this.search.toLowerCase()) ||
          pessoa.operador.toLowerCase().includes(this.search.toLowerCase())
        )
      })
    }
  },
  data() {
    return {
      search: '',
      dialog: false,
      loadingPeople: true,
      pessoa: {},
      pessoas: [],
      headers: [
        { text: 'Matrícula', value: 'matricula' },
        { text: 'Nome', value: 'nome' },
        { text: 'Tipo', value: 'tipo' },
        { text: 'Autorizante', value: 'autorizante' },
        { text: 'Operador', value: 'operador' },
        { text: 'Criado em', value: 'created_at' },
        { text: 'Atualizado em', value: 'updated_at' },
        { text: ' ', value: 'actions', sortable: false }
      ]
    }
  },
  methods: {
    remove(id) {
      this.$api
        .delete(`pessoas/${id}`)
        .then(() => this.reset())
        .catch(err => {
          this.$store.commit('snackbar/showMessage', {
            text: err.response.data,
            color: 'error'
          })
        })
    },
    edit(id) {
      this.$api(`pessoas/${id}`)
        .then(response => {
          this.pessoa = response.data
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
      if (this.pessoa.id) this.pessoa.operador = this.getUser.username
      this.$api
        .post(`pessoas${this.pessoa.id ? '/' + this.pessoa.id : ''}`, {
          ...this.pessoa,
          operador: this.getUser.username
        })
        .then(() => this.reset())
        .catch(err => {
          this.$store.commit('snackbar/showMessage', {
            text: err.response.data,
            color: 'error'
          })
        })
    },
    reset() {
      this.dialog = false
      this.pessoa = {}
      this.pessoas = []
      this.loadPeople()
    },
    loadPeople() {
      this.loadingPeople = true
      this.$api('pessoas')
        .then(response => {
          this.loadingPeople = false
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
    this.loadPeople()
  }
}
</script>

<style scoped>
.v-btn--floating {
  margin: 0 10px 10px 0;
}
</style>