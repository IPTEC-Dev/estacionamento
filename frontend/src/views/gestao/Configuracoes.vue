<template>
  <div>
    <PageTitle
      title="Configurações do sistema"
      description="Controle preços e horários do sistema"
    />
    <v-layout row wrap>
      <v-flex>
        <v-alert :value="true" type="info">
          Note que as configurações de selos são feitas no sistema
          <strong>CrediTimão</strong>.
        </v-alert>
      </v-flex>
    </v-layout>
    <v-layout row wrap>
      <v-flex xs12>
        <v-card>
          <v-card-title>
            <h1 class="headline mb-0">Preços</h1>
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="save" v-model="valid" v-if="!loadingSettings">
              <v-layout row wrap>
                <v-flex xs12 sm6>
                  <v-text-field
                    prefix="R$"
                    v-model.number="settings.zeroAQuatro"
                    label="De 0 a 4 horas"
                    :rules="defaultRules"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 sm6>
                  <v-text-field
                    prefix="R$"
                    v-model.number="settings.quatroAOito"
                    label="De 4 a 8 horas"
                    :rules="defaultRules"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 sm6>
                  <v-text-field
                    prefix="R$"
                    v-model.number="settings.oitoADoze"
                    label="De 8 a 12 horas"
                    :rules="defaultRules"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 sm6>
                  <v-text-field
                    prefix="R$"
                    v-model.number="settings.acimaDeDoze"
                    label="Acima de 12 horas"
                    :rules="defaultRules"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 sm6>
                  <v-text-field
                    prefix="R$"
                    v-model.number="settings.motocicleta"
                    label="Motocicleta"
                    :rules="defaultRules"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 sm6>
                  <v-text-field
                    prefix="R$"
                    v-model.number="settings.proximoDia"
                    label="Próximo dia"
                    :rules="defaultRules"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-text-field
                    prefix="R$"
                    v-model.number="settings.aposHorarioLimite"
                    label="Preço fixo após o horário limite"
                    :rules="defaultRules"
                    type="number"
                    min="0"
                  ></v-text-field>
                </v-flex>
              </v-layout>
              <button type="submit" style="display: none">Salvar</button>
            </v-form>
            <v-flex xs12 v-else text-xs-center>
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </v-flex>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <v-layout row wrap>
      <v-flex xs12>
        <v-card>
          <v-card-title>
            <h1 class="headline mb-0">Horários</h1>
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="save" v-if="!loadingSettings">
              <v-layout row wrap>
                <v-flex xs12 sm6>
                  <v-text-field
                    prepend-inner-icon="alarm"
                    v-model.number="settings.horarioLimite"
                    label="Horário limite"
                    suffix="horas"
                    :rules="defaultRules"
                    :hint="`Após este horário, todos os veículos pagarão R$ ${settings.aposHorarioLimite} na entrada`"
                    persistent-hint
                    type="number"
                    max="23"
                    min="0"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 sm6>
                  <v-text-field
                    prepend-inner-icon="av_timer"
                    v-model.number="settings.tolerancia"
                    label="Tolerância"
                    suffix="minutos"
                    :rules="defaultRules"
                    type="number"
                  ></v-text-field>
                </v-flex>
              </v-layout>
              <button type="submit" style="display: none;">Salvar</button>
            </v-form>
            <v-flex xs12 v-else text-xs-center>
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </v-flex>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <v-layout row wrap>
      <v-flex xs12>
        <v-card>
          <v-card-title>
            <h1 class="headline mb-0">Caixas</h1>
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="save" v-if="!loadingSettings">
              <v-layout row wrap>
                <v-flex xs12>
                  <v-text-field
                    prefix="R$"
                    v-model.number="settings.valorInicialCaixa"
                    label="Saldo inicial do caixa"
                    :rules="defaultRules"
                    type="number"
                    min="0"
                  ></v-text-field>
                </v-flex>
              </v-layout>
            </v-form>
            <v-flex xs12 v-else text-xs-center>
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </v-flex>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <v-layout row wrap>
      <v-flex xs12>
        <v-card>
          <v-card-text>
            <v-flex xs12 v-if="!loadingSettings">
              Última vez alterado por
              <strong>{{settings.operador}}</strong> em
              <strong>{{settings.updated_at | formatDate}}</strong>.
            </v-flex>
            <v-flex xs12 v-else text-xs-center>
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </v-flex>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" depressed @click="save" :disabled="!valid">Salvar configurações</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import PageTitle from '@/components/template/PageTitle'
import { mapGetters } from 'vuex'

export default {
  name: 'Configuracoes',
  components: { PageTitle },
  computed: {
    ...mapGetters('user', ['getUser'])
  },
  data() {
    return {
      loadingSettings: true,
      valid: false,
      defaultRules: [v => !!v || 'Este campo é obrigatório'],
      settings: []
    }
  },
  methods: {
    reset() {
      this.settings = {}
    },
    loadPrices() {
      this.$api('configuracoes')
        .then(res => {
          this.settings = res.data
          this.loadingSettings = false
        })
        .catch(err => {
          this.$store.commit('snackbar/showMessage', {
            text: err.response.data,
            color: 'error'
          })
        })
    },
    save() {
      this.$api
        .post('configuracoes', {
          ...this.settings,
          operador: this.getUser.username
        })
        .then(() => {
          this.$store.commit('snackbar/showMessage', {
            text: 'Configurações atualizadas',
            color: 'primary'
          })
          this.loadPrices()
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
    this.loadPrices()
  }
}
</script>

<style>
</style>
