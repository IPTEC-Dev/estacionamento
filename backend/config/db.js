const { estacionamentoConfig, omniConfig } = require('../knexfile.js')
const estacionamento = require('knex')(estacionamentoConfig)
const omni = require('knex')(omniConfig)

module.exports = { estacionamento, omni }