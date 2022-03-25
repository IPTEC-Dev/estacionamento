module.exports = {
  development: {
    client: 'mysql',
    connection: {
      connection: {
        host: 'localhost',
        database: 'defaut',
        user: 'default',
        password: 'secret'
      },
    }
  },

  staging: {
    client: 'mysql',
    connection: {
      host: 'sccp58.sccorinthians.com.br',
      database: 'novo_estacionamento',
      user: 'novo_estacionamento',
      password: '3st4ci0n4m3nt04dmm1N!'
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'mysql',
    connection: {
      host: 'sccp58.sccorinthians.com.br',
      database: 'estacionamento',
      user: 'novo_estacionamento',
      password: '3st4ci0n4m3nt04dmm1N!'
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
};
