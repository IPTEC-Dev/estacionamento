const knex = require("knex")

// Configurações dos bancos de dados
const { development, staging, production } = require("./knexfile")

// Função que executa o script
async function runApp() {
  /**
 * developmentDatabase é o banco de dados local
 * stagingDatabase é o banco de dados com a nova estrutura
 * productionDatabase é o banco de dados em produção
 */
  const developmentDatabase = knex(development)
  const stagingDatabase = knex(staging)
  const productionDatabase = knex(production)

  /**
   * Altere esta constante para ativar ou desativar o modo de debug
   * (realiza console.logs a cada ação no banco de dados)
   */
  const debugMode = false

  // Constantes que contêm dados do banco de dados em produção
  const veiculos = await productionDatabase("veiculos")
  const caixas = await productionDatabase("caixas")
  const ocorrencias = await productionDatabase("ocorrencias")
  const fluxos = await productionDatabase("fluxos")

  // Constante para calcular o tempo de execução
  const startTime = new Date()

  /**
   * Inicia a migração dos dados do banco de dados
   * em produção para o banco de dados em teste
   * com a nova estrutura
   */
  async function startMigration() {
    console.log("$> Iniciando a fila de migrações...")

    await migratePeople()
    await migrateVehicles()
    await migrateCashboxes()
    await migrateOcurrences()
    await migrateFlows()

    console.log("$> Todas as migrações fora realizadas!")

    let stopTime = new Date()
    let timeDiff = stopTime - startTime

    let timeDiffInMinutes = timeDiff / 1000 / 60;

    console.log("$> ============================================================")
    console.log(`$> Horario de início da execução: ${startTime}`)
    console.log(`$> Horario de finalização da execução: ${stopTime}`)
    console.log("$>")
    console.log(`$> Tempo de execução: ${timeDiffInMinutes.toFixed(2)} minutos`)
    console.log("$> ============================================================")
  }

  /**
   * Migra as pessoas
   */
  async function migratePeople() {
    console.log("$> Iniciando migrações de pessoas...")

    let pessoas = []

    for (let index = 0; index < veiculos.length; index++) {
      if (pessoas.find(pessoa => pessoa.nome === veiculos.nome)) {
        // ...
      } else {
        pessoas.push({
          nome: veiculos[index].nome,
          matricula: veiculos[index].matricula || null,
          tipo: veiculos[index].tipo,
          autorizante: veiculos[index].tipo === "Credenciado" ? veiculos[index].autorizante : null,
          operador: veiculos[index].operador,
          updated_at: veiculos[index].updated_at
        })
      }
    }

    for (let index = 0; index < pessoas.length; index++) {
      const personFromDb = await stagingDatabase("pessoas").where({ nome: pessoas[index].nome }).first()

      if (!personFromDb) {
        await stagingDatabase("pessoas")
          .insert(pessoas[index])
          .then((data) => {
            if (debugMode) console.log(`Pessoa ${data}`, pessoas[index])
          })
          .catch(error => {
            return console.log(pessoas[index], error)
          })
      }
    }

    const qtdInserts = await stagingDatabase.raw('SELECT count(id) FROM pessoas')

    console.log(`$> Migração de pessoas finalizada! (${qtdInserts[0][0]['count(id)']} itens inseridos)`)
    console.log("$>")
  }

  /**
   * Migra os veículos
   */
  async function migrateVehicles() {
    console.log(`$> Iniciando migrações de veículos... (${veiculos.length} itens)`)

    const peopleFromDb = await stagingDatabase("pessoas")

    for (let index = 0; index < veiculos.length; index++) {
      vehicleFromDb = await stagingDatabase("veiculos").where({ placa: veiculos[index].placa }).first()

      if (!vehicleFromDb) {
        const pessoaId = peopleFromDb.findIndex(pessoa => {
          if (pessoa.nome === veiculos[index].nome) {
            return pessoa.id
          }
        })

        let veiculo = {
          id: veiculos[index].id,
          placa: veiculos[index].placa,
          pessoa: pessoaId + 1,
          modelo: veiculos[index].modelo,
          cor: veiculos[index].cor,
          operador: veiculos[index].operador,
          updated_at: veiculos[index].updated_at
        }

        await stagingDatabase("veiculos")
          .insert(veiculo)
          .then(data => {
            if (debugMode) console.log(`Veículo ${data}`, veiculo)
          })
          .catch(error => {
            return console.log(veiculo, error)
          })
      }
    }

    const qtdInserts = await stagingDatabase.raw('SELECT count(id) FROM veiculos')

    console.log(`$> Migração de veículos finalizada! (${qtdInserts[0][0]['count(id)']} itens inseridos)`)
    console.log("$>")
  }

  /**
   * Migra os caixas
   */
  async function migrateCashboxes() {
    console.log(`$> Iniciando migrações de caixas... (${caixas.length} itens)`)

    for (let index = 0; index < caixas.length; index++) {
      cashboxFromDb = await stagingDatabase("caixas").where({ id: caixas[index].id }).first()

      if (!cashboxFromDb) {
        await stagingDatabase("caixas")
          .insert(caixas[index])
          .then(data => {
            if (debugMode) console.log(`Caixa ${data}`, caixas[index])
          })
          .catch(error => {
            return console.log(caixas[index], error)
          })
      }
    }

    const qtdInserts = await stagingDatabase.raw('SELECT count(id) FROM caixas')

    console.log(`$> Migração de caixas finalizada! (${qtdInserts[0][0]['count(id)']} itens inseridos)`)
    console.log("$>")
  }

  /**
   * Migra as ocorrências
   */
  async function migrateOcurrences() {
    console.log(`$> Iniciando migrações de ocorrências... (${ocorrencias.length} itens)`)

    for (let index = 0; index < ocorrencias.length; index++) {
      const ocorrencia = ocorrencias[index]

      await stagingDatabase("ocorrencias")
        .insert(ocorrencia)
        .then(data => {
          if (debugMode) console.log(`Ocorrência ${data}`, ocorrencia)
        })
        .catch(error => {
          return console.log(ocorrencia, error)
        })
    }

    const qtdInserts = await stagingDatabase.raw('SELECT count(id) FROM ocorrencias')

    console.log(`$> Migração de ocorrências finalizada! (${qtdInserts[0][0]['count(id)']} itens inseridos)`)
    console.log("$>")
  }

  /**
   * Migra os fluxos
   */
  async function migrateFlows() {
    console.log(`$> Iniciando migrações de fluxos... (${fluxos.length} itens)`)

    for (let index = 0; index < fluxos.length; index++) {
      await stagingDatabase("fluxos")
        .insert(fluxos[index])
        .then(data => {
          if (debugMode) console.log(`Fluxo ${data}`, fluxos[index])
        })
        .catch(error => {
          return console.log(fluxos[index], error)
        })
    }

    const qtdInserts = await stagingDatabase.raw('SELECT count(id) FROM fluxos')

    console.log(`$> Migração de fluxos finalizada! (${qtdInserts[0][0]['count(id)']} itens inseridos)`)
    console.log("$>")
  }

  // Inicia o script
  await startMigration()
}

runApp()