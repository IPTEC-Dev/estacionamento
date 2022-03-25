const gestao = require("./permissions/gestao");
const operacional = require("./permissions/operacional");
const seguranca = require("./permissions/seguranca");

module.exports = app => {
  app.post("/backend/signin", app.api.auth.signin);
  app.post("/backend/validateToken", app.api.auth.validateToken);

  app
    .route("/backend/vehicles")
    .all(app.config.passport.authenticate())
    .post(gestao(app.api.vehicles.save))
    .get(gestao(app.api.vehicles.get));

  app
    .route("/backend/vehicles/insideTheClub")
    .all(app.config.passport.authenticate())
    .get(operacional(app.api.vehicles.insideTheClub));

  app
    .route("/backend/vehicles/:plate")
    .all(app.config.passport.authenticate())
    .post(operacional(app.api.vehicles.getByPlate))
    .get(operacional(app.api.vehicles.getByPlateToEdit));

  app
    .route("/backend/vehicles/edit/:id")
    .all(app.config.passport.authenticate())
    .post(gestao(app.api.vehicles.save))
    .delete(gestao(app.api.vehicles.remove));

  app
    .route("/backend/entries")
    .all(app.config.passport.authenticate())
    .post(operacional(app.api.fluxos.entry));

  app
    .route("/backend/exits")
    .all(app.config.passport.authenticate())
    .post(operacional(app.api.fluxos.exit));

  app
    .route("/backend/exits/:plate")
    .all(app.config.passport.authenticate())
    .get(gestao(app.api.exits.getLastEntry));

  app
    .route("/backend/omni")
    .all(app.config.passport.authenticate())
    .post(operacional(app.api.omni.verifyRegistration));

  app
    .route("/backend/omni/matricula")
    .all(app.config.passport.authenticate())
    .post(app.api.omni.getOmniData);

  app
    .route("/backend/omni/multiple/:reg")
    .all(app.config.passport.authenticate())
    .get(operacional(app.api.omni.verifyMultipleRegistrations));

  app
    .route("/backend/locked/unlock")
    .all(app.config.passport.authenticate())
    .post(gestao(app.api.locked.unlock));

  app
    .route("/backend/locked/:data")
    .all(app.config.passport.authenticate())
    .get(gestao(app.api.locked.get))
    .delete(gestao(app.api.locked.remove));

  app
    .route("/backend/locked")
    .all(app.config.passport.authenticate())
    .post(gestao(app.api.locked.save));

  app
    .route("/backend/configuracoes")
    .all(app.config.passport.authenticate())
    .get(operacional(app.api.prices.get))
    .post(gestao(app.api.prices.save));

  app
    .route("/backend/reports/:date1/:date2")
    .all(app.config.passport.authenticate())
    .get(gestao(app.api.reports.get));

  app
    .route("/backend/getRegistrationByPlate/:plate")
    .all(app.config.passport.authenticate())
    .get(operacional(app.api.omni.getRegistrationByPlate));

  app
    .route("/backend/cash")
    .all(app.config.passport.authenticate())
    .get(operacional(app.api.caixa.get));

  app
    .route("/backend/cash/all")
    .all(app.config.passport.authenticate())
    .get(operacional(app.api.caixa.getAll));

  app
    .route("/backend/cash/open")
    .all(app.config.passport.authenticate())
    .post(operacional(app.api.caixa.init));

  app
    .route("/backend/cash/close")
    .all(app.config.passport.authenticate())
    .post(gestao(app.api.caixa.close));

  app
    .route("/backend/cash/withdraw")
    .all(app.config.passport.authenticate())
    .post(gestao(app.api.caixa.withdraw));

  app
    .route("/backend/cash/:id")
    .all(app.config.passport.authenticate())
    .get(gestao(app.api.caixa.getById));

  app
    .route("/backend/ocorrencias")
    .all(app.config.passport.authenticate())
    .get(gestao(app.api.ocorrencias.get))
    .post(app.api.ocorrencias.save);

  app
    .route("/backend/ultimoFluxo/:matricula")
    .all(app.config.passport.authenticate())
    .get(operacional(app.api.fluxos.ultimoFluxo));

  app
    .route("/backend/calcularPrecos")
    .all(app.config.passport.authenticate())
    .post(operacional(app.api.fluxos.calcularPrecos));

  app
    .route("/backend/fluxos/editar")
    .all(app.config.passport.authenticate())
    .post(gestao(app.api.fluxos.editar));

  app
    .route("/backend/saidaRetroativa")
    .all(app.config.passport.authenticate())
    .post(seguranca(app.api.fluxos.saidaRetroativa));

  app
    .route("/backend/pessoas")
    .all(app.config.passport.authenticate())
    .post(gestao(app.api.pessoas.save))
    .get(operacional(app.api.pessoas.get));

  app
    .route("/backend/pessoas/matricula/:matricula")
    .all(app.config.passport.authenticate())
    .get(operacional(app.api.pessoas.getByRegistration));

  app
    .route("/backend/pessoas/:id")
    .all(app.config.passport.authenticate())
    .post(gestao(app.api.pessoas.update))
    .delete(gestao(app.api.pessoas.remove))
    .get(gestao(app.api.pessoas.get));

  app
    .route("/backend/veiculos")
    .all(app.config.passport.authenticate())
    .post(gestao(app.api.veiculos.save))
    .get(operacional(app.api.veiculos.get));

  app
    .route("/backend/veiculos/:id")
    .all(app.config.passport.authenticate())
    .post(gestao(app.api.veiculos.update))
    .delete(gestao(app.api.veiculos.remove))
    .get(gestao(app.api.veiculos.get));
};
