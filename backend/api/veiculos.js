module.exports = app => {
  const { existsOrError, notExistsOrError } = app.api.validation;

  const get = async (req, res) => {
    if (req.params.id) {
      await app
        .estacionamento("veiculos")
        .where({ id: req.params.id })
        .first()
        .then(vehicle => {
          res.json(vehicle);
        })
        .catch(error => res.status(500).send(error));
    } else {
      await app
        .estacionamento("veiculos")
        .select(
          "veiculos.*",
          "pessoas.nome",
          "pessoas.matricula",
          "pessoas.tipo",
          "pessoas.autorizante"
        )
        .leftJoin("pessoas", "pessoas.id", "veiculos.pessoa")
        .then(vehicles => {
          res.json(vehicles);
        })
        .catch(error => res.status(500).send(error));
    }
  };

  const save = async (req, res) => {
    const vehicle = { ...req.body };
    try {
      existsOrError(vehicle.placa, "Informe a placa do veículo");
      existsOrError(
        vehicle.pessoa,
        "Informe a pessoa responsável pelo veículo"
      );
      existsOrError(vehicle.modelo, "Informe o modelo do veículo");
      existsOrError(vehicle.cor, "Informe a cor do veículo");
      existsOrError(vehicle.operador, "Informe o operador atual");

      const personFromDb = await app
        .estacionamento("pessoas")
        .where({ id: vehicle.pessoa })
        .first();

      existsOrError(
        personFromDb,
        "A pessoa responsável pelo veículo não está cadastrada no sistema"
      );

      const vehicleFromDb = await app
        .estacionamento("veiculos")
        .where({ placa: vehicle.placa })
        .first();

      if (vehicleFromDb) {
        notExistsOrError(
          vehicleFromDb,
          "Esta placa já está cadastrada no sistema"
        );
      }
    } catch (error) {
      return res.status(400).send(error);
    }

    await app
      .estacionamento("veiculos")
      .insert(vehicle)
      .then(() => res.status(204).send())
      .catch(error => res.status(500).send(error));
  };

  const update = async (req, res) => {
    const vehicle = { ...req.body };
    try {
      existsOrError(vehicle.placa, "Informe a placa do veículo");
      existsOrError(
        vehicle.pessoa,
        "Informe a pessoa responsável pelo veículo"
      );
      existsOrError(vehicle.modelo, "Informe o modelo do veículo");
      existsOrError(vehicle.cor, "Informe a cor do veículo");
      existsOrError(vehicle.operador, "Informe o operador atual");

      const vehicleFromDb = await app
        .estacionamento("veiculos")
        .where({ id: req.params.id })
        .first();
      existsOrError(
        vehicleFromDb,
        "Este veículo não está cadastrado no sistema"
      );

      const personFromDb = await app
        .estacionamento("pessoas")
        .where({ id: vehicle.pessoa })
        .first();
      existsOrError(
        personFromDb,
        "A pessoa responsável pelo veículo não está cadastrada no sistema"
      );

      vehicle.updated_at = new Date("YYYY-MM-dd HH:mm:ss");
    } catch (error) {
      return res.status(400).send(error);
    }

    await app
      .estacionamento("veiculos")
      .update(vehicle)
      .where({ id: req.params.id })
      .then(() => res.status(204).send())
      .catch(error => res.status(500).send(error));
  };

  const remove = async (req, res) => {
    try {
      const vehicleFromDb = await app
        .estacionamento("veiculos")
        .where({ id: req.params.id })
        .first();

      existsOrError(
        vehicleFromDb,
        "Este veículo não está cadastrado no sistema"
      );
    } catch (error) {
      res.status(400).send(error);
    }

    await app
      .estacionamento("veiculos")
      .del()
      .where({ id: req.params.id })
      .then(() => res.status(204).send())
      .catch(error => res.status(500).send(error));
  };

  return { get, save, update, remove };
};
