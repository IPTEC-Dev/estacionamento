module.exports = app => {
  const { existsOrError } = app.api.validation;

  const get = async (req, res) => {
    const date1 = req.params.date1;
    const date2 = req.params.date2;
    try {
      existsOrError(date1, "Informe a data inicial para realizar o relatório");
      existsOrError(date2, "Informe a data final para realizar o relatório");

      // Movimentação de pessoas


      const queries = [
        {
          type: "Sócio",
          local: undefined,
          evento: "entrada",
        },
        {
          type: "Sócio",
          local: "P1",
          evento: "entrada",
        },
        {
          type: "Sócio",
          local: "P3",
          evento: "entrada",
        },
        {
          type: "Sócio",
          local: "Tamboréu",
          evento: "entrada",
        },
        // Add other queries as needed
      ];

      // Execute queries concurrently using Promise.all
      const results = await Promise.all(
        queries.map(async (query) => {
          const result = await db
            .estacionamento("fluxos")
            .where({
              "fluxos.tipo": query.type,
              "fluxos.evento": query.evento,
              "fluxos.cancelado": false,
              "local": query.local,
            })
            .where("fluxos.created_at", ">=", date1 + " 00:00:00")
            .where("fluxos.created_at", "<=", date2 + " 23:59:59");
          return result;
        })
      );

      // Destructure the results array to get individual query results
      const [
        movimentacaoPessoasSociosTotal,
        movimentacaoPessoasSociosP1,
        movimentacaoPessoasSociosP3,
        movimentacaoPessoasSociosTamboreu,
        // Add other variables as needed
      ] = results;





      const movimentacaoPessoas = {
        socios: {
          total: movimentacaoPessoasSociosTotal.length || 0,
          p1: movimentacaoPessoasSociosP1.length || 0,
          p3: movimentacaoPessoasSociosP3.length || 0,
          tamboreu: movimentacaoPessoasSociosTamboreu.length || 0
        },
      }
      // };
      const report = {
        movimentacaoPessoas,
        // movimentacaoVeiculos,
        // arrecadacao,
        // caixas
      };
      return res.json(report);
    } catch (error) {
      return res.status(400).send(error);
    }
  };

  return { get };
};
