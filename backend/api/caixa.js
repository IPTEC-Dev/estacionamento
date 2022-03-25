module.exports = app => {
  const { existsOrError, notExistsOrError } = app.api.validation;

  const init = async (req, res) => {
    const caixa = { ...req.body };
    const lastCashboxId = await app
      .estacionamento("caixas")
      .max("id")
      .first();
    const lastCaixa = await app
      .estacionamento("caixas")
      .select("saldoFinalReal")
      .where({ id: lastCashboxId["max(`id`)"] })
      .first();
    try {
      existsOrError(
        lastCaixa,
        "Não foi possível recuperar o saldo final real do último caixa gerado"
      );
      existsOrError(caixa.operadorInicial, "Informe o operador atual");
    } catch (error) {
      return res.status(400).send(error);
    }
    await app
      .estacionamento("caixas")
      .insert({
        operadorInicial: caixa.operadorInicial,
        saldoInicial: caixa.saldoInicial
      })
      .catch(error => res.status(500).send(error));
    const lastCashboxIdNovo = await app
      .estacionamento("caixas")
      .max("id")
      .where({ estado: false })
      .first();
    const lastCaixaNovo = await app
      .estacionamento("caixas")
      .select("id")
      .where({ id: lastCashboxIdNovo["max(`id`)"] })
      .first();
    if (lastCaixa.saldoFinalReal > caixa.saldoInicial) {
      await app
        .estacionamento("fluxos")
        .insert({
          caixa: lastCaixaNovo.id,
          movimentacao: "retirada",
          pagamento: "Dinheiro",
          evento: "divergência",
          tipo: "Funcionário",
          valor: (lastCaixa.saldoFinalReal - caixa.saldoInicial) * -1,
          operador: caixa.operadorInicial,
          motivoRetirada: `Divergência entre fechamento do caixa anterior com o valor inicial do caixa atual. Houve uma difereça negativa de R$ ${(lastCaixa.saldoFinalReal -
            caixa.saldoInicial) *
            -1},00`,
          finalizado: true
        })
        .then(() => res.status(204).send())
        .catch(error => res.status(500).send(error));
    } else if (lastCaixa.saldoFinalReal < caixa.saldoInicial) {
      await app
        .estacionamento("fluxos")
        .insert({
          caixa: lastCaixaNovo.id,
          movimentacao: "pagamento",
          pagamento: "Dinheiro",
          evento: "divergência",
          tipo: "Funcionário",
          valor: (lastCaixa.saldoFinalReal - caixa.saldoInicial) * -1,
          operador: caixa.operadorInicial,
          motivoRetirada: `Divergência entre fechamento do caixa anterior com o valor inicial do caixa atual. Houve uma difereça positiva de R$ ${(lastCaixa.saldoFinalReal -
            caixa.saldoInicial) *
            -1},00`,
          finalizado: true
        })
        .then(() => res.status(204).send())
        .catch(error => res.status(500).send(error));
    }
    return res.status(204).send();
  };

  const close = async (req, res) => {
    const caixa = { ...req.body };
    try {
      existsOrError(caixa.id, "Informe o caixa que será fechado");
      existsOrError(caixa.operadorFinal, "Informe o operador atual");

      const settings = await app
        .estacionamento("configuracoes")
        .where({ id: 1 })
        .first()
        .catch(error => res.status(500).send(error));

      if (settings.valorInicialCaixa !== caixa.saldoFinalReal) {
        const diferenca = caixa.saldoFinalReal - settings.valorInicialCaixa;
        throw {
          error: "divergência",
          value: diferenca
        };
      }
    } catch (error) {
      return res.status(400).send(error);
    }
    await app
      .estacionamento("caixas")
      .update({
        operadorFinal: caixa.operadorFinal,
        saldoFinalBruto: caixa.saldoFinalBruto,
        saldoFinalReal: caixa.saldoFinalReal,
        montanteRetirado: caixa.montanteRetirado,
        estado: true,
        updated_at: new Date("YYYY-MM-dd HH:mm:ss")
      })
      .where({ id: caixa.id })
      .then(() => res.status(204).send())
      .catch(error => res.status(500).send(error));
  };

  const withdraw = async (req, res) => {
    const caixa = { ...req.body };
    const caixas = await app
      .estacionamento("caixas")
      .where({ id: caixa.id })
      .first();
    let retiradas = caixa.valor;
    let lucroTotal = caixas.saldoInicial;
    let lucroAReceber = 0;
    const fluxos = await app
      .estacionamento("fluxos")
      .where({ caixa: caixa.id })
      .where("valor", "!=", "0")
      .where({ cancelado: false });
    fluxos.forEach(fluxo => {
      if (fluxo.movimentacao !== "retirada" && fluxo.evento !== "divergência")
        lucroTotal += fluxo.valor;
      if (fluxo.movimentacao === "retirada") retiradas += fluxo.valor;
      if (
        fluxo.movimentacao === "pagamento" &&
        (fluxo.pagamento === "Cartão de débito" ||
          fluxo.pagamento === "Cartão de crédito")
      )
        lucroAReceber += fluxo.valor;
    });
    lucroTotal += retiradas;

    const saldoInicialPadrao = await app
      .estacionamento("configuracoes")
      .where({ id: 1 })
      .first();

    try {
      const totalRetiradas = retiradas;
      const lucroFinalReal = lucroTotal - lucroAReceber;
      if (lucroFinalReal < saldoInicialPadrao.valorInicialCaixa) {
        throw "O montante de retirada não pode ser maior que o valor do saldo final real do caixa";
      }
      const isCashboxAvailable = await app
        .estacionamento("caixas")
        .where({ id: caixa.id })
        .first();
      notExistsOrError(
        isCashboxAvailable.estado,
        "Não é possível registrar uma entrada com o caixa fechado"
      );
      existsOrError(caixa.motivoRetirada, "Informe um motivo para a retirada");
      existsOrError(caixa.id, "Informe o número do caixa");
      existsOrError(caixa.movimentacao, "Informe o tipo de movimentação");
      existsOrError(caixa.pagamento, "Informe a forma de pagamento");
      existsOrError(caixa.evento, "Informe o tipo do evento");
      existsOrError(caixa.tipo, "Informe o tipo da pessoa");
      existsOrError(caixa.valor, "Informe o valor da retirada");
      existsOrError(caixa.operador, "Informe o operador atual");
    } catch (error) {
      return res.status(400).send(error);
    }
    await app
      .estacionamento("fluxos")
      .insert({
        caixa: caixa.id,
        movimentacao: caixa.movimentacao,
        pagamento: caixa.pagamento,
        evento: caixa.evento,
        tipo: caixa.tipo,
        valor: caixa.valor,
        operador: caixa.operador,
        motivoRetirada: caixa.motivoRetirada,
        finalizado: true
      })
      .then(() => res.status(204).send())
      .catch(error => res.status(500).send(error));
  };

  const get = async (req, res) => {
    const lastCashboxId = await app
      .estacionamento("caixas")
      .max("id")
      .first();
    const caixa = await app
      .estacionamento("caixas")
      .where({ id: lastCashboxId["max(`id`)"] })
      .first();
    try {
      existsOrError(caixa, "Não foi possível recuperar o último caixa gerado");
    } catch (error) {
      return res.status(500).send(error);
    }
    const fluxos = await app
      .estacionamento("fluxos")
      .where({ caixa: caixa.id });
    res.json({ caixa, fluxos });
  };

  const getAll = async (req, res) => {
    await app
      .estacionamento("caixas")
      .orderBy("id", "desc")
      .then(caixas => {
        return res.json([
          {
            id: '*',
            created_at: new Date('2019-06-04 05:00:00')
          },
          ...caixas
        ])
      })
      .catch(error => res.status(500).send(error));
  };

  const getById = async (req, res) => {
    const id = req.params.id;
    try {
      existsOrError(id, "Informe o número identificador do caixa");
    } catch (error) {
      res.status(400).send(error);
    }

    if (id === '*') {
      await app.estacionamento.raw(`
        SELECT * FROM fluxos WHERE created_at BETWEEN "${req.query.de ? req.query.de + ' 00:00:00' : '2019-06-04 00:00:00'}" AND "${req.query.ate ? req.query.ate + ' 00:00:00' : '9999-12-31 23:59:59'}"
      `).then(fluxos => res.json(fluxos[0]))
    } else {
      await app.estacionamento.raw(`
        SELECT * FROM fluxos WHERE caixa = ${id} AND created_at BETWEEN "${req.query.de ? req.query.de + ' 00:00:00' : '2019-06-04 00:00:00'}" AND "${req.query.ate ? req.query.ate + ' 00:00:00' : '9999-12-31 23:59:59'}"
      `).then(fluxos => res.json(fluxos[0]))
    }
  };

  return { init, close, withdraw, get, getAll, getById };
};
