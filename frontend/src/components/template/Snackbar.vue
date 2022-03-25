<template>
  <v-snackbar
    v-model="snackbar.snackbar"
    :color="snackbar.color"
    :timeout="snackbar.timeout"
    left
  >{{ snackbar.text }}</v-snackbar>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Snackbar',
  computed: mapState('snackbar', ['snackbar'])
}
</script>

<style>
</style>
