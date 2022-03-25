<template>
  <div>
    <PageTitle title="Saída" description="Reconhecimento automático de carteirinhas"/>
    <v-layout v-if="!saida.matricula" row wrap justify-center>
      <v-flex class="hidden-sm-and-down" xs12 sm5>
        <v-img :src="imageSrc"></v-img>
      </v-flex>
      <v-flex text-xs-center xs12 sm7>
        <v-layout row wrap justify-center>
          <v-flex xs12>
            <h1 class="display-1">Aguardando a leitura da carteirinha...</h1>
            <p>Quando identificar a leitura da carteirinha, será solicitada a placa do veículo</p>
          </v-flex>
          <v-flex xs12 sm9 class="mt-3">
            <v-text-field
              return-masked-value
              mask="nnnnnn-nn"
              id="matricula"
              v-model="saida.matricula"
              box
              prepend-inner-icon="credit_card"
              hide-details
              disabled
              label="Matrícula"
            ></v-text-field>
          </v-flex>
        </v-layout>
      </v-flex>
    </v-layout>
    <SegundaVia/>
  </div>
</template>

<script>
import PageTitle from '@/components/template/PageTitle'
import SegundaVia from '@/components/inicio/SegundaVia'

export default {
  name: 'Entrada',
  components: { SegundaVia, PageTitle },
  data() {
    return {
      imageSrc: require('@/assets/aguardando-carteirinha.svg'),
      saida: {}
    }
  },
  methods: {
    reset() {
      this.saida = {}
    }
  },
  mounted() {
    document.getElementById('matricula').focus()
  }
}
</script>

<style scoped>
</style>