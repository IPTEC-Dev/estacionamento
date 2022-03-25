module.exports = app => {
  const { existsOrError } = app.api.validation;

  const get = async (req, res) => {
    const date1 = req.params.date1;
    const date2 = req.params.date2;
    try {
      existsOrError(date1, "Informe a data inicial para realizar o relatório");
      existsOrError(date2, "Informe a data final para realizar o relatório");

      // Movimentação de pessoas
      const movimentacaoPessoasSociosTotal = await app
        .estacionamento("fluxos")
        .where("created_at", ">=", date1 + " 00:00:00")
        .where("created_at", "<=", date2 + " 23:59:59")
        .where({
          "fluxos.evento": "entrada",
          "fluxos.tipo": "Sócio",
          "fluxos.cancelado": false
        })
        .whereNull("veiculo");

      const movimentacaoPessoasSociosP1 = await app
        .estacionamento("fluxos")
        .where("created_at", ">=", date1 + " 00:00:00")
        .where("created_at", "<=", date2 + " 23:59:59")
        .where({
          "fluxos.evento": "entrada",
          "fluxos.tipo": "Sócio",
          "fluxos.cancelado": false,
          "local": "P1"
        })
        .whereNull("veiculo");

      const movimentacaoPessoasSociosP3 = await app
        .estacionamento("fluxos")
        .where("created_at", ">=", date1 + " 00:00:00")
        .where("created_at", "<=", date2 + " 23:59:59")
        .where({
          "fluxos.evento": "entrada",
          "fluxos.tipo": "Sócio",
          "fluxos.cancelado": false,
          "local": "P3"
        })
        .whereNull("veiculo");

      const movimentacaoPessoasSociosTamboreu = await app
        .estacionamento("fluxos")
        .where("created_at", ">=", date1 + " 00:00:00")
        .where("created_at", "<=", date2 + " 23:59:59")
        .where({
          "fluxos.evento": "entrada",
          "fluxos.tipo": "Sócio",
          "fluxos.cancelado": false,
          "local": "Tamboréu"
        })
        .whereNull("veiculo");

      const movimentacaoPessoasFuncionariosTotal = await app
        .estacionamento("fluxos")
        .where({
          "fluxos.tipo": "Funcionário",
          "fluxos.evento": "entrada",
          "fluxos.cancelado": false
        })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const movimentacaoPessoasFuncionariosP1 = await app
        .estacionamento("fluxos")
        .where({
          "fluxos.tipo": "Funcionário",
          "fluxos.evento": "entrada",
          "fluxos.cancelado": false,
          "local": "P1"
        })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const movimentacaoPessoasFuncionariosP3 = await app
        .estacionamento("fluxos")
        .where({
          "fluxos.tipo": "Funcionário",
          "fluxos.evento": "entrada",
          "fluxos.cancelado": false,
          "local": "P3"
        })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const movimentacaoPessoasFuncionariosTamboreu = await app
        .estacionamento("fluxos")
        .where({
          "fluxos.tipo": "Funcionário",
          "fluxos.evento": "entrada",
          "fluxos.cancelado": false,
          "local": "Tamboréu"
        })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const movimentacaoPessoasCredenciadosTotal = await app
        .estacionamento("fluxos")
        .where({
          "fluxos.evento": "entrada",
          "fluxos.tipo": "Credenciado",
          "fluxos.cancelado": false
        })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const movimentacaoPessoasCredenciadosP1 = await app
        .estacionamento("fluxos")
        .where({
          "fluxos.evento": "entrada",
          "fluxos.tipo": "Credenciado",
          "fluxos.cancelado": false,
          "local": "P1"
        })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const movimentacaoPessoasCredenciadosP3 = await app
        .estacionamento("fluxos")
        .where({
          "fluxos.evento": "entrada",
          "fluxos.tipo": "Credenciado",
          "fluxos.cancelado": false,
          "local": "P3"
        })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const movimentacaoPessoasCredenciadosTamboreu = await app
        .estacionamento("fluxos")
        .where({
          "fluxos.evento": "entrada",
          "fluxos.tipo": "Credenciado",
          "fluxos.cancelado": false,
          "local": "Tamboréu"
        })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const movimentacaoPessoasConselheirosTotal = await app
        .estacionamento("fluxos")
        .where({
          "fluxos.evento": "entrada",
          "fluxos.tipo": "Conselheiro",
          "fluxos.cancelado": false
        })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const movimentacaoPessoasConselheirosP1 = await app
        .estacionamento("fluxos")
        .where({
          "fluxos.evento": "entrada",
          "fluxos.tipo": "Conselheiro",
          "fluxos.cancelado": false,
          "local": "P1"
        })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const movimentacaoPessoasConselheirosP3 = await app
        .estacionamento("fluxos")
        .where({
          "fluxos.evento": "entrada",
          "fluxos.tipo": "Conselheiro",
          "fluxos.cancelado": false,
          "local": "P3"
        })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const movimentacaoPessoasConselheirosTamboreu = await app
        .estacionamento("fluxos")
        .where({
          "fluxos.evento": "entrada",
          "fluxos.tipo": "Conselheiro",
          "fluxos.cancelado": false,
          "local": "Tamboréu"
        })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const movimentacaoPessoasAtletasTotal = await app
        .estacionamento("fluxos")
        .where({
          "fluxos.evento": "entrada",
          "fluxos.tipo": "Atletas",
          "fluxos.cancelado": false
        })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const movimentacaoPessoasAtletasP1 = await app
        .estacionamento("fluxos")
        .where({
          "fluxos.evento": "entrada",
          "fluxos.tipo": "Atletas",
          "fluxos.cancelado": false,
          "local": "P1"
        })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const movimentacaoPessoasAtletasP3 = await app
        .estacionamento("fluxos")
        .where({
          "fluxos.evento": "entrada",
          "fluxos.tipo": "Atletas",
          "fluxos.cancelado": false,
          "local": "P3"
        })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const movimentacaoPessoasAtletasTamboreu = await app
        .estacionamento("fluxos")
        .where({
          "fluxos.evento": "entrada",
          "fluxos.tipo": "Atletas",
          "fluxos.cancelado": false,
          "local": "Tamboréu"
        })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const movimentacaoPessoas = {
        socios: {
          total: movimentacaoPessoasSociosTotal.length || 0,
          p1: movimentacaoPessoasSociosP1.length || 0,
          p3: movimentacaoPessoasSociosP3.length || 0,
          tamboreu: movimentacaoPessoasSociosTamboreu.length || 0
        },
        credenciados: {
          total: movimentacaoPessoasCredenciadosTotal.length || 0,
          p1: movimentacaoPessoasCredenciadosP1.length || 0,
          p3: movimentacaoPessoasCredenciadosP3.length || 0,
          tamboreu: movimentacaoPessoasCredenciadosTamboreu.length || 0
        },
        funcionarios: {
          total: movimentacaoPessoasFuncionariosTotal.length || 0,
          p1: movimentacaoPessoasFuncionariosP1.length || 0,
          p3: movimentacaoPessoasFuncionariosP3.length || 0,
          tamboreu: movimentacaoPessoasFuncionariosTamboreu.length || 0
        },
        conselheiros: {
          total: movimentacaoPessoasConselheirosTotal.length || 0,
          p1: movimentacaoPessoasConselheirosP1.length || 0,
          p3: movimentacaoPessoasConselheirosP3.length || 0,
          tamboreu: movimentacaoPessoasConselheirosTamboreu.length || 0
        },
        atletas: {
          total: movimentacaoPessoasAtletasTotal.length || 0,
          p1: movimentacaoPessoasAtletasP1.length || 0,
          p3: movimentacaoPessoasAtletasP3.length || 0,
          tamboreu: movimentacaoPessoasAtletasTamboreu.length || 0
        }
      };

      // Movimentação de veículos
      const movimentacaoVeiculosCadastradosTotal = await app
        .estacionamento("fluxos")
        .join("veiculos", "fluxos.veiculo", "veiculos.id")
        .where({ "fluxos.evento": "entrada" })
        .where("fluxos.placa", "!=", "BICICLETA")
        .where({ "fluxos.cancelado": false })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const movimentacaoVeiculosCadastradosP1 = await app
        .estacionamento("fluxos")
        .join("veiculos", "fluxos.veiculo", "veiculos.id")
        .where({ "fluxos.evento": "entrada" })
        .where("fluxos.placa", "!=", "BICICLETA")
        .where({ "fluxos.cancelado": false, "fluxos.local": "P1" })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const movimentacaoVeiculosCadastradosP3 = await app
        .estacionamento("fluxos")
        .join("veiculos", "fluxos.veiculo", "veiculos.id")
        .where({ "fluxos.evento": "entrada" })
        .where("fluxos.placa", "!=", "BICICLETA")
        .where({ "fluxos.cancelado": false, "fluxos.local": "P3" })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const movimentacaoVeiculosCadastradosTamboreu = await app
        .estacionamento("fluxos")
        .join("veiculos", "fluxos.veiculo", "veiculos.id")
        .where({ "fluxos.evento": "entrada" })
        .where("fluxos.placa", "!=", "BICICLETA")
        .where({ "fluxos.cancelado": false, "fluxos.local": "Tamboréu" })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const movimentacaoVeiculosAvulsosCarrosTotal = await app
        .estacionamento("fluxos")
        .where({
          "fluxos.porte": "Carro",
          "fluxos.evento": "entrada"
        })
        .where({ "fluxos.cancelado": false })
        .whereNull("fluxos.veiculo")
        .where("fluxos.placa", "!=", "BICICLETA")
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const movimentacaoVeiculosAvulsosCarrosP1 = await app
        .estacionamento("fluxos")
        .where({
          "fluxos.porte": "Carro",
          "fluxos.evento": "entrada",
          "fluxos.local": "P1"
        })
        .where({ "fluxos.cancelado": false })
        .whereNull("fluxos.veiculo")
        .where("fluxos.placa", "!=", "BICICLETA")
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const movimentacaoVeiculosAvulsosCarrosP3 = await app
        .estacionamento("fluxos")
        .where({
          "fluxos.porte": "Carro",
          "fluxos.evento": "entrada",
          "fluxos.local": "P3"
        })
        .where({ "fluxos.cancelado": false })
        .whereNull("fluxos.veiculo")
        .where("fluxos.placa", "!=", "BICICLETA")
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const movimentacaoVeiculosAvulsosCarrosTamboreu = await app
        .estacionamento("fluxos")
        .where({
          "fluxos.porte": "Carro",
          "fluxos.evento": "entrada",
          "fluxos.local": "Tamboréu"
        })
        .where({ "fluxos.cancelado": false })
        .whereNull("fluxos.veiculo")
        .where("fluxos.placa", "!=", "BICICLETA")
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const movimentacaoVeiculosAvulsosMotosTotal = await app
        .estacionamento("fluxos")
        .where({ "fluxos.porte": "Motocicleta", "fluxos.evento": "entrada" })
        .whereNull("fluxos.veiculo")
        .where("fluxos.placa", "!=", "BICICLETA")
        .where({ "fluxos.cancelado": false })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const movimentacaoVeiculosAvulsosMotosP1 = await app
        .estacionamento("fluxos")
        .where({ "fluxos.porte": "Motocicleta", "fluxos.evento": "entrada" })
        .whereNull("fluxos.veiculo")
        .where("fluxos.placa", "!=", "BICICLETA")
        .where({ "fluxos.cancelado": false, "fluxos.local": "P1" })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const movimentacaoVeiculosAvulsosMotosP3 = await app
        .estacionamento("fluxos")
        .where({ "fluxos.porte": "Motocicleta", "fluxos.evento": "entrada" })
        .whereNull("fluxos.veiculo")
        .where("fluxos.placa", "!=", "BICICLETA")
        .where({ "fluxos.cancelado": false, "fluxos.local": "P2" })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const movimentacaoVeiculosAvulsosMotosTamboreu = await app
        .estacionamento("fluxos")
        .where({ "fluxos.porte": "Motocicleta", "fluxos.evento": "entrada" })
        .whereNull("fluxos.veiculo")
        .where("fluxos.placa", "!=", "BICICLETA")
        .where({ "fluxos.cancelado": false, "fluxos.local": "Tamboréu" })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const movimentacaoVeiculosAvulsosBicicletasTotal = await app
        .estacionamento("fluxos")
        .where({ placa: "BICICLETA" })
        .where({ "fluxos.cancelado": false })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const movimentacaoVeiculosAvulsosBicicletasP1 = await app
        .estacionamento("fluxos")
        .where({ placa: "BICICLETA" })
        .where({ "fluxos.cancelado": false, "fluxos.local": "P1" })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const movimentacaoVeiculosAvulsosBicicletasP3 = await app
        .estacionamento("fluxos")
        .where({ placa: "BICICLETA" })
        .where({ "fluxos.cancelado": false, "fluxos.local": "P2" })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const movimentacaoVeiculosAvulsosBicicletasTamboreu = await app
        .estacionamento("fluxos")
        .where({ placa: "BICICLETA" })
        .where({ "fluxos.cancelado": false, "fluxos.local": "Tamboréu" })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const movimentacaoVeiculos = {
        cadastrados: {
          total: movimentacaoVeiculosCadastradosTotal.length || 0,
          p1: movimentacaoVeiculosCadastradosP1.length || 0,
          p3: movimentacaoVeiculosCadastradosP3.length || 0,
          tamboreu: movimentacaoVeiculosCadastradosTamboreu.length || 0
        },
        avulsosCarros: {
          total: movimentacaoVeiculosAvulsosCarrosTotal.length || 0,
          p1: movimentacaoVeiculosAvulsosCarrosP1.length || 0,
          p3: movimentacaoVeiculosAvulsosCarrosP3.length || 0,
          tamboreu: movimentacaoVeiculosAvulsosCarrosTamboreu.length || 0
        },
        avulsosMotos: {
          total: movimentacaoVeiculosAvulsosMotosTotal.length || 0,
          p1: movimentacaoVeiculosAvulsosMotosP1.length || 0,
          p3: movimentacaoVeiculosAvulsosMotosP3.length || 0,
          tamboreu: movimentacaoVeiculosAvulsosMotosTamboreu.length || 0
        },
        avulsosBicicletas: {
          total: movimentacaoVeiculosAvulsosBicicletasTotal.length || 0,
          p1: movimentacaoVeiculosAvulsosBicicletasP1.length || 0,
          p3: movimentacaoVeiculosAvulsosBicicletasP3.length || 0,
          tamboreu: movimentacaoVeiculosAvulsosBicicletasTamboreu.length || 0
        }
      };

      // Arrecadação
      const avulsosSaidaDinheiroTotal = await app
        .estacionamento("fluxos")
        .sum("fluxos.valor")
        .where({ "fluxos.evento": "saída", "fluxos.pagamento": "Dinheiro" })
        .where({ "fluxos.cancelado": false })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const avulsosSaidaDinheiroP1 = await app
        .estacionamento("fluxos")
        .sum("fluxos.valor")
        .where({ "fluxos.evento": "saída", "fluxos.pagamento": "Dinheiro", "fluxos.local": "P1" })
        .where({ "fluxos.cancelado": false })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const avulsosSaidaDinheiroP3 = await app
        .estacionamento("fluxos")
        .sum("fluxos.valor")
        .where({ "fluxos.evento": "saída", "fluxos.pagamento": "Dinheiro", "fluxos.local": "P3" })
        .where({ "fluxos.cancelado": false })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const avulsosSaidaDinheiroTamboreu = await app
        .estacionamento("fluxos")
        .sum("fluxos.valor")
        .where({ "fluxos.evento": "saída", "fluxos.pagamento": "Dinheiro", "fluxos.local": "Tamboréu" })
        .where({ "fluxos.cancelado": false })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const avulsosSaidaCartaoCreditoTotal = await app
        .estacionamento("fluxos")
        .sum("fluxos.valor")
        .where({
          "fluxos.evento": "saída",
          "fluxos.pagamento": "Cartão de crédito"
        })
        .where({ "fluxos.cancelado": false })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const avulsosSaidaCartaoCreditoP1 = await app
        .estacionamento("fluxos")
        .sum("fluxos.valor")
        .where({
          "fluxos.evento": "saída",
          "fluxos.pagamento": "Cartão de crédito",
          "fluxos.local": "P1"
        })
        .where({ "fluxos.cancelado": false })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const avulsosSaidaCartaoCreditoP3 = await app
        .estacionamento("fluxos")
        .sum("fluxos.valor")
        .where({
          "fluxos.evento": "saída",
          "fluxos.pagamento": "Cartão de crédito",
          "fluxos.local": "P3"
        })
        .where({ "fluxos.cancelado": false })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const avulsosSaidaCartaoCreditoTamboreu = await app
        .estacionamento("fluxos")
        .sum("fluxos.valor")
        .where({
          "fluxos.evento": "saída",
          "fluxos.pagamento": "Cartão de crédito",
          "fluxos.local": "Tamboréu"
        })
        .where({ "fluxos.cancelado": false })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const avulsosSaidaCartaoDebitoTotal = await app
        .estacionamento("fluxos")
        .sum("fluxos.valor")
        .where({
          "fluxos.evento": "saída",
          "fluxos.pagamento": "Cartão de débito"
        })
        .where({ "fluxos.cancelado": false })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const avulsosSaidaCartaoDebitoP1 = await app
        .estacionamento("fluxos")
        .sum("fluxos.valor")
        .where({
          "fluxos.evento": "saída",
          "fluxos.pagamento": "Cartão de débito",
          "fluxos.local": "P1"
        })
        .where({ "fluxos.cancelado": false })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const avulsosSaidaCartaoDebitoP3 = await app
        .estacionamento("fluxos")
        .sum("fluxos.valor")
        .where({
          "fluxos.evento": "saída",
          "fluxos.pagamento": "Cartão de débito",
          "fluxos.local": "P3"
        })
        .where({ "fluxos.cancelado": false })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const avulsosSaidaCartaoDebitoTamboreu = await app
        .estacionamento("fluxos")
        .sum("fluxos.valor")
        .where({
          "fluxos.evento": "saída",
          "fluxos.pagamento": "Cartão de débito",
          "fluxos.local": "Tamboréu"
        })
        .where({ "fluxos.cancelado": false })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const avulsosEntradaDinheiroTotal = await app
        .estacionamento("fluxos")
        .sum("fluxos.valor")
        .where({ "fluxos.evento": "entrada", "fluxos.pagamento": "Dinheiro" })
        .where({ "fluxos.cancelado": false })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const avulsosEntradaDinheiroP1 = await app
        .estacionamento("fluxos")
        .sum("fluxos.valor")
        .where({ "fluxos.evento": "entrada", "fluxos.pagamento": "Dinheiro", "fluxos.local": "P1" })
        .where({ "fluxos.cancelado": false })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const avulsosEntradaDinheiroP3 = await app
        .estacionamento("fluxos")
        .sum("fluxos.valor")
        .where({ "fluxos.evento": "entrada", "fluxos.pagamento": "Dinheiro", "fluxos.local": "P3" })
        .where({ "fluxos.cancelado": false })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const avulsosEntradaDinheiroTamboreu = await app
        .estacionamento("fluxos")
        .sum("fluxos.valor")
        .where({ "fluxos.evento": "entrada", "fluxos.pagamento": "Dinheiro", "fluxos.local": "Tamboréu" })
        .where({ "fluxos.cancelado": false })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const avulsosEntradaCartaoCreditoTotal = await app
        .estacionamento("fluxos")
        .sum("fluxos.valor")
        .where({
          "fluxos.evento": "entrada",
          "fluxos.pagamento": "Cartão de crédito"
        })
        .where({ "fluxos.cancelado": false })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const avulsosEntradaCartaoCreditoP1 = await app
        .estacionamento("fluxos")
        .sum("fluxos.valor")
        .where({
          "fluxos.evento": "entrada",
          "fluxos.pagamento": "Cartão de crédito",
          "fluxos.local": "P1"
        })
        .where({ "fluxos.cancelado": false })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const avulsosEntradaCartaoCreditoP3 = await app
        .estacionamento("fluxos")
        .sum("fluxos.valor")
        .where({
          "fluxos.evento": "entrada",
          "fluxos.pagamento": "Cartão de crédito",
          "fluxos.local": "P3"
        })
        .where({ "fluxos.cancelado": false })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const avulsosEntradaCartaoCreditoTamboreu = await app
        .estacionamento("fluxos")
        .sum("fluxos.valor")
        .where({
          "fluxos.evento": "entrada",
          "fluxos.pagamento": "Cartão de crédito",
          "fluxos.local": "Tamboréu"
        })
        .where({ "fluxos.cancelado": false })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const avulsosEntradaCartaoDebitoTotal = await app
        .estacionamento("fluxos")
        .sum("fluxos.valor")
        .where({
          "fluxos.evento": "entrada",
          "fluxos.pagamento": "Cartão de débito"
        })
        .where({ "fluxos.cancelado": false })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

        const avulsosEntradaCartaoDebitoP1 = await app
        .estacionamento("fluxos")
        .sum("fluxos.valor")
        .where({
          "fluxos.evento": "entrada",
          "fluxos.pagamento": "Cartão de débito",
          "fluxos.local": "P1"
        })
        .where({ "fluxos.cancelado": false })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

        const avulsosEntradaCartaoDebitoP3 = await app
        .estacionamento("fluxos")
        .sum("fluxos.valor")
        .where({
          "fluxos.evento": "entrada",
          "fluxos.pagamento": "Cartão de débito",
          "fluxos.local": "P3"
        })
        .where({ "fluxos.cancelado": false })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

        const avulsosEntradaCartaoDebitoTamboreu = await app
        .estacionamento("fluxos")
        .sum("fluxos.valor")
        .where({
          "fluxos.evento": "entrada",
          "fluxos.pagamento": "Cartão de débito",
          "fluxos.local": "Tamboréu"
        })
        .where({ "fluxos.cancelado": false })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const avulsosCartaoTotal = await app
        .estacionamento("fluxos")
        .sum("fluxos.valor")
        .where({
          pagamento: "Cartão"
        })
        .where({ "fluxos.cancelado": false })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const avulsosCartaoP1 = await app
        .estacionamento("fluxos")
        .sum("fluxos.valor")
        .where({
          pagamento: "Cartão",
          local: "P1"
        })
        .where({ "fluxos.cancelado": false })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const avulsosCartaoP3 = await app
        .estacionamento("fluxos")
        .sum("fluxos.valor")
        .where({
          pagamento: "Cartão",
          local: "P3"
        })
        .where({ "fluxos.cancelado": false })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const avulsosCartaoTamboreu = await app
        .estacionamento("fluxos")
        .sum("fluxos.valor")
        .where({
          pagamento: "Cartão",
          local: "Tamboréu"
        })
        .where({ "fluxos.cancelado": false })
        .where("fluxos.created_at", ">=", date1 + " 00:00:00")
        .where("fluxos.created_at", "<=", date2 + " 23:59:59");

      const selosFisicosTotal = await app
        .estacionamento("fluxos")
        .sum("fluxos.valor")
        .whereIn("pagamento", ["Selo Físico", "Selo"])
        .where({ "fluxos.cancelado": false })
        .where("created_at", ">=", date1 + " 00:00:00")
        .where("created_at", "<=", date2 + " 23:59:59");

        const selosFisicosP1 = await app
        .estacionamento("fluxos")
        .sum("fluxos.valor")
        .whereIn("pagamento", ["Selo Físico", "Selo"])
        .where({ "fluxos.cancelado": false, "fluxos.local": "P1" })
        .where("created_at", ">=", date1 + " 00:00:00")
        .where("created_at", "<=", date2 + " 23:59:59");

        const selosFisicosP3 = await app
        .estacionamento("fluxos")
        .sum("fluxos.valor")
        .whereIn("pagamento", ["Selo Físico", "Selo"])
        .where({ "fluxos.cancelado": false, "fluxos.local": "P3" })
        .where("created_at", ">=", date1 + " 00:00:00")
        .where("created_at", "<=", date2 + " 23:59:59");

        const selosFisicosTamboreu = await app
        .estacionamento("fluxos")
        .sum("fluxos.valor")
        .whereIn("pagamento", ["Selo Físico", "Selo"])
        .where({ "fluxos.cancelado": false, "fluxos.local": "Tamboréu" })
        .where("created_at", ">=", date1 + " 00:00:00")
        .where("created_at", "<=", date2 + " 23:59:59");

      const selosDigitaisTotal = await app
        .estacionamento("fluxos")
        .sum("fluxos.valor")
        .whereIn("pagamento", ["Selo Digital"])
        .where({ "fluxos.cancelado": false })
        .where("created_at", ">=", date1 + " 00:00:00")
        .where("created_at", "<=", date2 + " 23:59:59");

        const selosDigitaisP1 = await app
        .estacionamento("fluxos")
        .sum("fluxos.valor")
        .whereIn("pagamento", ["Selo Digital"])
        .where({ "fluxos.cancelado": false, "fluxos.local": "P1" })
        .where("created_at", ">=", date1 + " 00:00:00")
        .where("created_at", "<=", date2 + " 23:59:59");

        const selosDigitaisP3 = await app
        .estacionamento("fluxos")
        .sum("fluxos.valor")
        .whereIn("pagamento", ["Selo Digital"])
        .where({ "fluxos.cancelado": false, "fluxos.local": "P3" })
        .where("created_at", ">=", date1 + " 00:00:00")
        .where("created_at", "<=", date2 + " 23:59:59");

        const selosDigitaisTamboreu = await app
        .estacionamento("fluxos")
        .sum("fluxos.valor")
        .whereIn("pagamento", ["Selo Digital"])
        .where({ "fluxos.cancelado": false, "fluxos.local": "Tamboréu" })
        .where("created_at", ">=", date1 + " 00:00:00")
        .where("created_at", "<=", date2 + " 23:59:59");

      const selos = {
        selosFisicos: {
          total: selosFisicosTotal || 0,
          p1: selosFisicosP1 || 0,
          p3: selosFisicosP3 || 0,
          tamboreu: selosFisicosTamboreu || 0
        },
        selosDigitais : {
          total: selosDigitaisTotal || 0,
          p1: selosDigitaisP1 || 0,
          p3: selosDigitaisP3 || 0,
          tamboreu: selosDigitaisTamboreu || 0
        }
      }
      const arrecadacao = {
        avulsosCartao: {
          total: avulsosCartaoTotal || 0,
          p1: avulsosCartaoP1 || 0,
          p3: avulsosCartaoP3 || 0,
          tamboreu: avulsosCartaoTamboreu || 0
        },
        avulsosSaida: {
          dinheiro: {
            total: avulsosSaidaDinheiroTotal || 0,
            p1: avulsosSaidaDinheiroP1 || 0,
            p3: avulsosSaidaDinheiroP3 || 0,
            tamboreu: avulsosSaidaDinheiroTamboreu || 0
          },
          cartaoCredito: {
            total: avulsosSaidaCartaoCreditoTotal || 0,
            p1: avulsosSaidaCartaoCreditoP1 || 0,
            p3: avulsosSaidaCartaoCreditoP3 || 0,
            tamboreu: avulsosSaidaCartaoCreditoTamboreu || 0
          },
          cartaoDebito: {
            total: avulsosSaidaCartaoDebitoTotal || 0,
            p1: avulsosSaidaCartaoDebitoP1 || 0,
            p3: avulsosSaidaCartaoDebitoP3 || 0,
            tamboreu: avulsosSaidaCartaoDebitoTamboreu || 0
          }
        },
        avulsosEntrada: {
          dinheiro: {
            total: avulsosEntradaDinheiroTotal || 0,
            p1: avulsosEntradaDinheiroP1 || 0,
            p3: avulsosEntradaDinheiroP3 || 0,
            tamboreu: avulsosEntradaDinheiroTamboreu || 0
          },
          cartaoCredito: {
            total: avulsosEntradaCartaoCreditoTotal || 0,
            p1: avulsosEntradaCartaoCreditoP1 || 0,
            p3: avulsosEntradaCartaoCreditoP3 || 0,
            tamboreu: avulsosEntradaCartaoCreditoTamboreu || 0
          },
          cartaoDebito: {
            total: avulsosEntradaCartaoDebitoTotal || 0,
            p1: avulsosEntradaCartaoDebitoP1 || 0,
            p3: avulsosEntradaCartaoDebitoP3 || 0,
            tamboreu: avulsosEntradaCartaoDebitoTamboreu || 0
          }
        },
        selosQtd: selos
      };
      // Caixas
      const historicoCaixas = await app
        .estacionamento("caixas")
        .where("created_at", ">=", date1 + " 00:00:00")
        .where("created_at", "<=", date2 + " 23:59:59");
      const historicoCaixasConsolidados = await app
        .estacionamento("caixas")
        .sum("saldoInicial")
        .sum("saldoFinalBruto")
        .sum("saldoFinalReal")
        .sum("montanteRetirado")
        .where("created_at", ">=", date1 + " 00:00:00")
        .where("created_at", "<=", date2 + " 23:59:59");
      const caixas = {
        historicoCaixas,
        historicoCaixasConsolidados
      };
      const report = {
        movimentacaoPessoas,
        movimentacaoVeiculos,
        arrecadacao,
        caixas
      };
      return res.json(report);
    } catch (error) {
      return res.status(400).send(error);
    }
  };

  return { get };
};
