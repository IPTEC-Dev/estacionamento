<template>
  <v-container>
    <!-- <v-layout row wrap>
      <v-flex justify-center>
        <span class="body-2">Desenvolvido por</span>
      </v-flex>
    </v-layout> -->
    <v-layout row wrap justify-center>
      <v-flex sm8>
        <v-img :src="iptecLogo"></v-img>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      iptecLogo: require('@/assets/iptec-dark.png')
    }
  }
}
</script>

<style>
</style>
