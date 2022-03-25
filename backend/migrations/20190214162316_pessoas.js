exports.up = function(knex, Promise) {
  return knex.schema.createTable("pessoas", table => {
    table.increments("id").primary();
    table.string("nome").notNull();
    table.string("matricula");
    table.string("tipo").notNull();
    table.string("autorizante");
    table.string("operador").notNull();
    table.timestamps(true, true);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("pessoas");
};
