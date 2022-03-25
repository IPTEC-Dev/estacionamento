<template>
  <v-menu v-model="menu" :close-on-content-click="false" :nudge-width="200" offset-x offset-y>
    <v-btn icon slot="activator">
      <v-icon>person</v-icon>
    </v-btn>
    <v-card>
      <v-list three-line>
        <v-list-tile avatar>
          <v-badge overlap left bottom color="primary">
            <template v-slot:badge>
              <v-icon small color="white">adjust</v-icon>
            </template>
            <v-list-tile-avatar>
              <v-avatar color="black" size="40">
                <span class="white--text headline">{{ getUser.name[0] }}</span>
              </v-avatar>
            </v-list-tile-avatar>
          </v-badge>
          <v-list-tile-content>
            <v-list-tile-title>{{ getUser.name }}</v-list-tile-title>
            <v-list-tile-sub-title>
              <strong>Categoria de {{ getUser.role === 'gestao' ? 'gestão' : getUser.role }}</strong>
            </v-list-tile-sub-title>
            <v-list-tile-sub-title>
              <small>Trabalhando em {{ getUser.local }}</small>
            </v-list-tile-sub-title>
            <v-list-tile-sub-title>
              <small>Em um dispositivo {{ getUser.ambiente }}</small>
            </v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn flat @click.prevent="logout">
          Sair
          <v-icon right>exit_to_app</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'UserDropdown',
  computed: {
    ...mapGetters('user', ['getUser'])
  },
  data() {
    return {
      menu: false
    }
  },
  methods: {
    logout() {
      this.$store.dispatch('user/setUser', null)
      this.$router.push({ path: '/login' })
    }
  }
}
</script>

<style>
</style>
