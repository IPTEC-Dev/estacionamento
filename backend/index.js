const app = require("express")();
const consign = require("consign");
const db = require("./config/db");

app.estacionamento = db["estacionamento"];
app.omni = db["omni"];

consign()
  .include("./config/passport.js")
  .then("./config/middlewares.js")
  .then("./api/validation.js")
  .then("./api")
  .then("./config/routes.js")
  .into(app);

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000!");
  console.log("Estacionamento is running...");
});
