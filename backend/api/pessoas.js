module.exports = app => {
  const { existsOrError, notExistsOrError } = app.api.validation;

  const get = async (req, res) => {
    if (req.params.id) {
      await app
        .estacionamento("pessoas")
        .where({ id: req.params.id })
        .first()
        .then(person => res.json(person))
        .catch(error => res.status(500).send(error));
    } else {
      await app
        .estacionamento("pessoas")
        .then(people => res.json(people))
        .catch(error => res.status(500).send(error));
    }
  };

  const save = async (req, res) => {
    const person = { ...req.body };
    try {
      existsOrError(person.nome, "Informe o nome");
      // existsOrError(person.matricula, "Informe a matrícula");
      existsOrError(person.tipo, "Informe o tipo");
      existsOrError(person.operador, "Informe o operador atual");

      if (person.tipo === "Credenciado") {
        existsOrError(person.autorizante, "Informe o autorizante");
      }

      if (person.matricula) {
        const personFromDb = await app
          .estacionamento("pessoas")
          .where({ matricula: person.matricula })
          .first();

        if (personFromDb) {
          notExistsOrError(
            personFromDb,
            `Esta matrícula já está cadastrada no nome de ${personFromDb.nome}`
          );
        }
      }
    } catch (error) {
      return res.status(400).send(error);
    }

    await app
      .estacionamento("pessoas")
      .insert(person)
      .then(() => res.status(204).send())
      .catch(error => res.status(500).send(error));
  };

  const update = async (req, res) => {
    const person = { ...req.body };
    try {
      existsOrError(person.nome, "Informe o nome");
      // existsOrError(person.matricula, "Informe a matrícula");
      existsOrError(person.tipo, "Informe o tipo");
      existsOrError(person.operador, "Informe o operador atual");

      if (person.tipo === "Credenciado") {
        existsOrError(person.autorizante, "Informe o autorizante");
      }

      const personFromDb = await app
        .estacionamento("pessoas")
        .where({ id: req.params.id })
        .first();

      existsOrError(personFromDb, "Esta pessoa não está cadastrada no sistema");

      if (
        personFromDb.tipo === "Credenciado" &&
        person.tipo !== personFromDb.tipo
      )
        delete person.autorizante;

      delete person.created_at;
      person.updated_at = new Date("YYYY-MM-dd HH:mm:ss");
    } catch (error) {
      return res.status(400).send(error);
    }

    await app
      .estacionamento("pessoas")
      .update(person)
      .where({ id: req.params.id })
      .then(() => res.status(204).send())
      .catch(error => res.status(500).send(error));
  };

  const remove = async (req, res) => {
    try {
      const personFromDb = await app
        .estacionamento("pessoas")
        .where({ id: req.params.id })
        .first();

      existsOrError(personFromDb, "Esta pessoa não está cadastrada no sistema");
    } catch (error) {
      res.status(400).send(error);
    }

    await app
      .estacionamento("pessoas")
      .del()
      .where({ id: req.params.id })
      .then(() => res.status(204).send())
      .catch(error => res.status(500).send(error));
  };

  const getByRegistration = async (req, res) => {
    try {
      existsOrError(req.params.matricula, "Informe a matrícula da pessoa");

      const person = await app
        .estacionamento("pessoas")
        .where({ matricula: req.params.matricula })
        .first();

      existsOrError(person, "Esta matrícula não está cadastrada no sistema");

      const vehicles = await app
        .estacionamento("veiculos")
        .where({ pessoa: person.id });

      existsOrError(vehicles[0], "Esta pessoa não tem um veículo em seu nome");

      const response = {
        pessoa: person,
        veiculos: vehicles
      };

      return res.json(response);
    } catch (error) {
      res.status(500).send(error);
    }
  };

  return { get, save, update, remove, getByRegistration };
};
