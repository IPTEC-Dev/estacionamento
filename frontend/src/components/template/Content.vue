<template>
  <v-content>
    <v-container fluid grid-list-md>
      <transition
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
        mode="out-in"
      >
        <router-view></router-view>
      </transition>
    </v-container>
  </v-content>
</template>

<script>
export default {
  name: 'Content'
}
</script>

<style>
.fadeIn,
.fadeOut {
  animation-duration: 0.1s;
}
</style>
