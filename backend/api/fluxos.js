module.exports = app => {
  const {
    existsOrError,
    notExistsOrError,
    calculadoraDePrecos
  } = app.api.validation;

  const axios = require('axios');

  const mailer = require("nodemailer");
  const { mail } = require("../.env");

  const calcularPrecos = async (req, res) => {
    const dados = { ...req.body };
    const settings = await app
      .estacionamento("configuracoes")
      .where({ id: 1 })
      .first();
    const caixaDisponivel = await app
      .estacionamento("caixas")
      .where({ estado: false })
      .first();

    try {
      existsOrError(dados.evento, "Informe o evento que será calculado");
      existsOrError(dados.placa, "Informe a placa do veículo");
      existsOrError(dados.ambiente, "Informe o ambiente em que o cliente está rodando");
      existsOrError(dados.local, "Informe o local em que você está trabalhando");
      if (!dados.porte) dados.porte = "Carro";
      existsOrError(dados.operador, "Informe o operador atual");
      existsOrError(
        caixaDisponivel,
        "Não é possível operar sem que um caixa esteja aberto"
      );

      if (dados.porte === "Bicicleta") return res.status(204).send();
      if (dados.tipo !== "Sócio") return res.status(204).send();

      const today = new Date();
      const pagoComSelo = await app
        .estacionamento("fluxos")
        .where({
          placa: dados.placa,
          evento: "saída",
          cancelado: false
        })
        .whereIn("pagamento", ["Selo Físico", "Selo Digital"])
        .where("valor", ">", 0)
        .where(
          "created_at",
          ">=",
          `${today.getFullYear()}-${today.getMonth() +
          1}-${today.getDate()} 00:00:00`
        )
        .where(
          "created_at",
          "<=",
          `${today.getFullYear()}-${today.getMonth() +
          1}-${today.getDate()} 23:59:59`
        )
        .first()
        .catch(error => res.status(500).send(error));

      if (pagoComSelo) {
        return res.json({
          pagamento: pagoComSelo.pagamento,
          valorRetorno: pagoComSelo.valor
        });
      }

      // Recupera a última entrada registrada no banco de dados referente à placa recebida
      const ultimaEntrada = await app
        .estacionamento("fluxos")
        .where({
          evento: "entrada",
          finalizado: false,
          pagoNaEntrada: false,
          cancelado: false,
          placa: dados.placa
        })
        .first();

      // Se não tiver uma última entrada...
      if (!ultimaEntrada) {
        // Se for uma entrada...
        if (dados.evento === "entrada") {
          // E o horário atual for maior que o horário limite...
          if (new Date().getHours() < settings.horarioLimite && dados.local === 'P1') {
            return res.status(204).send();
          } else {
            // Retorna-se a cobrança do valor fixo apos o horário se for carro ou o valor fixo de motocicleta se for motocicleta.
            const cobranca = {
              valor:
                dados.porte === "Motocicleta"
                  ? settings.motocicleta
                  : settings.aposHorarioLimite,
              selos: 1
            };
            return res.json(cobranca);
          }
        } else {
          return res.status(204).send();
        }
      }

      // Verifica se há uma última saída registrada referente à placa recebida
      const ultimaSaida = await app
        .estacionamento("fluxos")
        .where({ parente: ultimaEntrada.id, cancelado: false })
        .first();

      // Se for uma entrada...
      if (dados.evento === "entrada") {
        // Calcula-se os horários de entrada e saída...
        const dataEntrada = ultimaEntrada.created_at;
        let automaticDate;
        if (!ultimaSaida) {
          if (
            new Date().getDate() === dataEntrada.getDate() &&
            new Date().getMonth() + 1 === dataEntrada.getMonth() + 1
          ) {
            automaticDate = new Date(
              `${dataEntrada.getFullYear()}-${dataEntrada.getMonth() +
              1}-${dataEntrada.getDate()} ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`
            );
          } else {
            automaticDate = new Date(
              `${dataEntrada.getFullYear()}-${dataEntrada.getMonth() +
              1}-${dataEntrada.getDate()} 23:00:00`
            );
          }
        } else {
          automaticDate = ultimaSaida.created_at;
        }

        // Se não houver uma última saída, insere uma na mesma data da entrada às 23:00:00
        if (!ultimaSaida) {
          await app
            .estacionamento("fluxos")
            .insert({
              parente: ultimaEntrada.id,
              veiculo: ultimaEntrada.veiculo,
              matricula: ultimaEntrada.matricula,
              placa: ultimaEntrada.placa,
              nome: ultimaEntrada.nome,
              caixa: ultimaEntrada.caixa,
              pagoNaEntrada: ultimaEntrada.pagoNaEntrada,
              movimentacao: ultimaEntrada.movimentacao,
              pagamento: ultimaEntrada.pagamento,
              evento: "saída",
              tipo: ultimaEntrada.tipo,
              porte: ultimaEntrada.porte,
              valor: 0,
              motivoRetirada:
                "[Motivo automático] Saída retroativa inserida pelo sistema.",
              operador: dados.operador,
              finalizado: false,
              created_at: automaticDate,
              updated_at: automaticDate
            })
            .catch(error => res.status(500).send(error));
        }

        const cobranca = calculadoraDePrecos(
          ultimaEntrada.created_at,
          automaticDate,
          dados.porte,
          settings,
          dados.evento,
          dados.local
        );

        return res.json(cobranca);
      } else {
        // Se for uma saída, calcula o valor a ser cobrado desde sua entrada até sua saída, que é o horário atual
        const cobranca = calculadoraDePrecos(
          ultimaEntrada.created_at,
          new Date(),
          dados.porte,
          settings,
          dados.evento,
          dados.local
        );
        return res.json(cobranca);
      }
    } catch (error) {
      return res.status(400).send(error);
    }
  };

  const entry = async (req, res) => {
    const entry = { ...req.body };

    const isCashboxAvailable = await app
      .estacionamento("caixas")
      .where({ estado: false })
      .first();
    entry.pagoNaEntrada = entry.pagouNaEntrada;
    delete entry.pagouNaEntrada;

    const settings = await app
      .estacionamento("configuracoes")
      .where({ id: 1 })
      .first();

    try {
      // entry.id -> id do veículo cadastrado
      if (!entry.id) {
        existsOrError(entry.placa, "Informe uma placa válida");
      }
      existsOrError(entry.ambiente, "Informe o ambiente em que o cliente está sendo executado");
      existsOrError(entry.local, "Informe o local em que você está trabalhando");
      existsOrError(isCashboxAvailable.id, "Informe um caixa válido");
      existsOrError(entry.nome, "Informe um nome de motorista válido");
      existsOrError(entry.evento, "Informe se é uma entrada ou uma saída");
      existsOrError(
        entry.tipo,
        "Informe um tipo de pessoa válido"
      );
      existsOrError(entry.operador, "Informe o operador atual");
      existsOrError(
        entry.movimentacao,
        "Informe a movimentação (pagamento ou retirada)"
      );
      notExistsOrError(
        isCashboxAvailable.estado,
        "Não é possível registrar uma entrada com o caixa fechado"
      );

      if (entry.veiculo) {
        const veiculo = await app
          .estacionamento("veiculos")
          .where({ id: entry.veiculo })
          .first();
        existsOrError(veiculo, "Este veículo não está cadastrado no sistema");

        const pessoa = await app
          .estacionamento("pessoas")
          .where({ id: veiculo.pessoa })
          .first();
        existsOrError(
          pessoa,
          "O dono desse veículo não está cadastrado no sistema"
        );

        const veiculos = await app
          .estacionamento("veiculos")
          .where({ pessoa: pessoa.id });

        for (let index = 0; index < veiculos.length; index++) {
          const veiculoNoClube = await app
            .estacionamento("fluxos")
            .where({
              evento: "entrada",
              finalizado: false,
              cancelado: false,
              veiculo: veiculos[index].id
            })
            .first();

          notExistsOrError(
            veiculoNoClube,
            `Essa pessoa já tem um veículo de placa ${
            veiculos[index].placa
            } no clube`
          );
        }
      }

      const condition = entry.id
        ? { "fluxos.veiculo": entry.id }
        : { "fluxos.placa": entry.placa };

      const ultimaEntrada = await app
        .estacionamento("fluxos")
        .where({ evento: "entrada", finalizado: false, ...condition })
        .first()
        .catch(error => res.status(500).send(error));

      if (ultimaEntrada) {
        await app
          .estacionamento("fluxos")
          .update({
            finalizado: true
          })
          .where({
            id: ultimaEntrada.id
          })
          .catch(error => res.status(500).send(error));
      }

      const isUpToDate = await app
        .estacionamento("fluxos")
        .leftJoin("fluxos as a", "a.parente", "fluxos.id")
        .where(condition)
        .where({ "fluxos.cancelado": false })
        .where({ "fluxos.finalizado": 0, "fluxos.evento": "entrada" })
        .whereNull("a.parente");
      notExistsOrError(isUpToDate, "Este veículo já está dentro do clube");

      const isBlockedByPlate = await app
        .estacionamento("bloqueios")
        .where({ placa: entry.placa })
        .first();

      const isBlockedByRegistration = await app
        .estacionamento("bloqueios")
        .where({ matricula: entry.matricula ? entry.matricula : null })
        .first();

      if (isBlockedByPlate || isBlockedByRegistration) {
        if (isBlockedByPlate) {
          notExistsOrError(isBlockedByPlate, {
            error: "unauthorized",
            type: "Placa",
            value: entry.placa,
            reason: isBlockedByPlate["motivo"],
            created_at: isBlockedByPlate["created_at"]
          });
        } else {
          notExistsOrError(isBlockedByRegistration, {
            error: "unauthorized",
            type: "Matrícula",
            value: entry.matricula,
            reason: isBlockedByRegistration["motivo"],
            created_at: isBlockedByRegistration["created_at"]
          });
        }
      }
    } catch (error) {
      return res.status(400).send(error);
    }

    if (entry.placa === "BICICLETA") entry.finalizado = true;

    if (new Date().getHours() >= settings.horarioLimite && entry.valor > 0) {
      entry.pagoNaEntrada = true;
    } else {
      entry.pagoNaEntrada = false;
    }

    if (entry.local !== 'mobile' && entry.valor > 0) {
      entry.pagoNaEntrada = true
      entry.finalizado = true
    }

    app
      .estacionamento("fluxos")
      .insert(entry)
      .then(async id => {
        if (entry.pagamento === 'Pendência de Leitura de Carteirinha') {
          await app.estacionamento("fluxos")
            .update({ cancelado: true })
            .where({ id: id[0] })
            .catch(err => res.status(500).send(err))

          // cria uma instância do axios
          const axiosInstance = axios.create({
            baseURL: process.env.ENVIRONMENT === 'development' ?
              'http://172.20.144.152:3000' :
              'https://creditimao.sccorinthians.com.br/api',
            headers: {
              'Authorization': req.headers.authorization
            }
          })

          // consulta o saldo do sócio
          const crediTimaoResponse = await axiosInstance.get('/estacionamento/saldo/' + entry.matricula.replace('-', ''))

          // se tiver saldo suficiente, segue com o processo
          if (crediTimaoResponse.data.saldo < entry.valor) {
            await app.estacionamento("fluxos").where({ id: id[0] }).del();

            return res.status(400).send("Saldo de selos digitais insuficiente")
          }

          // debita do saldo de selos digitais do sócio
          await axiosInstance.post('/estacionamento/debito/' + entry.matricula.replace('-', ''), {
            quantia: entry.valor,
            operador: entry.operador,
            porte: entry.porte,
          }).then(async () => {
            entry.pagamento = 'Selo Digital'

            // insere um novo registro no banco de dados para sinalizar que foi realizado o débito de selo digital com sucesso
            await app.estacionamento('fluxos')
              .insert(entry)
              .then(async () => {

                // cria uma nova ocorrência
                await app
                  .estacionamento("ocorrencias")
                  .insert({
                    matricula: entry.matricula,
                    descricao: '[Ocorrência automática] Não foi possível realizar a leitura da carteirinha do sócio para realizar o pagamento com selos digitais. Por isso, escolhi a forma de pagamento "Pendência de Leitura de Carteirinha" para que o sistema realize o processo de débito automático.',
                    operador: entry.operador
                  }).then(async () => {

                    // envia um e-mail para alertar que o método Pendência de Leitura de Carteirinha foi utilizado
                    let transporter = mailer.createTransport({
                      host: mail.host,
                      port: mail.port,
                      secure: mail.secure
                    });

                    await transporter.sendMail({
                      from: `Estacionamento SCCP`,
                      to: mail.to,
                      subject: "Falha na leitura de carteirinha registrada como Pendência de Leitura de Carteirinha",
                      text: `Esta é uma mensagem automática do sistema do estacionamento. Por favor, não a responda.\n\nO operador ${
                        entry.operador
                        } registrou uma movimentação paga com Pendência de Leitura de Carteirinha na matrícula ${
                        entry.matricula
                        }.\n\nEsta forma de pagamento deve ser utilizada unica e exclusivamente para os casos em que a leitura da carteirinha do sócio não for bem-sucedida.\n\nSerão debitados ${entry.valor} selos digitais da carteira de selos digitais do sócio.\n\nA movimentação foi ajustada de "Pendência de Leitura de Carteirinha" para "Selo Digital".\n\nAtenciosamente,\nSistema de Estacionamento.`
                    });

                    return res.status(204).send()
                  })
                  .catch(err => res.status(500).send(err));
              }).catch(err => res.status(500).send(err));
          }).catch(err => res.status(500).send(err.response.data));
        } else {
          return res.status(204).send()
        }
      })
      .catch(err => {
        return res.status(500).send(err);
      });
  };

  const exit = async (req, res) => {
    const exit = { ...req.body };

    try {
      if (!exit.idvehicle) {
        existsOrError(exit.placa, "Informe a placa do veículo");
      }
      existsOrError(exit.caixa, "Informe o caixa atual");
      existsOrError(exit.identry, "Este veículo não está dentro do clube");
      existsOrError(exit.nome, "Informe o nome do motorista");
      existsOrError(exit.evento, "Informe o evento (Entrada ou saída)");
      existsOrError(exit.local, "Informe o local em que você está trabalhando");
      existsOrError(exit.ambiente, "Informe o ambiente em que o cliente está rodando");
      existsOrError(
        exit.tipo,
        "Informe o tipo (Sócio, funcionário ou credenciado)"
      );
      existsOrError(exit.operador, "Informe o operador atual");
      existsOrError(
        exit.movimentacao,
        "Informe a movimentação (Pagamento ou retirada)"
      );

      const isCashboxAvailable = await app
        .estacionamento("caixas")
        .where({ id: exit.caixa })
        .first();

      notExistsOrError(
        isCashboxAvailable.estado,
        "Não é possível registrar uma saída com o caixa fechado"
      );
    } catch (error) {
      return res.status(400).send(error);
    }

    exit.parente = exit.identry;
    delete exit.identry;

    await app
      .estacionamento("fluxos")
      .update({ finalizado: 1 })
      .where({ id: exit.parente });

    app
      .estacionamento("fluxos")
      .insert(exit)
      .then(async id => {
        if (exit.pagamento === 'Pendência de Leitura de Carteirinha') {
          await app.estacionamento("fluxos")
            .update({ cancelado: true })
            .where({ id: id[0] })
            .catch(err => res.status(500).send(err));

          // cria instância do axios
          const axiosInstance = axios.create({
            baseURL: process.env.ENVIRONMENT === 'development' ?
              'http://172.20.144.152:3000' :
              'https://creditimao.sccorinthians.com.br/api',
            headers: {
              'Authorization': req.headers.authorization
            }
          });

          // consulta o saldo do sócio
          const crediTimaoResponse = await axiosInstance.get('/estacionamento/saldo/' + exit.matricula.replace('-', ''))

          // se tiver saldo suficiente, segue com o processo
          if (crediTimaoResponse.data.saldo < exit.valor) {
            await app.estacionamento("fluxos").where({ id: id[0] }).del();
            await app.estacionamento("fluxos").update({ finalizado: false }).where({ id: exit.parente });

            return res.status(400).send("Saldo de selos digitais insuficiente")
          }

          // debita do saldo de selos digitais do sócio
          await axiosInstance.post('/estacionamento/debito/' + exit.matricula.replace('-', ''), { quantia: exit.valor, operador: exit.operador, porte: exit.porte }).then(async () => {
            exit.pagamento = 'Selo Digital'

            // insere um novo registro no banco de dados para sinalizar que foi realizado o débito de selo digital com sucesso
            await app.estacionamento("fluxos")
              .insert(exit)
              .then(async () => {

                // cria uma nova ocorrência
                await app
                  .estacionamento("ocorrencias")
                  .insert({
                    matricula: exit.matricula,
                    descricao: '[Ocorrência automática] Não foi possível realizar a leitura da carteirinha do sócio para realizar o pagamento com selos digitais. Por isso, escolhi a forma de pagamento "Pendência de Leitura de Carteirinha" para que o sistema realize o processo de débito automático.',
                    operador: exit.operador
                  }).then(async () => {

                    // envia um e-mail para alertar que o método Pendência de Leitura de Carteirinha foi utilizado
                    let transporter = mailer.createTransport({
                      host: mail.host,
                      port: mail.port,
                      secure: mail.secure
                    });

                    await transporter.sendMail({
                      from: `Estacionamento SCCP`,
                      to: mail.to,
                      subject: "Falha na leitura de carteirinha registrada como Pendência de Leitura de Carteirinha",
                      text: `Esta é uma mensagem automática do sistema do estacionamento. Por favor, não a responda.\n\nO operador ${
                        exit.operador
                        } registrou uma movimentação paga com Pendência de Leitura de Carteirinha na matrícula ${
                        exit.matricula
                        }.\n\nEsta forma de pagamento deve ser utilizada unica e exclusivamente para os casos em que a leitura da carteirinha do sócio não for bem-sucedida.\n\nSerão debitados ${exit.valor} selos digitais da carteira de selos digitais do sócio.\n\nA movimentação foi ajustada de "Pendência de Leitura de Carteirinha" para "Selo Digital".\n\nAtenciosamente,\nSistema de Estacionamento.`
                    });

                    return res.status(204).send()
                  })
                  .catch(err => res.status(500).send(err));
              })
              .catch(err => res.status(500).send(err));
          }).catch(async err => {
            await app.estacionamento("fluxos").where({ id: id[0] }).del();
            await app.estacionamento("fluxos").update({ finalizado: false }).where({ id: exit.parente });

            return res.status(500).send(err.response.data)
          });
        } else {
          return res.status(204).send()
        }
      })
      .catch(err => res.status(500).send(err));
  };

  const ultimoFluxo = (req, res) => {
    try {
      existsOrError(
        req.params.matricula,
        "Informe a matrícula para recuperar o último fluxo"
      );
    } catch (error) {
      return res.status(400).send(error);
    }
    app
      .estacionamento("fluxos")
      .where({ matricula: req.params.matricula, cancelado: false })
      .orderBy("created_at", "desc")
      .first()
      .then(response => res.json(response));
  };

  const editar = async (req, res) => {
    const fluxo = { ...req.body };
    try {
      existsOrError(fluxo.id, "Informe o fluxo que será editado");
      // existsOrError(fluxo.pagamento, "Informe a forma de pagamento");
      existsOrError(fluxo.motivo, "Informe o motivo da edição da movimentação");
      existsOrError(fluxo.operador, "Informe o operador atual");
      existsOrError(fluxo.porte, "Informe o porte do veículo");
    } catch (error) {
      return res.status(400).send(error);
    }

    const fluxoOriginal = await app
      .estacionamento("fluxos")
      .where({ id: fluxo.id })
      .first()
      .catch(error => res.status(500).send(error));

    const fluxoDependente = await app
      .estacionamento("fluxos")
      .where({ parente: fluxoOriginal.id, cancelado: false })
      .first();

    if (fluxoDependente) {
      if (fluxo.porte === "Bicicleta") {
        await app
          .estacionamento("fluxos")
          .update({ cancelado: true })
          .where({ id: fluxoDependente.id })
          .catch(error => res.status(500).send(error));
      } else {
        await app
          .estacionamento("fluxos")
          .update({ cancelado: true })
          .where({ id: fluxoDependente.id })
          .catch(error => res.status(500).send(error));

        delete fluxoDependente.id,
          fluxoDependente.porte,
          fluxoDependente.motivoRetirada,
          fluxoDependente.operador;
        fluxoDependente.operador = fluxo.operador;
        fluxoDependente.porte = fluxo.porte;
        fluxoDependente.motivoRetirada = fluxo.motivo;

        await app
          .estacionamento("fluxos")
          .insert(fluxoDependente)
          .where({ id: fluxoDependente.id })
          .catch(error => res.status(500).send(error));
      }
    }

    if (fluxo.parente) {
      const fluxoParente = await app
        .estacionamento("fluxos")
        .where({ id: fluxo.parente })
        .first()
        .catch(error => res.status(500).send(error));

      if (fluxo.porte === "Bicicleta") {
        await app
          .estacionamento("fluxos")
          .update({ cancelado: true })
          .where({ id: fluxoParente.id })
          .catch(error => res.status(500).send(error));

        delete fluxoParente.id,
          fluxoParente.operador,
          fluxoParente.porte,
          fluxoParente.finalizado,
          fluxoParente.motivoRetirada,
          fluxoParente.placa;
        fluxoParente.operador = fluxo.operador;
        fluxoParente.porte = fluxo.porte;
        fluxoParente.finalizado = true;
        fluxoParente.motivoRetirada = fluxo.motivo;
        fluxoParente.placa = "BICICLETA";

        await app
          .estacionamento("fluxos")
          .insert(fluxoParente)
          .then(() => res.status(204).send())
          .catch(error => res.status(500).send(error));
      } else {
        if (fluxoParente.porte !== fluxo.porte) {
          await app
            .estacionamento("fluxos")
            .update({ cancelado: true })
            .where({ id: fluxoParente.id })
            .catch(error => res.status(500).send(error));

          delete fluxoParente.id,
            fluxoParente.porte,
            fluxoParente.operador,
            fluxoParente.motivoRetirada;
          fluxoParente.operador = fluxo.operador;
          fluxoParente.motivoRetirada = fluxo.motivo;
          fluxoParente.porte = fluxo.porte;

          await app
            .estacionamento("fluxos")
            .insert(fluxoParente)
            .catch(error => res.status(500).send(error));
        }
      }
    }

    await app
      .estacionamento("fluxos")
      .update({ cancelado: true })
      .where({ id: fluxoOriginal.id })
      .catch(error => res.status(500).send(error));

    delete fluxoOriginal.id,
      fluxoOriginal.pagamento,
      fluxoOriginal.porte,
      fluxoOriginal.motivoRetirada,
      fluxoOriginal.operador,
      fluxoOriginal.valor;

    if (fluxo.porte === "Bicicleta") {
      fluxoOriginal.placa = "BICICLETA";
    }

    const novoFluxo = {
      ...fluxoOriginal,
      pagamento: fluxo.pagamento,
      porte: fluxo.porte,
      valor: fluxo.valor,
      operador: fluxo.operador,
      motivoRetirada: fluxo.motivo
    };

    if (fluxo.porte === "Bicicleta") {
      novoFluxo.valor = 0;
      novoFluxo.pagamento = null;
      novoFluxo.finalizado = true;
    }

    await app
      .estacionamento("fluxos")
      .insert(novoFluxo)
      .then(() => res.status(204).send())
      .catch(error => res.status(500).send(error));
  };

  const saidaRetroativa = async (req, res) => {
    const data = { ...req.body };
    try {
      existsOrError(data.placa, "Informe a placa do veículo");
      existsOrError(data.data, "Informe a data da saída retroativa");
      existsOrError(data.horario, "Informe o horário da saída retroativa");
      existsOrError(data.operador, "Informe o operador atual");

      const ultimaEntradaPendente = await app
        .estacionamento("fluxos")
        .where({ placa: data.placa, finalizado: false, evento: "entrada" })
        .first()
        .catch(error => res.status(500).send(error));

      existsOrError(
        ultimaEntradaPendente,
        "Este veículo não tem uma entrada em aberto"
      );

      const saidaCadastrada = await app
        .estacionamento("fluxos")
        .where({ parente: ultimaEntradaPendente.id })
        .first();

      notExistsOrError(
        saidaCadastrada,
        "Já existe uma saída retroativa cadastrada para este veículo"
      );

      const ultimoCaixaAberto = await app
        .estacionamento("caixas")
        .where({ estado: false })
        .first()
        .catch(error => res.status(500).send(error));

      existsOrError(
        ultimoCaixaAberto,
        "Não é possível inserir uma saída retroativa sem que um caixa esteja aberto"
      );

      if (
        new Date(ultimaEntradaPendente.created_at) >
        new Date(`${data.data} ${data.horario}:00`)
      )
        throw "Não é possível inserir uma entrada retroativa antes da entrada referente";

      await app
        .estacionamento("fluxos")
        .insert({
          parente: ultimaEntradaPendente.id,
          veiculo: ultimaEntradaPendente.veiculo,
          matricula: ultimaEntradaPendente.matricula,
          placa: ultimaEntradaPendente.placa,
          nome: ultimaEntradaPendente.nome,
          caixa: ultimoCaixaAberto.id,
          pagoNaEntrada: ultimaEntradaPendente.pagoNaEntrada,
          movimentacao: ultimaEntradaPendente.movimentacao,
          pagamento: ultimaEntradaPendente.pagamento,
          evento: "saída",
          tipo: ultimaEntradaPendente.tipo,
          porte: ultimaEntradaPendente.porte,
          motivoRetirada: ultimaEntradaPendente.motivoRetirada,
          valor: 0,
          operador: data.operador,
          finalizado: false,
          cancelado: false,
          created_at: `${data.data} ${data.horario}:00`,
          updated_at: `${data.data} ${data.horario}:00`
        })
        .then(() => res.status(204).send())
        .catch(error => res.status(500).send(error));
    } catch (error) {
      return res.status(400).send(error);
    }
  };

  return { entry, exit, ultimoFluxo, calcularPrecos, editar, saidaRetroativa };
};
