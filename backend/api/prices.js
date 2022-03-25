module.exports = app => {
  const { existsOrError } = app.api.validation;

  const get = async (req, res) => {
    await app
      .estacionamento("configuracoes")
      .first()
      .then(settings => res.json(settings))
      .catch(error => res.status(500).send(error));
  };

  const save = async (req, res) => {
    const settings = { ...req.body };
    try {
      existsOrError(settings.zeroAQuatro, "Informe o valor de 0 a 4 horas");
      existsOrError(settings.quatroAOito, "Informe o valor de 4 a 8 horas");
      existsOrError(settings.oitoADoze, "Informe o valor de 8 a 12 horas");
      existsOrError(
        settings.horarioLimite,
        "Informe um horário limite entre 0h e 23h"
      );
      if (settings.horarioLimite > 23 || settings.horarioLimite < 0) {
        throw "Informe um horário limite entre 0h e 23h";
      }
      existsOrError(
        settings.aposHorarioLimite,
        "Informe o valor fixo que será cobrado após o horário limite"
      );
      existsOrError(
        settings.acimaDeDoze,
        "Informe o valor para acima de 12 horas"
      );
      existsOrError(
        settings.motocicleta,
        "Informe o valor único para motocicletas"
      );
      existsOrError(
        settings.proximoDia,
        "Informe o valor que será cobrado no próximo dia"
      );
      existsOrError(settings.tolerancia, "Informe o tempo de tolerância");
      existsOrError(settings.operador, "Informe o operador atual");
    } catch (error) {
      return res.status(400).send(error);
    }
    await app
      .estacionamento("configuracoes")
      .update({
        zeroAQuatro: settings.zeroAQuatro,
        quatroAOito: settings.quatroAOito,
        oitoADoze: settings.oitoADoze,
        acimaDeDoze: settings.acimaDeDoze,
        motocicleta: settings.motocicleta,
        proximoDia: settings.proximoDia,
        horarioLimite: settings.horarioLimite,
        aposHorarioLimite: settings.aposHorarioLimite,
        valorInicialCaixa: settings.valorInicialCaixa,
        tolerancia: settings.tolerancia,
        validadeSelo: settings.validadeSelo,
        precoSelo: settings.precoSelo,
        operador: settings.operador,
        updated_at: new Date("YYYY-MM-DD HH:mm:ss")
      })
      .where({ id: 1 })
      .then(() => res.status(204).send())
      .catch(error => res.status(500).send(error));
  };

  return { get, save };
};
