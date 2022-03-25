exports.up = function(knex, Promise) {
  return knex.schema.createTable("fluxos", table => {
    table.increments("id").primary();
    table.integer("parente").unsigned();
    table
      .foreign("parente")
      .references("fluxos.id")
      .onDelete("CASCADE");
    table.integer("veiculo").unsigned();
    table
      .foreign("veiculo")
      .references("veiculos.id")
      .onDelete("CASCADE");
    table.string("matricula");
    table.string("placa");
    table.string("nome");
    table.integer("caixa").unsigned();
    table
      .foreign("caixa")
      .references("caixas.id")
      .onDelete("CASCADE");
    table
      .boolean("pagoNaEntrada")
      .notNull()
      .defaultTo(false);
    table.string("movimentacao").notNull();
    table.string("pagamento");
    table.string("evento").notNull();
    table.string("tipo").notNull();
    table.string("porte");
    table.string("motivoRetirada");
    table
      .float("valor")
      .notNull()
      .defaultTo(0);
    table.string("operador").notNull();
    table
      .boolean("finalizado")
      .notNull()
      .defaultTo(false);
    table
      .boolean("cancelado")
      .notNull()
      .defaultTo(false);
    table.timestamps(true, true);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("fluxos");
};
