const { app, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js")
    },
    icon: path.join(__dirname, "estacionamento.ico")
  });

  mainWindow.loadURL("https://estacionamento.sccorinthians.com.br");

  mainWindow.on("closed", function () {
    mainWindow = null;
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  if (mainWindow === null) {
    createWindow();
  }
});

function formatDate(value) {
  if (value) {
    var d = new Date(value);

    // Diminuir uma hora
    d.setHours(d.getHours() - 1);

    // Função para adicionar zero à esquerda
    function padLeft(value, length = 2) {
      return String(value).padStart(length, '0');
    }

    var dformat =
      [
        padLeft(d.getDate()),
        padLeft(d.getMonth() + 1),
        d.getFullYear()
      ].join("/") +
      " AS " +
      [
        padLeft(d.getHours()),
        padLeft(d.getMinutes()),
        padLeft(d.getSeconds())
      ].join(":");
    return dformat;
  }
}


function formatPrice(value) {
  return "R$ " + value.toFixed(2).replace(".", ",");
}

app.printUsingElectron = function (data, modulo) {
  let text = "";
  text += " \n";
  text += "=-=-=-=-=-=-=-=- ESTACIONAMENTO -=-=-=-=-=-=-=-=\n";
  if (data.date1) {
    text += `\nPERIODO: DE ${data.date1} ATE ${data.date2}\n`;
  }
  text += "\n";

  switch (data.evento) {
    case "Entrada":
      text += `SEJA BEM-VINDO(A), ${data.nome}!\n`;
      text += " \n";
      text += `MATRICULA: ${data.matricula}\n`;
      text +=
        `EVENTO: ENTRADA EM ` +
        formatDate(data.created_at || new Date()) +
        "\n";
      text += `PLACA DO VEICULO: ${data.placa}\n\n`;
      if (data.price) {
        if (
          data.formaPagamento === "Selo Físico" ||
          data.formaPagamento === "Selo Digital"
        ) {
          text += `SELOS UTILIZADOS: ${data.price}\n`;
          if (data.saldoRestante) {
            text += `SALDO DE SELOS RESTANTE: ${data.saldoRestante.saldo}\n`;
            text += `   SELOS DE CARRO: ${data.saldoRestante.normalCarro}\n`;
            text += `   SELOS DE MOTOCICLETA: ${data.saldoRestante.normalMoto}\n`
            text += `   SELOS DE CORTESIA: ${data.saldoRestante.cortesia}\n`;
          }
        } else {
          text += `VALOR PAGO: ${formatPrice(data.price)}\n`;
        }
        text += `PAGTO: ${data.formaPagamento}\n`;
      }
      text += " \n";
      text += "--------------- TABELA DA PRECOS ---------------\n";
      text += "ATE 15 MIN: R$ 0,00\n";
      text += `DE 15 MIN A 4 HORAS: ${formatPrice(data.precos.zeroAQuatro)}\n`;
      text += `DE 4 A 8 HORAS: ${formatPrice(data.precos.quatroAOito)}\n`;
      text += `DE 8 A 12 HORAS: ${formatPrice(data.precos.oitoADoze)}\n`;
      text += `ACIMA DE 12 HORAS: ${formatPrice(data.precos.acimaDeDoze)}\n`;
      text += `PROXIMO DIA: ${formatPrice(data.precos.proximoDia)}\n`;
      text += `MOTOCICLETA: ${formatPrice(data.precos.motocicleta)}\n`;
      text += `APOS AS ${data.precos.horarioLimite} HORAS: ${formatPrice(
        data.precos.aposHorarioLimite
      )}\n\n`;
      break;
    case "Saída":
      text += `ATE A PROXIMA, ${data.nome}!\n`;
      text += " \n";
      text += `MATRICULA: ${data.matricula}\n`;
      text +=
        `EVENTO: SAIDA EM ` + formatDate(data.created_at || new Date()) + "\n";
      text += `PLACA DO VEICULO: ${data.placa}\n`;
      if (data.came_in) {
        text += `HORARIO DE ENTRADA: ` + formatDate(data.came_in) + "\n\n";
      }
      if (data.price) {
        if (
          data.formaPagamento === "Selo Físico" ||
          data.formaPagamento === "Selo Digital"
        ) {
          text += `SELOS UTILIZADOS: ${data.price}\n`;
          if (data.saldoRestante) {
            text += `SALDO DE SELOS RESTANTE: ${data.saldoRestante.saldo}\n\n\n`;
            text += `   SELOS DE CARRO: ${data.saldoRestante.normalCarro}\n`;
            text += `   SELOS DE MOTOCICLETA: ${data.saldoRestante.normalMoto}`
            text += `   SELOS DE CORTESIA: ${data.saldoRestante.cortesia}\n`;
          }
        } else {
          text += `VALOR PAGO: ${formatPrice(data.price)}\n`;
        }
        text += `PAGTO: ${data.formaPagamento}\n`;
      }
      break;
    default:
      switch (modulo) {
        case "ma":
          text += "=-=-=-=-=-=- MOVIMENTACAO DE PESSOAS =-=-=-=-=-=\n";
          text += `-= TOTAL SOCIOS:           ${data.movimentacaoPessoas.socios.total}\n`;
          text += `-=    P1:                  ${data.movimentacaoPessoas.socios.p1}\n`;
          text += `-=    P3:                  ${data.movimentacaoPessoas.socios.p3}\n`;
          text += `-=    TAMBOREU:            ${data.movimentacaoPessoas.socios.tamboreu}\n`;
          text += `-= TOTAL CREDENCIADOS:     ${data.movimentacaoPessoas.credenciados.total}\n`;
          text += `-=    P1:                  ${data.movimentacaoPessoas.credenciados.p1}\n`;
          text += `-=    P3:                  ${data.movimentacaoPessoas.credenciados.p3}\n`;
          text += `-=    TAMBOREU:            ${data.movimentacaoPessoas.credenciados.tamboreu}\n`;
          text += `-= TOTAL FUNCIONARIOS:     ${data.movimentacaoPessoas.funcionarios.total}\n`;
          text += `-=    P1:                  ${data.movimentacaoPessoas.funcionarios.p1}\n`;
          text += `-=    P3:                  ${data.movimentacaoPessoas.funcionarios.p3}\n`;
          text += `-=    TAMBOREU:            ${data.movimentacaoPessoas.funcionarios.tamboreu}\n`;
          text += `-= TOTAL CONSELHEIROS:     ${data.movimentacaoPessoas.conselheiros.total}\n`;
          text += `-=    P1:                  ${data.movimentacaoPessoas.conselheiros.p1}\n`;
          text += `-=    P3:                  ${data.movimentacaoPessoas.conselheiros.p3}\n`;
          text += `-=    TAMBOREU:            ${data.movimentacaoPessoas.conselheiros.tamboreu}\n`;
          text += `-= TOTAL ATLETAS:          ${data.movimentacaoPessoas.atletas.total}\n`;
          text += `-=    P1:                  ${data.movimentacaoPessoas.atletas.p1}\n`;
          text += `-=    P3:                  ${data.movimentacaoPessoas.atletas.p3}\n`;
          text += `-=    TAMBOREU:            ${data.movimentacaoPessoas.atletas.tamboreu}\n`;
          text += "=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\n";
          text += " \n";
          text += "=-=-=-=-=-= MOVIMENTACAO DE VEICULOS =-=-=-=-=-=\n";
          text += `-= TOTAL CADASTRADOS:      ${data.movimentacaoVeiculos.cadastrados.total}\n`;
          text += `-=    P1:                  ${data.movimentacaoVeiculos.cadastrados.p1}\n`;
          text += `-=    P3:                  ${data.movimentacaoVeiculos.cadastrados.p3}\n`;
          text += `-=    TAMBOREU:            ${data.movimentacaoVeiculos.cadastrados.tamboreu}\n`;
          text += `-= TOTAL CARROS:           ${data.movimentacaoVeiculos.avulsosCarros.total}\n`;
          text += `-=    P1:                  ${data.movimentacaoVeiculos.avulsosCarros.p1}\n`;
          text += `-=    P3:                  ${data.movimentacaoVeiculos.avulsosCarros.p3}\n`;
          text += `-=    TAMBOREU:            ${data.movimentacaoVeiculos.avulsosCarros.tamboreu}\n`;
          text += `-= TOTAL MOTOCICLETAS:     ${data.movimentacaoVeiculos.avulsosMotos.total}\n`;
          text += `-=    P1:                  ${data.movimentacaoVeiculos.avulsosMotos.p1}\n`;
          text += `-=    P3:                  ${data.movimentacaoVeiculos.avulsosMotos.p3}\n`;
          text += `-=    TAMBOREU:            ${data.movimentacaoVeiculos.avulsosMotos.tamboreu}\n`;
          text += `-= TOTAL BICICLETAS:       ${data.movimentacaoVeiculos.avulsosBicicletas.total}\n`;
          text += `-=    P1:                  ${data.movimentacaoVeiculos.avulsosBicicletas.p1}\n`;
          text += `-=    P3:                  ${data.movimentacaoVeiculos.avulsosBicicletas.p3}\n`;
          text += `-=    TAMBOREU:            ${data.movimentacaoVeiculos.avulsosBicicletas.tamboreu}\n`;
          text += "=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\n";
          text += " \n";
          text += "=-=-=-=-=-=-=-=-= ARRECADACAO -=-=-=-=-=-=-=-=-=\n";
          text += `-= TOTAL DINHEIRO:         ${formatPrice(data.arrecadacao.avulsosEntrada.dinheiro.total[0]["sum(`fluxos`.`valor`)"] + data.arrecadacao.avulsosSaida.dinheiro.total[0]["sum(`fluxos`.`valor`)"])}\n`;
          text += `-=    P1:                  ${formatPrice(data.arrecadacao.avulsosEntrada.dinheiro.p1[0]["sum(`fluxos`.`valor`)"] + data.arrecadacao.avulsosSaida.dinheiro.p1[0]["sum(`fluxos`.`valor`)"])}\n`;
          text += `-=    P3:                  ${formatPrice(data.arrecadacao.avulsosEntrada.dinheiro.p3[0]["sum(`fluxos`.`valor`)"] + data.arrecadacao.avulsosSaida.dinheiro.p3[0]["sum(`fluxos`.`valor`)"])}\n`;
          text += `-=    TAMBOREU:            ${formatPrice(data.arrecadacao.avulsosEntrada.dinheiro.tamboreu[0]["sum(`fluxos`.`valor`)"] + data.arrecadacao.avulsosSaida.dinheiro.tamboreu[0]["sum(`fluxos`.`valor`)"])}\n`;
          text += `-= TOTAL CARTAO:           ${
            formatPrice(
              data.arrecadacao.avulsosEntrada.cartaoDebito.total[0]["sum(`fluxos`.`valor`)"] +
              data.arrecadacao.avulsosSaida.cartaoDebito.total[0]["sum(`fluxos`.`valor`)"] +
              data.arrecadacao.avulsosEntrada.cartaoCredito.total[0]["sum(`fluxos`.`valor`)"] +
              data.arrecadacao.avulsosSaida.cartaoCredito.total[0]["sum(`fluxos`.`valor`)"] +
              data.arrecadacao.avulsosCartao.total[0]["sum(`fluxos`.`valor`)"]
            )
            }\n`;
          text += `-=    P1:                  ${
            formatPrice(
              data.arrecadacao.avulsosEntrada.cartaoDebito.p1[0]["sum(`fluxos`.`valor`)"] +
              data.arrecadacao.avulsosSaida.cartaoDebito.p1[0]["sum(`fluxos`.`valor`)"] +
              data.arrecadacao.avulsosEntrada.cartaoCredito.p1[0]["sum(`fluxos`.`valor`)"] +
              data.arrecadacao.avulsosSaida.cartaoCredito.p1[0]["sum(`fluxos`.`valor`)"] +
              data.arrecadacao.avulsosCartao.p1[0]["sum(`fluxos`.`valor`)"]
            )
            }\n`;
          text += `-=    P3:                  ${
            formatPrice(
              data.arrecadacao.avulsosEntrada.cartaoDebito.p3[0]["sum(`fluxos`.`valor`)"] +
              data.arrecadacao.avulsosSaida.cartaoDebito.p3[0]["sum(`fluxos`.`valor`)"] +
              data.arrecadacao.avulsosEntrada.cartaoCredito.p3[0]["sum(`fluxos`.`valor`)"] +
              data.arrecadacao.avulsosSaida.cartaoCredito.p3[0]["sum(`fluxos`.`valor`)"] +
              data.arrecadacao.avulsosCartao.p3[0]["sum(`fluxos`.`valor`)"]
            )
            }\n`;
          text += `-=    TAMBOREU:            ${
            formatPrice(
              data.arrecadacao.avulsosEntrada.cartaoDebito.tamboreu[0]["sum(`fluxos`.`valor`)"] +
              data.arrecadacao.avulsosSaida.cartaoDebito.tamboreu[0]["sum(`fluxos`.`valor`)"] +
              data.arrecadacao.avulsosEntrada.cartaoCredito.tamboreu[0]["sum(`fluxos`.`valor`)"] +
              data.arrecadacao.avulsosSaida.cartaoCredito.tamboreu[0]["sum(`fluxos`.`valor`)"] +
              data.arrecadacao.avulsosCartao.tamboreu[0]["sum(`fluxos`.`valor`)"]
            )
            }\n`;
          text += `-=       TOTAL DEBITO:     ${
            formatPrice(
              data.arrecadacao.avulsosEntrada.cartaoDebito.total[0]["sum(`fluxos`.`valor`)"] +
              data.arrecadacao.avulsosSaida.cartaoDebito.total[0]["sum(`fluxos`.`valor`)"]
            )
            }\n`;
          text += `-=          P1:            ${
            formatPrice(
              data.arrecadacao.avulsosEntrada.cartaoDebito.p1[0]["sum(`fluxos`.`valor`)"] +
              data.arrecadacao.avulsosSaida.cartaoDebito.p1[0]["sum(`fluxos`.`valor`)"]
            )
            }\n`;
          text += `-=          P3:            ${
            formatPrice(
              data.arrecadacao.avulsosEntrada.cartaoDebito.p3[0]["sum(`fluxos`.`valor`)"] +
              data.arrecadacao.avulsosSaida.cartaoDebito.p3[0]["sum(`fluxos`.`valor`)"]
            )
            }\n`;
          text += `-=          TAMBOREU:      ${
            formatPrice(
              data.arrecadacao.avulsosEntrada.cartaoDebito.tamboreu[0]["sum(`fluxos`.`valor`)"] +
              data.arrecadacao.avulsosSaida.cartaoDebito.tamboreu[0]["sum(`fluxos`.`valor`)"]
            )
            }\n`;
          text += `-=       TOTAL CREDITO:    ${
            formatPrice(data.arrecadacao.avulsosEntrada.cartaoCredito.total[0]["sum(`fluxos`.`valor`)"] + data.arrecadacao.avulsosSaida.cartaoCredito.total[0]["sum(`fluxos`.`valor`)"])
            }\n`;
          text += `-=          P1:            ${
            formatPrice(
              data.arrecadacao.avulsosEntrada.cartaoCredito.p1[0]["sum(`fluxos`.`valor`)"] +
              data.arrecadacao.avulsosSaida.cartaoCredito.p1[0]["sum(`fluxos`.`valor`)"]
            )
            }\n`;
          text += `-=          P3:            ${
            formatPrice(
              data.arrecadacao.avulsosEntrada.cartaoCredito.p3[0]["sum(`fluxos`.`valor`)"] +
              data.arrecadacao.avulsosSaida.cartaoCredito.p3[0]["sum(`fluxos`.`valor`)"]
            )
            }\n`;
          text += `-=          TAMBOREU:      ${
            formatPrice(
              data.arrecadacao.avulsosEntrada.cartaoCredito.tamboreu[0]["sum(`fluxos`.`valor`)"] +
              data.arrecadacao.avulsosSaida.cartaoCredito.tamboreu[0]["sum(`fluxos`.`valor`)"]
            )
            }\n`;
          text += `-= TOTAL SELOS:            ${data.arrecadacao.selosQtd.selosFisicos.total[0]["sum(`fluxos`.`valor`)"] + data.arrecadacao.selosQtd.selosDigitais.total[0]["sum(`fluxos`.`valor`)"] || 0}\n`;
          text += `-=    P1:                  ${data.arrecadacao.selosQtd.selosFisicos.p1[0]["sum(`fluxos`.`valor`)"] + data.arrecadacao.selosQtd.selosDigitais.p1[0]["sum(`fluxos`.`valor`)"] || 0}\n`;
          text += `-=    P3:                  ${data.arrecadacao.selosQtd.selosFisicos.p3[0]["sum(`fluxos`.`valor`)"] + data.arrecadacao.selosQtd.selosDigitais.p3[0]["sum(`fluxos`.`valor`)"] || 0}\n`;
          text += `-=    TAMBOREU:            ${data.arrecadacao.selosQtd.selosFisicos.tamboreu[0]["sum(`fluxos`.`valor`)"] + data.arrecadacao.selosQtd.selosDigitais.tamboreu[0]["sum(`fluxos`.`valor`)"] || 0}\n`;
          text += `-=       TOTAL DIGITAIS:   ${data.arrecadacao.selosQtd.selosDigitais.total[0]["sum(`fluxos`.`valor`)"] || 0}\n`;
          text += `-=          P1:            ${data.arrecadacao.selosQtd.selosDigitais.p1[0]["sum(`fluxos`.`valor`)"] || 0}\n`;
          text += `-=          P3:            ${data.arrecadacao.selosQtd.selosDigitais.p3[0]["sum(`fluxos`.`valor`)"] || 0}\n`;
          text += `-=          TAMBOREU:      ${data.arrecadacao.selosQtd.selosDigitais.tamboreu[0]["sum(`fluxos`.`valor`)"] || 0}\n`;
          text += `-=       TOTAL FISICOS:    ${data.arrecadacao.selosQtd.selosFisicos.total[0]["sum(`fluxos`.`valor`)"] || 0}\n`;
          text += `-=          P1:            ${data.arrecadacao.selosQtd.selosFisicos.p1[0]["sum(`fluxos`.`valor`)"] || 0}\n`;
          text += `-=          P3:            ${data.arrecadacao.selosQtd.selosFisicos.p3[0]["sum(`fluxos`.`valor`)"] || 0}\n`;
          text += `-=          TAMBOREU:      ${data.arrecadacao.selosQtd.selosFisicos.tamboreu[0]["sum(`fluxos`.`valor`)"] || 0}\n`;
          text += "=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\n\n";
          break;
        case "hc":
          text += "=-=-=-=-=-=-=- HISTORICO DE CAIXAS =-=-=-=-=-=-=\n";
          data.caixas.historicoCaixas.forEach(caixa => {
            text += "------------------------------------------------\n";
            text += `-= CAIXA:                #${caixa.id}\n`;
            text += `-= OP INICIAL:           ${caixa.operadorInicial}\n`;
            text += `-= OP FINAL:             ${caixa.operadorFinal}\n`;
            text += `-= SALDO INICIAL:        ${formatPrice(caixa.saldoInicial)}\n`;
            text += `-= SALDO FINAL BRUTO:    ${formatPrice(caixa.saldoFinalBruto)}\n`;
            text += `-= SALDO FINAL REAL:     ${formatPrice(caixa.saldoFinalReal)}\n`;
            text += `-= MONTANTE RETIRADO:    ${formatPrice(caixa.montanteRetirado)}\n`;
            text += `-= ESTADO:               ${caixa.estado ? "FECHADO" : "ABERTO"}\n`;
            text += `-= ABERTURA:             ${formatDate(caixa.created_at)}\n`;
            text += `-= FECHAMENTO:           ${caixa.estado ? formatDate(caixa.updated_at) : ""}\n`;
            text += "------------------------------------------------\n";
          });
          break;
        case "cc":
          text += "=-=-=-=-=-=-=-= CAIXA CONSOLIDADO -=-=-=-=-=-=-=\n";
          data.caixas.historicoCaixasConsolidados.forEach(caixa => {
            text += `-= SALDO INICIAL:        ${formatPrice(caixa["sum(`saldoInicial`)"])}\n`;
            text += `-= SALDO FINAL BRUTO:    ${formatPrice(caixa["sum(`saldoFinalBruto`)"])}\n`;
            text += `-= SALDO FINAL REAL:     ${formatPrice(caixa["sum(`saldoFinalReal`)"])}\n`;
            text += `-= MONTANTE RETIRADO:    ${formatPrice(caixa["sum(`montanteRetirado`)"])}\n`;
          });
          text += "=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\n\n";
          break;
      }
      break;
  }

  text += "=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\n";
  text += "SPORT CLUB CORINTHIANS PAULISTA\n";
  text += "PARQUE SAO JORGE, SAO PAULO - SP, 03086-035\n";
  text += "=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\n\n\n\n\n\n\n\n";

  fs.writeFileSync(`C:/Estacionamento-win32-x64/result.txt`, text, err => {
    if (err) alert(err);
  });

  if (!data.evento) {
    printWindow = new BrowserWindow({
      width: 410,
      height: 812,
      icon: path.join(__dirname, "estacionamento.ico")
    });

    printWindow.loadURL("C:\\Estacionamento-win32-x64\\result.txt");
  }

  exec("copy /B C:\\Estacionamento-win32-x64\\result.txt LPT1");
};
