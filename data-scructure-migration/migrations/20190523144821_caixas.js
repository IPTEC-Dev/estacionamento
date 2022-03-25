exports.up = function(knex, Promise) {
  return knex.schema
    .createTable("caixas", table => {
      table.increments("id").primary();
      table.string("operadorInicial").notNull();
      table.string("operadorFinal");
      table
        .integer("saldoInicial")
        .notNull()
        .defaultTo(0);
      table.integer("saldoFinalBruto");
      table.integer("saldoFinalReal");
      table.integer("montanteRetirado");
      table
        .boolean("estado")
        .notNull()
        .defaultTo(false);
      table.timestamps(true, true);
    })
    .then(() => {
      return knex("caixas").insert({
        operadorInicial: "Administrador",
        saldoInicial: 300
      });
    });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("caixas");
};
