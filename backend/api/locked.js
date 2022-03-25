module.exports = app => {
  const { existsOrError, notExistsOrError } = app.api.validation;

  const get = async (req, res) => {
    const option = req.params.data;
    try {
      existsOrError(
        req.params.data,
        "Informe a opção que deseja consultar nos veículos bloqueados"
      );
    } catch (error) {
      return res.status(400).send(error);
    }
    switch (option) {
      case "plates":
        await app
          .estacionamento("bloqueios")
          .where({ matricula: null })
          .then(plates => res.json(plates))
          .catch(error => res.status(500).send(error));
        break;
      case "registrations":
        await app
          .estacionamento("bloqueios")
          .where({ placa: null })
          .then(registrations => res.json(registrations))
          .catch(error => res.status(500).send(error));
        break;
    }
  };

  const remove = async (req, res) => {
    const id = req.params.data;
    try {
      existsOrError(id, "Informe o ID do bloqueio");
      const rowsDeleted = await app.estacionamento("bloqueios").where({ id });
      existsOrError(rowsDeleted, "Este item não está bloqueado");
      await app
        .estacionamento("bloqueios")
        .where({ id })
        .del()
        .then(() => res.status(204).send());
    } catch (error) {
      return res.status(400).send(error);
    }
  };

  const save = async (req, res) => {
    const data = req.body;
    try {
      existsOrError(data.type, "Informe o tipo do item que será bloqueado");
      existsOrError(data.value, "Informe o valor do item que será bloqueado");
      existsOrError(data.reason, "Informe o motivo pelo bloqueio");
      existsOrError(data.operator, "Informe o operador atual");
      const alreadyLocked = await app
        .estacionamento("bloqueios")
        .where(
          data.type === "plate"
            ? { placa: data.value }
            : { matricula: data.value }
        )
        .first();
      notExistsOrError(alreadyLocked, "Este item já está bloqueado");
      const obj =
        data.type === "plate"
          ? { placa: data.value, motivo: data.reason, operador: data.operator }
          : {
              matricula: data.value,
              motivo: data.reason,
              operador: data.operator
            };
      await app
        .estacionamento("bloqueios")
        .insert(obj)
        .then(() => res.status(204).send());
    } catch (error) {
      return res.status(400).send(error);
    }
  };

  const unlock = async (req, res) => {
    const data = req.body;
    try {
      existsOrError(data.operador, "Informe o nome do operador atual");
      existsOrError(data.type, "Informe o tipo de bloqueio");
      existsOrError(data.value, "Informe o valor do bloqueio");
      const rowsDeleted = await app
        .estacionamento("bloqueios")
        .where(
          data.type === "Placa"
            ? { placa: data.value }
            : { matricula: data.value }
        )
        .first();
      existsOrError(rowsDeleted, "Este item não está bloqueado");
      await app
        .estacionamento("bloqueios")
        .where(
          data.type === "Placa"
            ? { placa: data.value }
            : { matricula: data.value }
        )
        .del()
        .then(() => res.status(204).send());
    } catch (error) {
      return res.status(400).send(error);
    }
  };

  return { get, remove, save, unlock };
};
