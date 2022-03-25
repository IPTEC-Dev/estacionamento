<template>
  <div>
    <PageTitle title="Ocorrências" description="Consulte todas as ocorrências já registradas"/>
    <v-card>
      <v-card-title>
        <v-text-field
          v-model="search"
          prepend-inner-icon="search"
          label="Pesquisar em ocorrências"
          clearable
          box
          hide-details
        ></v-text-field>
      </v-card-title>
      <v-data-table
        :loading="loadingOcorrencias"
        :headers="headers"
        :items="ocorrencias"
        :search="search"
        no-data-text="Não há ocorrências cadastradas"
        rows-per-page-text="Ocorrências por página"
        :rows-per-page-items="[25, 50, 100, {'text':'Todas','value':-1}]"
      >
        <template slot="items" slot-scope="props">
          <tr @click="props.expanded = !props.expanded">
            <td>
              <strong>Nº {{ props.item.id }}</strong>
            </td>
            <td>{{ props.item.matricula }}</td>
            <td>{{ props.item.descricao }}</td>
            <td>{{ props.item.operador }}</td>
            <td>{{ props.item.created_at | formatDate }}</td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import PageTitle from '@/components/template/PageTitle'

export default {
  name: 'Ocorrencias',
  components: { PageTitle },
  data() {
    return {
      loadingOcorrencias: true,
      ocorrencias: [],
      search: '',
      headers: [
        { text: 'Número', value: 'id' },
        { text: 'Matrícula', value: 'matricula' },
        { text: 'Descrição', value: 'descricao' },
        { text: 'Operador', value: 'operador' },
        { text: 'Entrada', value: 'created_at' }
      ]
    }
  },
  methods: {
    getOcorrencias() {
      this.$api('/ocorrencias')
        .then(res => {
          this.ocorrencias = res.data
          this.loadingOcorrencias = false
        })
        .catch(err => {
          this.$store.commit('snackbar/showMessage', {
            text: err.response.data,
            color: 'error'
          })
        })
    }
  },
  mounted() {
    this.getOcorrencias()
  }
}
</script>

<style>
</style>