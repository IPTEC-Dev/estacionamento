exports.up = function(knex, Promise) {
  return knex.schema.createTable("veiculos", table => {
    table.increments("id").primary();
    table.string("placa").notNull();
    table.integer("pessoa").unsigned();
    table
      .foreign("pessoa")
      .references("pessoas.id")
      .onDelete("CASCADE");
    table.string("modelo").notNull();
    table.string("cor").notNull();
    table.string("operador").notNull();
    table.timestamps(true, true);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("veiculos");
};
