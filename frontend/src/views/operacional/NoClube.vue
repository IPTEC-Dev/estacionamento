<template>
  <div>
    <PageTitle
      title="Veículos no clube"
      description="Veículos que não tiveram uma saída registrada"
    />
    <v-card>
      <v-card-title>
        <v-text-field
          v-model="search"
          prepend-inner-icon="search"
          label="Pesquisar em veículos no clube"
          clearable
          box
          hide-details
        ></v-text-field>
      </v-card-title>
      <v-data-table
        :loading="loadingVehicles"
        :headers="headers"
        :items="vehicles"
        :search="search"
        no-data-text="Não há veículos dentro do clube"
        rows-per-page-text="Veículos por página"
        :rows-per-page-items="[25, 50, 100, {'text':'Todos','value':-1}]"
      >
        <template slot="items" slot-scope="props">
          <tr @click="props.expanded = !props.expanded">
            <td>
              <strong>{{ props.item.placa }}</strong>
            </td>
            <td>{{ props.item.matricula }}</td>
            <td>{{ props.item.nome }}</td>
            <td>{{ props.item.tipo }}</td>
            <td>{{ props.item.porte }}</td>
            <td>{{ props.item.local }}</td>
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
  name: 'NoClube',
  components: { PageTitle },
  data() {
    return {
      loadingVehicles: true,
      vehicles: [],
      search: '',
      headers: [
        { text: 'Placa', value: 'placa' },
        { text: 'Matrícula', value: 'matricula' },
        { text: 'Motorista', value: 'nome' },
        { text: 'Tipo', value: 'tipo' },
        { text: 'Porte', value: 'porte' },
        { text: 'Local', value: 'local' },
        { text: 'Entrada', value: 'created_at' }
      ]
    }
  },
  methods: {
    loadVehicles() {
      this.$api('vehicles/insideTheClub')
        .then(res => {
          this.vehicles = res.data
          this.loadingVehicles = false
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
    this.loadVehicles()
  }
}
</script>

<style>
</style>
