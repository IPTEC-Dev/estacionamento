exports.up = function(knex, Promise) {
  return knex.schema.createTable("bloqueios", table => {
    table.increments("id").primary();
    table.string("placa");
    table.string("matricula");
    table.string("motivo").notNull();
    table.string("operador").notNull();
    table.timestamps(true, true);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("bloqueios");
};
