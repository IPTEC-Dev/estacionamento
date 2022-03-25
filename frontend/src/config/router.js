import Vue from 'vue'
import Router from 'vue-router'
import store from './store/modules/user'

const Login = () =>
  import(/* webpackChunkName: "publico" */ '@/views/inicio/Login')

const Inicio = () =>
  import(/* webpackChunkName: "inicio" */ '@/views/inicio/Inicio')

const MovimentacaoManual = () =>
  import(
    /* webpackChunkName: "operacional" */ '@/views/operacional/MovimentacaoManual'
  )
const NoClube = () =>
  import(/* webpackChunkName: "operacional" */ '@/views/operacional/NoClube')
const Caixa = () =>
  import(/* webpackChunkName: "operacional" */ '@/views/operacional/Caixa')
const Entrada = () =>
  import(/* webpackChunkName: "operacional" */ '@/views/operacional/Entrada')
const Saida = () =>
  import(/* webpackChunkName: "operacional" */ '@/views/operacional/Saida')

const SaidaRetroativa = () =>
  import(
    /* webpackChunkName: "seguranca" */ '@/views/seguranca/SaidaRetroativa'
  )

const Admin = () =>
  import(/* webpackChunkName: "gestao" */ '@/views/gestao/Admin')
const Veiculos = () =>
  import(/* webpackChunkName: "gestao" */ '@/views/gestao/Veiculos')
const Configuracoes = () =>
  import(/* webpackChunkName: "gestao" */ '@/views/gestao/Configuracoes')
const Bloqueios = () =>
  import(/* webpackChunkName: "gestao" */ '@/views/gestao/Bloqueios')
const Relatorios = () =>
  import(/* webpackChunkName: "gestao" */ '@/views/gestao/Relatorios')
const Ocorrencias = () =>
  import(/* webpackChunkName: "gestao" */ '@/views/gestao/Ocorrencias')
const Pessoas = () =>
  import(/* webpackChunkName: "gestao" */ '@/views/gestao/Pessoas')

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: Inicio,
      meta: {
        title: 'Início - Estacionamento'
      }
    },
    {
      path: '/movimentacao-manual',
      component: MovimentacaoManual,
      meta: {
        title: 'Movimentação manual - Estacionamento',
        requiresRoleOperacional: true
      }
    },
    {
      path: '/entrada',
      component: Entrada,
      meta: {
        title: 'Entrada - Estacionamento',
        requiresRoleOperacional: true
      }
    },
    {
      path: '/saida',
      component: Saida,
      meta: {
        title: 'Saída - Estacionamento',
        requiresRoleOperacional: true
      }
    },
    {
      path: '/saida-retroativa',
      component: SaidaRetroativa,
      meta: {
        title: 'Saída retroativa - Estacionamento',
        requiresRoleSeguranca: true
      }
    },
    {
      path: '/caixa',
      component: Caixa,
      meta: {
        title: 'Caixa - Estacionamento',
        requiresRoleOperacional: true
      }
    },
    {
      path: '/login',
      component: Login,
      meta: {
        title: 'Iniciar sessão - Estacionamento'
      }
    },
    {
      path: '/no-clube',
      component: NoClube,
      meta: {
        title: 'Veículos no clube - Estacionamento',
        requiresRoleOperacional: true
      }
    },
    {
      path: '/admin',
      component: Admin,
      meta: {
        requiresRoleGestao: true
      },
      children: [
        {
          path: 'ocorrencias',
          component: Ocorrencias,
          meta: {
            title: 'Ocorrências - Estacionamento',
            requiresRoleGestao: true
          }
        },
        {
          path: 'veiculos',
          component: Veiculos,
          meta: {
            title: 'Veículos cadastrados - Estacionamento',
            requiresRoleGestao: true
          }
        },
        {
          path: 'pessoas',
          component: Pessoas,
          meta: {
            title: 'Pessoas cadastradas - Estacionamento',
            requiresRoleGestao: true
          }
        },
        {
          path: 'configuracoes',
          component: Configuracoes,
          meta: {
            title: 'Configurações do sistema - Estacionamento',
            requiresRoleGestao: true
          }
        },
        {
          path: 'bloqueios',
          component: Bloqueios,
          meta: {
            title: 'Bloquear acessos - Estacionamento',
            requiresRoleGestao: true
          }
        },
        {
          path: 'relatorios',
          component: Relatorios,
          meta: {
            title: 'Relatórios - Estacionamento',
            requiresRoleGestao: true
          }
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title

  if (to.matched.some(record => record.meta.requiresRoleGestao)) {
    if (store.state.user.role === 'gestao') {
      next()
    } else {
      next({ path: '/' })
    }
  } else if (to.matched.some(record => record.meta.requiresRoleOperacional)) {
    if (
      store.state.user.role === 'operacional' ||
      store.state.user.role === 'gestao'
    ) {
      next()
    } else {
      next({ path: '/' })
    }
  } else if (to.matched.some(record => record.meta.requiresRoleSeguranca)) {
    if (
      store.state.user.role === 'seguranca' ||
      store.state.user.role === 'gestao'
    ) {
      next()
    } else {
      next({ path: '/' })
    }
  } else {
    next()
  }
})

export default router
