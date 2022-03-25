const { db } = require("./.env");

module.exports = {
  estacionamentoConfig: {
    client: "mysql",
    connection: db.estacionamento,
  },
  omniConfig: {
    client: "pg",
    version: "9.4.4",
    connection: db.omni,
  }
};

// module.exports = {
//   client: "mysql",
//   connection: db.estacionamento,
// };