module.exports = app => {
  const { existsOrError, notExistsOrError } = app.api.validation;

  const insideTheClub = async (req, res) => {
    await app.estacionamento
      .raw(
        `
        SELECT
          e.*
        FROM fluxos AS e
          LEFT JOIN fluxos AS s ON s.parente = e.id
        WHERE s.parente IS NULL
          AND e.evento = "entrada"
          AND e.finalizado = 0
          AND e.cancelado = 0
      `
      )
      .then(vehicles => res.json(vehicles[0]));
  };

  const save = async (req, res) => {
    const vehicle = { ...req.body };
    if (req.params.id) vehicle.id = req.params.id;
    try {
      existsOrError(vehicle.placa, "Informe a placa do veículo");
      existsOrError(vehicle.nome, "Informe o nome do motorista");
      existsOrError(vehicle.tipo, "Informe o tipo do motorista");
      existsOrError(vehicle.modelo, "Informe o modelo do veículo");
      existsOrError(vehicle.cor, "Informe a cor do veículo");
      existsOrError(vehicle.operador, "Informe o operador atual");
      const vehicleFromDb = await app
        .estacionamento("veiculos")
        .where({ placa: vehicle.placa })
        .first();
      if (vehicleFromDb && !vehicle.id) {
        notExistsOrError(vehicleFromDb, "Este veículo já está cadastrado");
      }
    } catch (error) {
      return res.status(400).send(error);
    }
    if (vehicle.id) {
      await app
        .estacionamento("veiculos")
        .update({
          nome: vehicle.nome,
          tipo: vehicle.tipo,
          placa: vehicle.placa,
          modelo: vehicle.modelo,
          cor: vehicle.cor,
          autorizante: vehicle.autorizante,
          operador: vehicle.operador,
          updated_at: new Date("YYYY-MM-DD HH:mm:ss")
        })
        .where({ id: vehicle.id })
        .then(() => res.status(204).send())
        .catch(error => res.status(500).send(error));
    } else {
      await app
        .estacionamento("veiculos")
        .insert(vehicle)
        .then(() => res.status(204).send())
        .catch(error => res.status(500).send(error));
    }
  };

  const get = async (req, res) => {
    await app
      .estacionamento("veiculos")
      .select("*")
      .then(vehicles => res.json(vehicles))
      .catch(error => res.status(500).send(error));
  };

  const getByPlateToEdit = async (req, res) => {
    try {
      existsOrError(req.params.plate, "Informe a placa");
    } catch (error) {
      return res.status(400).send(error);
    }
    await app
      .estacionamento("veiculos")
      .where({ placa: req.params.plate })
      .first()
      .then(vehicle => res.json(vehicle))
      .catch(error => res.status(500).send(error));
  };

  const getByPlate = async (req, res) => {
    try {
      if (req.body.evento === "entrada") {
        await app
          .estacionamento("veiculos")
          .select("pessoas.nome", "pessoas.tipo", "veiculos.*")
          .leftJoin("pessoas", "pessoas.id", "veiculos.pessoa")
          .where({ placa: req.params.plate })
          .first()
          .then(vehicle => res.json(vehicle))
          .catch(error => res.status(500).send(error));
      } else {
        await app
          .estacionamento("veiculos")
          .select(
            "veiculos.*",
            "pessoas.nome",
            "pessoas.tipo",
            "fluxos.created_at as came_in",
            "fluxos.id as identry"
          )
          .leftJoin("pessoas", "pessoas.id", "veiculos.pessoa")
          .leftJoin("fluxos", "fluxos.veiculo", "veiculos.id")
          .leftJoin("fluxos as a", "a.parente", "fluxos.id")
          .where({
            "veiculos.placa": req.params.plate,
            "fluxos.finalizado": false,
            "fluxos.cancelado": false
          })
          .whereNull("fluxos.parente")
          .first()
          .then(vehicle => res.json(vehicle));
      }
    } catch (error) {
      return res.status(400).send(error);
    }
  };

  const remove = async (req, res) => {
    try {
      const rowsDeleted = await app
        .estacionamento("veiculos")
        .where({ id: req.params.id });
      existsOrError(rowsDeleted, "Veículo não encontrado");
      await app
        .estacionamento("veiculos")
        .where({ id: req.params.id })
        .del()
        .then(() => res.status(204).send());
    } catch (e) {
      res.status(400).send(e);
    }
  };

  return { save, get, getByPlate, remove, insideTheClub, getByPlateToEdit };
};
