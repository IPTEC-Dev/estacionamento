<template>
  <div>
    <PageTitle
      title="Saída retroativa"
      description="Registre uma saída em um horário que a guarita não está aberta"
    />
    <v-card>
      <v-card-text>
        <v-layout row wrap>
          <v-flex xs12 sm4>
            <v-text-field
              prepend-inner-icon="directions_car"
              v-model="exit.plate"
              label="Placa"
              mask="NNNNNNNNN"
            ></v-text-field>
          </v-flex>
          <v-flex xs12 sm4>
            <v-menu
              v-model="exit.dateModal"
              :close-on-content-click="false"
              lazy
              transition="scale-transition"
              offset-y
              full-width
              min-width="290px"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  v-model="exit.date"
                  type="date"
                  label="Data"
                  prepend-inner-icon="event"
                  readonly
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker locale="pt-br" v-model="exit.date" @input="exit.dateModal = false"></v-date-picker>
            </v-menu>
          </v-flex>
          <v-flex xs12 sm4>
            <v-menu
              ref="menu"
              v-model="exit.timeModal"
              :close-on-content-click="false"
              :return-value.sync="exit.time"
              lazy
              transition="scale-transition"
              offset-y
              full-width
              max-width="290px"
              min-width="290px"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  v-model="exit.time"
                  label="Horário"
                  prepend-inner-icon="access_time"
                  readonly
                  v-on="on"
                ></v-text-field>
              </template>
              <v-time-picker
                v-if="exit.timeModal"
                v-model="exit.time"
                full-width
                @click:minute="$refs.menu.save(exit.time)"
              ></v-time-picker>
            </v-menu>
          </v-flex>
        </v-layout>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          @click="register"
          depressed
          :disabled="!exit.plate || !exit.date || !exit.time"
        >Registrar</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import PageTitle from '@/components/template/PageTitle'
import { mapGetters } from 'vuex'

export default {
  name: 'SaidaRetroativa',
  components: { PageTitle },
  computed: { ...mapGetters('user', ['getUser']) },
  data() {
    return {
      exit: {}
    }
  },
  methods: {
    reset() {
      this.exit = {}
    },
    register() {
      this.$api
        .post('saidaRetroativa', {
          placa: this.exit.plate,
          data: this.exit.date,
          horario: this.exit.time,
          operador: this.getUser.username
        })
        .then(() => {
          this.$store.commit('snackbar/showMessage', {
            text: 'Saída retroativa inserida com sucesso',
            color: 'primary'
          })
          this.reset()
        })
        .catch(error => {
          this.$store.commit('snackbar/showMessage', {
            text: error.response.data,
            color: 'error'
          })
        })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>