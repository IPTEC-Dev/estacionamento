exports.up = function(knex, Promise) {
  return knex.schema
    .createTable("configuracoes", table => {
      table.increments("id").primary();
      table
        .float("zeroAQuatro")
        .notNull()
        .defaultTo(8);
      table
        .float("quatroAOito")
        .notNull()
        .defaultTo(12);
      table
        .float("oitoADoze")
        .notNull()
        .defaultTo(16);
      table
        .float("acimaDeDoze")
        .notNull()
        .defaultTo(25);
      table
        .float("motocicleta")
        .notNull()
        .defaultTo(5);
      table
        .float("proximoDia")
        .notNull()
        .defaultTo(5);
      table
        .integer("horarioLimite")
        .notNull()
        .defaultTo(20);
      table
        .float("aposHorarioLimite")
        .notNull()
        .defaultTo(8);
      table
        .float("valorInicialCaixa")
        .notNull()
        .defaultTo(300);
      table
        .float("tolerancia")
        .notNull()
        .defaultTo(0.25);
      table
        .integer("validadeSelo")
        .notNull()
        .defaultTo(30);
      table
        .float("precoSelo")
        .notNull()
        .defaultTo(6);
      table.string("operador").notNull();
      table.timestamps(true, true);
    })
    .then(() => {
      return knex("configuracoes").insert({
        zeroAQuatro: 5,
        quatroAOito: 10,
        oitoADoze: 15,
        acimaDeDoze: 20,
        motocicleta: 5,
        proximoDia: 5,
        horarioLimite: 20,
        aposHorarioLimite: 8,
        operador: "Administrador",
        valorInicialCaixa: 300,
        tolerancia: 15,
        validadeSelo: 30,
        precoSelo: 6
      });
    });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("configuracoes");
};
