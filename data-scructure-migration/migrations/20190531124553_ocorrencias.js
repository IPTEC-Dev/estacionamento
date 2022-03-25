exports.up = function (knex, Promise) {
  return knex.schema.createTable("ocorrencias", table => {
    table.increments("id").primary();
    table.string("matricula").notNull();
    table.string("descricao", 1000).notNull();
    table.string("operador").notNull();
    table.timestamps(true, true);
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable("ocorrencias");
};
