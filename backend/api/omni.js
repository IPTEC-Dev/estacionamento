module.exports = app => {
  const { existsOrError } = app.api.validation;

  const toleranciaBloqueio = 259200000;

  const getRegistrationByPlate = async (req, res) => {
    const data = { ...req.params };
    try {
      existsOrError(data.plate, "Informe a placa do veículo");
      const fluxo = await app
        .estacionamento("fluxos")
        .select(
          "fluxos.matricula",
          "fluxos.nome",
          "fluxos.tipo",
          "fluxos.valor",
          "fluxos.porte",
          "fluxos.pagoNaEntrada",
          "fluxos.id as identry"
        )
        .leftJoin("fluxos as a", "a.parente", "fluxos.id")
        .where({
          "fluxos.placa": data.plate,
          "fluxos.evento": "entrada",
          "fluxos.finalizado": false,
          "fluxos.cancelado": false
        })
        .whereNull("a.parente")
        .first();
      existsOrError(fluxo, "Este veículo não está dentro do clube");
      return res.json(fluxo);
    } catch (error) {
      return res.status(400).send(error);
    }
  };

  const getOmniData = async (req, res) => {
    const data = { ...req.body };
    try {
      existsOrError(data.registration, "Informe a matrícula");
      existsOrError(data.code, "Informe o dígito da matrícula");
      let response = null;
      response = await app
        .omni("omniclub.cadsocio")
        .select(
          app.omni.raw(
            "regexp_replace(nome, '[^a-zA-Z0-9 ]+', '', 'g') as nome"
          )
        )
        .where({ matricula: data.registration, cod_dep: data.code })
        .first()
        .then(nome => {
          if (nome) return res.json(nome);
        });
      if (!response) {
        response = await app
          .omni("omniclub.caddep")
          .select(
            "habil_mens",
            app.omni.raw(
              "regexp_replace(nome, '[^a-zA-Z0-9 ]+', '', 'g') as nome"
            )
          )
          .where({ matricula: data.registration, cod_dep: data.code })
          .first()
          .then(nome => res.json(nome));
      }
      existsOrError(response, "Matrícula não encontrada");
    } catch (error) {
      return res.status(400).send(error);
    }
  };

  const verifyRegistration = async (req, res) => {
    const data = { ...req.body };
    try {
      existsOrError(data.registration, "Informe a matrícula");
      existsOrError(data.plate, "Informe a placa");
      existsOrError(data.event, "Informe o evento da movimentação");
      let response = null;
      response = await app
        .omni("omniclub.cadsocio")
        .select(
          "habil_mens",
          "situacao",
          app.omni.raw(
            "regexp_replace(nome, '[^a-zA-Z0-9 ]+', '', 'g') as nome"
          )
        )
        .where({ matricula: data.registration, cod_dep: data.code })
        .first();
      if (!response) {
        response = await app
          .omni("omniclub.caddep")
          .select(
            "habil_mens",
            app.omni.raw(
              "regexp_replace(nome, '[^a-zA-Z0-9 ]+', '', 'g') as nome"
            )
          )
          .where({ matricula: data.registration, cod_dep: data.code })
          .first();
      }
      existsOrError(response, "Matrícula não encontrada");

      const socioNaTolerancia =
        new Date(Date.parse(response.habil_mens) + toleranciaBloqueio) >
        Date.parse(new Date());

      const socioLicenciado = ["04", "08"].includes(response.situacao);

      const dependentes = await app
        .omni("omniclub.caddep")
        .select(
          "habil_mens",
          app.omni.raw(
            "regexp_replace(nome, '[^a-zA-Z0-9 ]+', '', 'g') as nome"
          ),
          "cod_dep"
        )
        .where({ matricula: data.registration })
        .where("cod_dep", "!=", data.code);
      dependentes.forEach(dependente => {
        dependente.foto = `http://sccp14/${data.registration}${
          dependente.cod_dep
          }.jpg`;
        dependente.matricula_completa = `${data.registration}-${
          dependente.cod_dep
          }`;
        if (socioNaTolerancia || socioLicenciado) {
          dependente.valido = true;
        } else {
          dependente.valido = false;
        }
      });

      if (socioNaTolerancia || socioLicenciado) {
        const condition =
          data.event === "entrada"
            ? { "fluxos.placa": data.plate }
            : {
              "fluxos.placa": data.plate,
              "fluxos.finalizado": false,
              "fluxos.evento": "entrada"
            };
        const isUpToDate = await app
          .estacionamento("fluxos")
          .select(
            "fluxos.created_at as came_in",
            "fluxos.tipo",
            "fluxos.pagoNaEntrada",
            "fluxos.porte",
            "fluxos.id as identry"
          )
          .leftJoin("fluxos as a", "a.parente", "fluxos.id")
          .where(condition)
          .where({ "fluxos.cancelado": false })
          .whereNull("a.parente")
          .first();
        const newResponse = { ...response, ...isUpToDate, dependentes };
        return res.json(newResponse);
      } else {
        if (data.event === 'saída') {
          const condition = {
            "fluxos.placa": data.plate,
            "fluxos.finalizado": false,
            "fluxos.evento": "entrada"
          }
          const isUpToDate = await app
            .estacionamento("fluxos")
            .select(
              "fluxos.created_at as came_in",
              "fluxos.tipo",
              "fluxos.pagoNaEntrada",
              "fluxos.porte",
              "fluxos.id as identry"
            )
            .leftJoin("fluxos as a", "a.parente", "fluxos.id")
            .where(condition)
            .where({ "fluxos.cancelado": false })
            .whereNull("a.parente")
            .first();

          const newResponse = { ...response, ...isUpToDate, dependentes };
          return res.json(newResponse);
        } else {
          return res
            .status(400)
            .send(
              "Esta matrícula está inadimplente. Para resolver este problema, o sócio deve comparecer na secretaria"
            );
        }
      }
    } catch (error) {
      return res.status(400).send(error);
    }
  };

  const verifyMultipleRegistrations = async (req, res) => {
    const data = req.params.reg;
    try {
      existsOrError(data, "Informe a matrícula do sócio");
      const registration = data.substring(0, 6);
      const code = data.substring(7, 9);
      response = await app
        .omni("omniclub.cadsocio")
        .select(
          "habil_mens",
          app.omni.raw(
            "regexp_replace(nome, '[^a-zA-Z0-9 ]+', '', 'g') as nome"
          )
        )
        .where({ matricula: registration, cod_dep: code })
        .first();
      if (!response) {
        response = await app
          .omni("omniclub.caddep")
          .select(
            "habil_mens",
            app.omni.raw(
              "regexp_replace(nome, '[^a-zA-Z0-9 ]+', '', 'g') as nome"
            )
          )
          .where({ matricula: registration, cod_dep: code })
          .first();
      }
      // existsOrError(response, 'Matrícula não encontrada.')
      if (socioNaTolerancia || socioLicenciado) {
        return res.json({
          ...response,
          profilePicture: `http://sccp14/${registration + code}.jpg`
        });
      } else {
        return res.json({
          registration: data,
          message:
            "A matrícula " +
            data +
            " está inadimplente. Para resolver este problema, o sócio deverá comparecer na secretaria"
        });
        // return res.status(400).send('Esta matrícula está inadimplente. Para resolver este problema, o sócio deverá comparecer na secretaria.')
      }
    } catch (error) {
      return res.json({
        registration: data,
        message: "Matrícula " + data + " não encontrada"
      });
      // return res.status(400).send(error)
    }
  };

  return {
    verifyRegistration,
    getRegistrationByPlate,
    verifyMultipleRegistrations,
    getOmniData
  };
};
