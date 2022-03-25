<template>
  <div>
    <v-layout row wrap justify-center class="mb-4">
      <v-flex sm2>
        <v-img :src="image"></v-img>
      </v-flex>
    </v-layout>
    <v-layout row wrap justify-center>
      <v-flex xs12 text-xs-center>
        <h1 class="display-1">Olá, {{ getUser.name }}</h1>
        <p class="subheading">Seja bem-vindo(a) ao sistema de estacionamento</p>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Inicio',
  computed: mapGetters('user', ['getUser']),
  data() {
    return {
      image: require('@/assets/estacionamento-logo.png')
    }
  }
}
</script>