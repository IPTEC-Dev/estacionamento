<template>
  <div>
    <v-navigation-drawer app fixed clipped v-model="drawer" v-if="getUser">
      <v-list dense>
        <template v-for="item in items">
          <template
            v-if="(item.role ? ((item.role === getUser.role || getUser.role === 'gestao') ? true : false) : true)"
          >
            <v-layout row v-if="item.heading" align-center :key="item.heading">
              <v-flex xs12>
                <v-subheader v-if="item.heading">{{ item.heading }}</v-subheader>
              </v-flex>
            </v-layout>
            <v-list-group
              v-else-if="item.children"
              v-model="item.model"
              :key="item.text"
              :prepend-icon="item.model ? item.icon : item['icon-alt']"
              append-icon
            >
              <v-list-tile slot="activator">
                <v-list-tile-content>
                  <v-list-tile-title>{{ item.text }}</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
              <v-list-tile v-for="(child, i) in item.children" :key="i" :to="child.route">
                <v-list-tile-action v-if="child.icon">
                  <v-icon>{{ child.icon }}</v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                  <v-list-tile-title>{{ child.text }}</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-list-group>
            <v-list-tile v-else :key="item.text" :to="item.route">
              <v-list-tile-action>
                <v-icon>{{ item.icon }}</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>{{ item.text }}</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </template>
        </template>
      </v-list>
      <v-divider class="mt-4"></v-divider>
      <IptecCopy/>
    </v-navigation-drawer>
    <v-toolbar app fixed clipped-left dark>
      <v-toolbar-side-icon @click="drawer = !drawer" v-if="getUser" />
      <v-toolbar-title class="text-uppercase">Estacionamento</v-toolbar-title>
      <v-spacer></v-spacer>
      <template v-if="getUser">
        <Ocorrencias />
        <UserDropdown />
      </template>
    </v-toolbar>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import UserDropdown from '@/components/template/UserDropdown'
import Ocorrencias from '@/components/ocorrencias/Ocorrencias'
import IptecCopy from '@/components/template/IptecCopy'

export default {
  name: 'Header',
  components: { UserDropdown, Ocorrencias, IptecCopy },
  computed: { ...mapGetters('user', ['getUser']) },
  data() {
    return {
      drawer: false,
      items: [
        { heading: 'INÍCIO' },
        {
          icon: 'home',
          text: 'Início',
          route: '/'
        },
        { heading: 'OPERACIONAL', role: 'operacional' },
        {
          icon: 'supervisor_account',
          text: 'Movimentação manual',
          route: '/movimentacao-manual',
          role: 'operacional'
        },
        // {
        //   icon: 'arrow_forward',
        //   text: 'Entrada',
        //   route: '/entrada',
        //   role: 'operacional'
        // },
        // {
        //   icon: 'arrow_back',
        //   text: 'Saída',
        //   route: '/saida',
        //   role: 'operacional'
        // },
        {
          icon: 'account_balance',
          text: 'Caixa',
          route: '/caixa',
          role: 'operacional'
        },
        {
          icon: 'location_on',
          text: 'No clube',
          route: '/no-clube',
          role: 'operacional'
        },
        { heading: 'SEGURANÇA', role: 'seguranca' },
        {
          icon: 'exit_to_app',
          text: 'Saída retroativa',
          route: '/saida-retroativa',
          role: 'seguranca'
        },
        { heading: 'GESTÃO', role: 'gestao' },
        {
          icon: 'people',
          text: 'Pessoas',
          route: '/admin/pessoas',
          role: 'gestao'
        },
        {
          icon: 'directions_car',
          text: 'Veículos',
          route: '/admin/veiculos',
          role: 'gestao'
        },
        {
          icon: 'lock',
          text: 'Bloqueios',
          route: '/admin/bloqueios',
          role: 'gestao'
        },
        {
          icon: 'assignment',
          text: 'Relatórios',
          route: '/admin/relatorios',
          role: 'gestao'
        },
        {
          icon: 'report_problem',
          text: 'Ocorrências',
          route: '/admin/ocorrencias',
          role: 'gestao'
        },
        {
          icon: 'settings',
          text: 'Configurações',
          route: '/admin/configuracoes',
          role: 'gestao'
        }
      ]
    }
  }
}
</script>

<style>
</style>
