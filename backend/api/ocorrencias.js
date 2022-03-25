module.exports = app => {
  const { existsOrError } = app.api.validation;
  const mailer = require("nodemailer");
  const { mail } = require("../.env");

  const get = async (req, res) => {
    await app
      .estacionamento("ocorrencias")
      .orderBy("created_at", "desc")
      .then(ocorrencias => res.json(ocorrencias))
      .catch(err => res.status(500).send(err));
  };

  const save = async (req, res) => {
    const ocorrencia = { ...req.body };
    try {
      existsOrError(ocorrencia.matricula, "Informe a matrícula do sócio");
      existsOrError(ocorrencia.descricao, "Informe a descrição da ocorrência");
      existsOrError(ocorrencia.operador, "Informe o operador atual");
    } catch (error) {
      return res.status(400).send(error);
    }

    let transporter = mailer.createTransport({
      host: mail.host,
      port: mail.port,
      secure: mail.secure
    });

    await transporter.sendMail({
      from: `Estacionamento SCCP`,
      to: mail.to,
      subject: "Nova ocorrência registrada no estacionamento",
      text: `Esta é uma mensagem automática do sistema do estacionamento. Por favor, não a responda.\n\nO operador ${
        ocorrencia.operador
      } registrou uma nova ocorrência no estacionamento com a matrícula ${
        ocorrencia.matricula
      }. \n\n A descrição da ocorrência é: \n"${
        ocorrencia.descricao
      }". \n\nAtenciosamente,\nEstacionamento.`
    });

    await app
      .estacionamento("ocorrencias")
      .insert(ocorrencia)
      .then(() => res.status(204).send())
      .catch(err => res.status(500).send(err));
  };

  return { get, save };
};
