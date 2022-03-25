<template>
  <v-layout row wrap class="mb-3">
    <v-flex xs12>
      <h1 class="display-1">{{ title }}</h1>
      <p>{{ description }}</p>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  name: 'PageTitle',
  props: ['title', 'description']
}
</script>

<style lang="scss" scoped>
</style>