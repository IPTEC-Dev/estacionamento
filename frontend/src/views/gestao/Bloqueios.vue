<template>
  <div>
    <PageTitle
      title="Bloqueios"
      description="Bloqueie um veículo pela placa ou pela matrícula de um sócio"
    />
    <v-layout row wrap>
      <v-flex xs12>
        <v-card>
          <v-card-text>
            <v-form @submit.prevent="onLock">
              <v-layout row wrap>
                <v-flex xs12 sm4>
                  <v-select
                    :items="['Placa', 'Matrícula']"
                    :rules="defaultRules"
                    counter="255"
                    clearable
                    label="O que será bloqueado?"
                    v-model="lock.type"
                    required
                  ></v-select>
                </v-flex>
                <v-flex xs12 sm4>
                  <v-text-field
                    v-model="lock.value"
                    :rules="defaultRules"
                    counter="255"
                    clearable
                    :disabled="!lock.type"
                    return-masked-value
                    :mask="lock.type !== 'Placa' ? 'nnnnnn-nn' : 'NNNNNNNNNNNNNNNNNNNNN'"
                    :label="!lock.type ? 'Selecione o que será bloqueado' : (lock.type === 'Placa' ? 'Digite a placa do veículo' : 'Digite a matrícula do sócio')"
                    required
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 sm4>
                  <v-text-field
                    v-model="lock.reason"
                    :rules="defaultRules"
                    counter="255"
                    clearable
                    :disabled="!lock.type"
                    label="Motivo do bloqueio"
                    required
                  ></v-text-field>
                </v-flex>
              </v-layout>
              <button type="submit" style="display: none">Bloquear</button>
            </v-form>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-card-actions>
              <v-btn flat @click="reset">Limpar campos</v-btn>
              <v-btn
                depressed
                color="primary"
                @click="onLock"
                :disabled="!lock.type || !lock.value || !lock.reason"
              >Bloquear</v-btn>
            </v-card-actions>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
    <v-layout row wrap>
      <v-flex xs12>
        <v-card>
          <v-card-title>
            <v-text-field
              v-model="searchPlates"
              label="Pesquise por placas bloqueadas"
              clearable
              box
              hide-details
            ></v-text-field>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :loading="loadingPlates"
              :headers="headersPlates"
              :items="plates"
              :search="searchPlates"
              no-data-text="Não há placas bloqueadas"
              rows-per-page-text="Placas por página"
              :rows-per-page-items="[25, 50, 100, {'text':'Todas','value':-1}]"
            >
              <template slot="items" slot-scope="props">
                <tr @click="props.expanded = !props.expanded">
                  <td>
                    <strong>{{ props.item.placa }}</strong>
                  </td>
                  <td>{{ props.item.motivo }}</td>
                  <td>{{ props.item.operador }}</td>
                  <td>{{ props.item.created_at | formatDate }}</td>
                  <td>
                    <v-btn flat icon color="error" @click="deleteLock(props.item.id)">
                      <v-icon>delete</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <v-layout row wrap>
      <v-flex xs12>
        <v-card>
          <v-card-title>
            <v-text-field
              v-model="searchRegistrations"
              label="Pesquise por matrículas bloqueadas"
              clearable
              box
              hide-details
            ></v-text-field>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :loading="loadingRegistrations"
              :headers="headersRegistrations"
              :items="registrations"
              :search="searchRegistrations"
              no-data-text="Não há matrículas bloqueadas"
              rows-per-page-text="Matrículas por página"
              :rows-per-page-items="[25, 50, 100, {'text':'Todas','value':-1}]"
            >
              <template slot="items" slot-scope="props">
                <tr @click="props.expanded = !props.expanded">
                  <td>
                    <strong>{{ props.item.matricula }}</strong>
                  </td>
                  <td>{{ props.item.motivo }}</td>
                  <td>{{ props.item.operador }}</td>
                  <td>{{ props.item.created_at | formatDate }}</td>
                  <td>
                    <v-btn flat icon color="error" @click="deleteLock(props.item.id)">
                      <v-icon>delete</v-icon>
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
  name: 'Bloqueios',
  components: { PageTitle },
  computed: { ...mapGetters('user', ['getUser']) },
  data() {
    return {
      loadingRegistrations: true,
      loadingPlates: true,
      headersPlates: [
        { text: 'Placa', value: 'placa' },
        { text: 'Motivo', value: 'motivo' },
        { text: 'Operador', value: 'operador' },
        { text: 'Data', value: 'created_at' },
        { text: '', value: 'action' }
      ],
      headersRegistrations: [
        { text: 'Matrícula', value: 'matricula' },
        { text: 'Motivo', value: 'motivo' },
        { text: 'Operador', value: 'operador' },
        { text: 'Data', value: 'created_at' },
        { text: '', value: 'action' }
      ],
      plates: [],
      registrations: [],
      searchPlates: '',
      searchRegistrations: '',
      lock: {},
      defaultRules: [
        v => !!v || 'Este campo é obrigatório',
        v =>
          (v && v.length <= 255) || 'Este campo tem um limite de 255 caracteres'
      ]
    }
  },
  methods: {
    reset() {
      this.lock = {}
    },
    onLock() {
      this.$api
        .post('locked', {
          type: this.lock.type === 'Placa' ? 'plate' : 'registration',
          value: this.lock.value,
          reason: this.lock.reason,
          operator: this.getUser.username
        })
        .then(() => {
          this.reset()
          this.loadPlates()
          this.loadRegistrations()
        })
        .catch(err => {
          this.$store.commit('snackbar/showMessage', {
            text: err.response.data,
            color: 'error'
          })
        })
    },
    loadPlates() {
      this.$api('locked/plates')
        .then(res => {
          this.plates = res.data
          this.loadingPlates = false
        })
        .catch(err => {
          this.$store.commit('snackbar/showMessage', {
            text: err.response.data,
            color: 'error'
          })
        })
    },
    loadRegistrations() {
      this.$api('locked/registrations')
        .then(res => {
          this.registrations = res.data
          this.loadingRegistrations = false
        })
        .catch(err => {
          this.$store.commit('snackbar/showMessage', {
            text: err.response.data,
            color: 'error'
          })
        })
    },
    deleteLock(id) {
      this.$api
        .delete(`locked/${id}`)
        .then(() => {
          this.loadPlates()
          this.loadRegistrations()
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
    this.loadPlates()
    this.loadRegistrations()
  }
}
</script>

<style>
</style>
