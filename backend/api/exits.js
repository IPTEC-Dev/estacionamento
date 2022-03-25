module.exports = app => {
  const { existsOrError, notExistsOrError, equalsOrError } = app.api.validation;

  const save = async (req, res) => {
    const exit = { ...req.body };
    try {
      existsOrError(exit.identry, "Este veículo não está dentro do clube");
    } catch (error) {
      return res.status(400).send(error);
    }
    app
      .estacionamento("fluxos")
      .insert(exit)
      .then(_ => res.status(204).send())
      .catch(err => res.status(500).send(err));
  };

  const getLastEntry = (req, res) => {
    const plate = { ...req.params };
    try {
      existsOrError(
        plate.plate,
        "Informe a placa para retornar a última entrada."
      );
    } catch (msg) {
      return res.status(400).send(msg);
    }
    app.estacionamento
      .raw(
        `
                select
                    identry,
                    e.created_at
                from entries as e
                    left join plates as p on p.idplate = e.idplate
                    where e.created_at = (
                        select
                            max(created_at)
                        from entries
                    ) and p.plate = "${plate.plate}"`
      )
      .then(response => res.json(response))
      .catch(err => res.status(500).send(err));
  };

  const cancelExit = (req, res) => {
    const data = { ...req.body };
    try {
      existsOrError(data.plate, "Informe a placa do veículo.");
      existsOrError(data.name, "Informe o nome do motorista.");
      existsOrError(data.iduser, "Informe o ID do operador atual.");
      existsOrError(data.nameoperator, "Informe o nome do operador atual.");
    } catch (error) {
      return res.status(400).send(error);
    }
    app
      .estacionamento("logs")
      .insert({
        iduser: data.iduser,
        description: `Operador ${
          data.nameoperator
        } cancelou a saída do veículo de ${data.name} de placa ${data.plate}.`
      })
      .then(() => res.status(204).send())
      .catch(err => res.status(500).send(err));
  };

  return { save, getLastEntry, cancelExit };
};
