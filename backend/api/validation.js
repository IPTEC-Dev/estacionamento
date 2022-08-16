module.exports = app => {
  function existsOrError(value, msg) {
    if (!value) throw msg;
    if (Array.isArray(value) && value.length === 0) throw msg;
    if (typeof value === "string" && !value.trim()) throw msg;
  }

  function notExistsOrError(value, msg) {
    try {
      existsOrError(value, msg);
    } catch (msg) {
      return;
    }
    throw msg;
  }

  function equalsOrError(a, b, msg) {
    if (a !== b) throw msg;
  }

  function lessOrEqualOrError(a, b, msg) {
    if (a < 0) a = a * -1;
    if (a > b) throw msg;
  }

  function calculadoraDePrecos(
    dataEntrada,
    dataSaida,
    porte,
    settings,
    evento,
    local
  ) {
    const horarioEntrada = Date.parse(dataEntrada);
    const horarioSaida = Date.parse(dataSaida);
    const diferenca = horarioSaida - horarioEntrada;
    const diferencaHoras = diferenca / 3600000;
    const qtdDias =
      Math.round(diferencaHoras / 24) < 1 ? 1 : Math.round(diferencaHoras / 24);
    const diferencaHorasUteis =
      diferencaHoras > 17 ? diferencaHoras - 7 * qtdDias : diferencaHoras;
    const cobranca = {};
    if (diferencaHorasUteis <= settings.tolerancia / 60) {
      cobranca.valor = 0;
      cobranca.selos = 0;
    } else if (
      diferencaHorasUteis > settings.tolerancia / 60 &&
      diferencaHorasUteis <= 4
    ) {
      cobranca.valor =
        porte === "Motocicleta" ? settings.motocicleta : settings.zeroAQuatro;
      cobranca.selos = 1;
    } else if (diferencaHorasUteis > 4 && diferencaHorasUteis <= 8) {
      cobranca.valor =
        porte === "Motocicleta" ? settings.motocicleta : settings.quatroAOito;
      cobranca.selos = 1;
    } else if (diferencaHorasUteis > 8 && diferencaHorasUteis <= 12) {
      cobranca.valor =
        porte === "Motocicleta" ? settings.motocicleta : settings.oitoADoze;
      cobranca.selos = 1;
    } else if (diferencaHorasUteis > 12 && diferencaHorasUteis <= 24) {
      cobranca.valor =
        porte === "Motocicleta" ? settings.motocicleta : settings.acimaDeDoze;
      cobranca.selos = 2;
    } else {
      const resto = diferencaHorasUteis % 24;
      cobranca.valor =
        settings.proximoDia * Math.round(diferencaHorasUteis / 24);
      cobranca.selos = Math.round(diferencaHorasUteis / 12);
      if (resto > settings.tolerancia / 60 && resto <= 4) {
        cobranca.valor +=
          porte === "Motocicleta" ? settings.motocicleta : settings.zeroAQuatro;
        cobranca.selos += 1;
      } else if (resto > 4 && resto <= 8) {
        cobranca.valor +=
          porte === "Motocicleta" ? settings.motocicleta : settings.quatroAOito;
        cobranca.selos += 1;
      } else if (resto > 8 && resto <= 12) {
        cobranca.valor +=
          porte === "Motocicleta" ? settings.motocicleta : settings.oitoADoze;
        cobranca.selos += 1;
      } else if (resto > 12 && resto <= 24) {
        cobranca.valor +=
          porte === "Motocicleta" ? settings.motocicleta : settings.acimaDeDoze;
        cobranca.selos += 2;
      }
    }
    cobranca.horas = diferencaHoras.toFixed(2);
    cobranca.horasUteis = diferencaHorasUteis.toFixed(2);
    cobranca.dataEntrada = dataEntrada;
    cobranca.dataSaida = dataSaida;
    if (
      (new Date().getHours() >= settings.horarioLimite &&
        evento === "entrada") || (local !== "P1" && evento === "entrada")
    ) {
      cobranca.valor += settings.aposHorarioLimite;
      cobranca.selos += 1;
    }
    return cobranca;
  }

  return {
    existsOrError,
    notExistsOrError,
    equalsOrError,
    lessOrEqualOrError,
    calculadoraDePrecos
  };
};
