import React, { Component } from 'react';
import { ActivityIndicator, View, StyleSheet, Button } from 'react-native';
import { WebView } from 'react-native-webview';
import { BLEPrinter } from 'react-native-printer';
import { RNCamera } from 'react-native-camera';

export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      printers: [],
      currentPrinter: {},
      showCamera: false,
      camera: {},
      lastBarCode: null
    }
  }

  onBarCodeRead(scanResult) {
    if (scanResult.data != null) {
      this.setState({
        lastBarCode: scanResult.data,
        showCamera: false
      })

      this.webView.postMessage(scanResult.data)
    }
    return;
  }

  toggleCamera(value) {
    this.setState({ showCamera: value })
  }

  componentDidMount = () => {
    if (Platform.OS == 'android') {
      BLEPrinter.init().then(() => {
        BLEPrinter.getDeviceList()
          .then(printers => {
            this.setState(Object.assign({}, this.state, { printers: printers }))
            this._connectPrinter("00:11:22:33:44:55")
          });
      })
    }
  }

  _connectPrinter(inner_mac_address) {
    if (Platform.OS == 'android') {
      BLEPrinter.connectPrinter(inner_mac_address).then(
        (printer) => this.setState(Object.assign({}, this.state, { currentPrinter: printer })),
        error => console.warn(error))
    }
  }

  formatDate(value) {
    if (value) {
      Number.prototype.padLeft = function (base, chr) {
        var len = String(base || 10).length - String(this).length + 1;
        return len > 0 ? new Array(len).join(chr || "0") + this : this;
      };
      var d = new Date(value),
        dformat =
          [
            d.getDate().padLeft(),
            (d.getMonth() + 1).padLeft(),
            d.getFullYear()
          ].join("/") +
          " AS " +
          [
            d.getHours().padLeft(),
            d.getMinutes().padLeft(),
            d.getSeconds().padLeft()
          ].join(":");
      return dformat;
    }
  }

  formatPrice(value) {
    if (value) {
      return "R$ " + value.toFixed(2).replace(".", ",")
    } else {
      return 'R$ 0,00';
    }
  }

  printTicket(event) {
    const ticketJson = JSON.parse(event.nativeEvent.data)
    const data = ticketJson.data
    const modulo = ticketJson.modulo

    let text = "";
    text += " \n";
    text += "=-=-=-=- ESTACIONAMENTO -=-=-=-=\n";
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
          this.formatDate(data.created_at || new Date()) +
          "\n";
        text += `PLACA: ${data.placa}\n\n`;
        if (data.price) {
          if (
            data.formaPagamento === "Selo Físico" ||
            data.formaPagamento === "Selo Digital"
          ) {
            text += `SELOS UTILIZADOS: ${data.price}\n`;
            if (data.saldoRestante) {
              text += `SALDO DE SELOS RESTANTE: ${data.saldoRestante.saldo}\n\n\n`;
              text += ` S. CARRO: ${data.saldoRestante.normalCarro}\n`;
              text += ` S. MOTO: ${data.saldoRestante.normalMoto}`;
              text += ` S. DE CORTESIA: ${data.saldoRestante.cortesia}\n`;
            }
          } else {
            text += `VALOR PAGO: ${this.formatPrice(data.price)}\n`;
          }
          text += `PAGTO: ${data.formaPagamento}\n`;
        }
        text += " \n";
        text += "------- TABELA DA PRECOS -------\n";
        text += "ATE 15 MIN: R$ 0,00\n";
        text += `DE 15 MIN A 4 HORAS: ${this.formatPrice(data.precos.zeroAQuatro)}\n`;
        text += `DE 4 A 8 HORAS: ${this.formatPrice(data.precos.quatroAOito)}\n`;
        text += `DE 8 A 12 HORAS: ${this.formatPrice(data.precos.oitoADoze)}\n`;
        text += `DE 12 A 24 HORAS: ${this.formatPrice(data.precos.acimaDeDoze)}\n`;
        text += `DIA: ${this.formatPrice(data.precos.proximoDia)}\n`;
        text += `MOTOCICLETA: ${this.formatPrice(data.precos.motocicleta)}\n`;
        text += `APOS AS ${data.precos.horarioLimite} HORAS: ${this.formatPrice(
          data.precos.aposHorarioLimite
        )}\n\n`;
        break;
      case "Saída":
        text += `ATE A PROXIMA, ${data.nome}!\n`;
        text += " \n";
        text += `MATRICULA: ${data.matricula}\n`;
        text +=
          `EVENTO: SAIDA EM ` + this.formatDate(data.created_at || new Date()) + "\n";
        text += `PLACA: ${data.placa}\n`;
        if (data.came_in) {
          text += `ENTRADA: ` + this.formatDate(data.came_in) + "\n\n";
        }
        if (data.price) {
          if (
            data.formaPagamento === "Selo Físico" ||
            data.formaPagamento === "Selo Digital"
          ) {
            text += `SELOS UTILIZADOS: ${data.price}\n`;
            if (data.saldoRestante) {
              text += `SALDO DE SELOS RESTANTE: ${data.saldoRestante.saldo}\n`;
              text += ` S. CARRO: ${data.saldoRestante.normalCarro}\n`;
              text += ` S. MOTO: ${data.saldoRestante.normalMoto}\n`;
              text += ` S. CORTESIA: ${data.saldoRestante.cortesia}\n`;
            }
          } else {
            text += `VALOR PAGO: ${this.formatPrice(data.price)}\n`;
          }
          text += `PAGTO: ${data.formaPagamento}\n`;
        }
        break;
      default:
        switch (modulo) {
          case "ma":
            text += "=-=-=-=- MOV. PESSOAS =-=-=-=-\n";
            text += `-= TOTAL SOCIOS:         ${data.movimentacaoPessoas.socios.total}\n`;
            text += `-=    P1:                ${data.movimentacaoPessoas.socios.p1}\n`;
            text += `-=    P3:                ${data.movimentacaoPessoas.socios.p3}\n`;
            text += `-=    TAMBOREU:          ${data.movimentacaoPessoas.socios.tamboreu}\n`;
            text += `-= TOTAL CREDENCIADOS:   ${data.movimentacaoPessoas.credenciados.total}\n`;
            text += `-=    P1:                ${data.movimentacaoPessoas.credenciados.p1}\n`;
            text += `-=    P3:                ${data.movimentacaoPessoas.credenciados.p3}\n`;
            text += `-=    TAMBOREU:          ${data.movimentacaoPessoas.credenciados.tamboreu}\n`;
            text += `-= TOTAL FUNCIONARIOS:   ${data.movimentacaoPessoas.funcionarios.total}\n`;
            text += `-=    P1:                ${data.movimentacaoPessoas.funcionarios.p1}\n`;
            text += `-=    P3:                ${data.movimentacaoPessoas.funcionarios.p3}\n`;
            text += `-=    TAMBOREU:          ${data.movimentacaoPessoas.funcionarios.tamboreu}\n`;
            text += `-= TOTAL CONSELHEIROS:   ${data.movimentacaoPessoas.conselheiros.total}\n`;
            text += `-=    P1:                ${data.movimentacaoPessoas.conselheiros.p1}\n`;
            text += `-=    P3:                ${data.movimentacaoPessoas.conselheiros.p3}\n`;
            text += `-=    TAMBOREU:          ${data.movimentacaoPessoas.conselheiros.tamboreu}\n`;
            text += `-= TOTAL ATLETAS:        ${data.movimentacaoPessoas.atletas.total}\n`;
            text += `-=    P1:                ${data.movimentacaoPessoas.atletas.p1}\n`;
            text += `-=    P3:                ${data.movimentacaoPessoas.atletas.p3}\n`;
            text += `-=    TAMBOREU:          ${data.movimentacaoPessoas.atletas.tamboreu}\n`;
            text += "=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\n";
            text += " \n";
            text += "=-=-=-=- MOV. DE VEICULOS =-=-=-=-\n";
            text += `-= TOTAL CADASTRADOS:    ${data.movimentacaoVeiculos.cadastrados.total}\n`;
            text += `-=    P1:                ${data.movimentacaoVeiculos.cadastrados.p1}\n`;
            text += `-=    P3:                ${data.movimentacaoVeiculos.cadastrados.p3}\n`;
            text += `-=    TAMBOREU:          ${data.movimentacaoVeiculos.cadastrados.tamboreu}\n`;
            text += `-= TOTAL CARROS:         ${data.movimentacaoVeiculos.avulsosCarros.total}\n`;
            text += `-=    P1:                ${data.movimentacaoVeiculos.avulsosCarros.p1}\n`;
            text += `-=    P3:                ${data.movimentacaoVeiculos.avulsosCarros.p3}\n`;
            text += `-=    TAMBOREU:          ${data.movimentacaoVeiculos.avulsosCarros.tamboreu}\n`;
            text += `-= TOTAL MOTOCICLETAS:   ${data.movimentacaoVeiculos.avulsosMotos.total}\n`;
            text += `-=    P1:                ${data.movimentacaoVeiculos.avulsosMotos.p1}\n`;
            text += `-=    P3:                ${data.movimentacaoVeiculos.avulsosMotos.p3}\n`;
            text += `-=    TAMBOREU:          ${data.movimentacaoVeiculos.avulsosMotos.tamboreu}\n`;
            text += `-= TOTAL BICICLETAS:     ${data.movimentacaoVeiculos.avulsosBicicletas.total}\n`;
            text += `-=    P1:                ${data.movimentacaoVeiculos.avulsosBicicletas.p1}\n`;
            text += `-=    P3:                ${data.movimentacaoVeiculos.avulsosBicicletas.p3}\n`;
            text += `-=    TAMBOREU:          ${data.movimentacaoVeiculos.avulsosBicicletas.tamboreu}\n`;
            text += "=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\n";
            text += " \n";
            text += "=-=-=-=- ARRECADACAO =-=-=-=-\n";
            text += `-= TOTAL DINHEIRO:       ${this.formatPrice(data.arrecadacao.avulsosEntrada.dinheiro.total[0]["sum(`fluxos`.`valor`)"] + data.arrecadacao.avulsosSaida.dinheiro.total[0]["sum(`fluxos`.`valor`)"])}\n`;
            text += `-=    P1:                ${this.formatPrice(data.arrecadacao.avulsosEntrada.dinheiro.p1[0]["sum(`fluxos`.`valor`)"] + data.arrecadacao.avulsosSaida.dinheiro.p1[0]["sum(`fluxos`.`valor`)"])}\n`;
            text += `-=    P3:                ${this.formatPrice(data.arrecadacao.avulsosEntrada.dinheiro.p3[0]["sum(`fluxos`.`valor`)"] + data.arrecadacao.avulsosSaida.dinheiro.p3[0]["sum(`fluxos`.`valor`)"])}\n`;
            text += `-=    TAMBOREU:          ${this.formatPrice(data.arrecadacao.avulsosEntrada.dinheiro.tamboreu[0]["sum(`fluxos`.`valor`)"] + data.arrecadacao.avulsosSaida.dinheiro.tamboreu[0]["sum(`fluxos`.`valor`)"])}\n`;
            text += `-= TOTAL CARTAO:         ${
              this.formatPrice(
                data.arrecadacao.avulsosEntrada.cartaoDebito.total[0]["sum(`fluxos`.`valor`)"] +
                data.arrecadacao.avulsosSaida.cartaoDebito.total[0]["sum(`fluxos`.`valor`)"] +
                data.arrecadacao.avulsosEntrada.cartaoCredito.total[0]["sum(`fluxos`.`valor`)"] +
                data.arrecadacao.avulsosSaida.cartaoCredito.total[0]["sum(`fluxos`.`valor`)"] +
                data.arrecadacao.avulsosCartao.total[0]["sum(`fluxos`.`valor`)"]
              )
              }\n`;
            text += `-=    P1:                ${
              this.formatPrice(
                data.arrecadacao.avulsosEntrada.cartaoDebito.p1[0]["sum(`fluxos`.`valor`)"] +
                data.arrecadacao.avulsosSaida.cartaoDebito.p1[0]["sum(`fluxos`.`valor`)"] +
                data.arrecadacao.avulsosEntrada.cartaoCredito.p1[0]["sum(`fluxos`.`valor`)"] +
                data.arrecadacao.avulsosSaida.cartaoCredito.p1[0]["sum(`fluxos`.`valor`)"] +
                data.arrecadacao.avulsosCartao.p1[0]["sum(`fluxos`.`valor`)"]
              )
              }\n`;
            text += `-=    P3:                ${
              this.formatPrice(
                data.arrecadacao.avulsosEntrada.cartaoDebito.p3[0]["sum(`fluxos`.`valor`)"] +
                data.arrecadacao.avulsosSaida.cartaoDebito.p3[0]["sum(`fluxos`.`valor`)"] +
                data.arrecadacao.avulsosEntrada.cartaoCredito.p3[0]["sum(`fluxos`.`valor`)"] +
                data.arrecadacao.avulsosSaida.cartaoCredito.p3[0]["sum(`fluxos`.`valor`)"] +
                data.arrecadacao.avulsosCartao.p3[0]["sum(`fluxos`.`valor`)"]
              )
              }\n`;
            text += `-=    TAMBOREU:          ${
              this.formatPrice(
                data.arrecadacao.avulsosEntrada.cartaoDebito.tamboreu[0]["sum(`fluxos`.`valor`)"] +
                data.arrecadacao.avulsosSaida.cartaoDebito.tamboreu[0]["sum(`fluxos`.`valor`)"] +
                data.arrecadacao.avulsosEntrada.cartaoCredito.tamboreu[0]["sum(`fluxos`.`valor`)"] +
                data.arrecadacao.avulsosSaida.cartaoCredito.tamboreu[0]["sum(`fluxos`.`valor`)"] +
                data.arrecadacao.avulsosCartao.tamboreu[0]["sum(`fluxos`.`valor`)"]
              )
              }\n`;
            text += `-=       TOTAL DEBITO:   ${
              this.formatPrice(
                data.arrecadacao.avulsosEntrada.cartaoDebito.total[0]["sum(`fluxos`.`valor`)"] +
                data.arrecadacao.avulsosSaida.cartaoDebito.total[0]["sum(`fluxos`.`valor`)"]
              )
              }\n`;
            text += `-=          P1:          ${
              this.formatPrice(
                data.arrecadacao.avulsosEntrada.cartaoDebito.p1[0]["sum(`fluxos`.`valor`)"] +
                data.arrecadacao.avulsosSaida.cartaoDebito.p1[0]["sum(`fluxos`.`valor`)"]
              )
              }\n`;
            text += `-=          P3:          ${
              this.formatPrice(
                data.arrecadacao.avulsosEntrada.cartaoDebito.p3[0]["sum(`fluxos`.`valor`)"] +
                data.arrecadacao.avulsosSaida.cartaoDebito.p3[0]["sum(`fluxos`.`valor`)"]
              )
              }\n`;
            text += `-=          TAMBOREU:    ${
              this.formatPrice(
                data.arrecadacao.avulsosEntrada.cartaoDebito.tamboreu[0]["sum(`fluxos`.`valor`)"] +
                data.arrecadacao.avulsosSaida.cartaoDebito.tamboreu[0]["sum(`fluxos`.`valor`)"]
              )
              }\n`;
            text += `-=       TOTAL CREDITO:  ${
              this.formatPrice(data.arrecadacao.avulsosEntrada.cartaoCredito.total[0]["sum(`fluxos`.`valor`)"] + data.arrecadacao.avulsosSaida.cartaoCredito.total[0]["sum(`fluxos`.`valor`)"])
              }\n`;
            text += `-=          P1:          ${
              this.formatPrice(
                data.arrecadacao.avulsosEntrada.cartaoCredito.p1[0]["sum(`fluxos`.`valor`)"] +
                data.arrecadacao.avulsosSaida.cartaoCredito.p1[0]["sum(`fluxos`.`valor`)"]
              )
              }\n`;
            text += `-=          P3:          ${
              this.formatPrice(
                data.arrecadacao.avulsosEntrada.cartaoCredito.p3[0]["sum(`fluxos`.`valor`)"] +
                data.arrecadacao.avulsosSaida.cartaoCredito.p3[0]["sum(`fluxos`.`valor`)"]
              )
              }\n`;
            text += `-=          TAMBOREU:    ${
              this.formatPrice(
                data.arrecadacao.avulsosEntrada.cartaoCredito.tamboreu[0]["sum(`fluxos`.`valor`)"] +
                data.arrecadacao.avulsosSaida.cartaoCredito.tamboreu[0]["sum(`fluxos`.`valor`)"]
              )
              }\n`;
            text += `-= TOTAL SELOS:          ${data.arrecadacao.selosQtd.selosFisicos.total[0]["sum(`fluxos`.`valor`)"] + data.arrecadacao.selosQtd.selosDigitais.total[0]["sum(`fluxos`.`valor`)"] || 0}\n`;
            text += `-=    P1:                ${data.arrecadacao.selosQtd.selosFisicos.p1[0]["sum(`fluxos`.`valor`)"] + data.arrecadacao.selosQtd.selosDigitais.p1[0]["sum(`fluxos`.`valor`)"] || 0}\n`;
            text += `-=    P3:                ${data.arrecadacao.selosQtd.selosFisicos.p3[0]["sum(`fluxos`.`valor`)"] + data.arrecadacao.selosQtd.selosDigitais.p3[0]["sum(`fluxos`.`valor`)"] || 0}\n`;
            text += `-=    TAMBOREU:          ${data.arrecadacao.selosQtd.selosFisicos.tamboreu[0]["sum(`fluxos`.`valor`)"] + data.arrecadacao.selosQtd.selosDigitais.tamboreu[0]["sum(`fluxos`.`valor`)"] || 0}\n`;
            text += `-=       TOTAL DIGITAIS: ${data.arrecadacao.selosQtd.selosDigitais.total[0]["sum(`fluxos`.`valor`)"] || 0}\n`;
            text += `-=          P1:          ${data.arrecadacao.selosQtd.selosDigitais.p1[0]["sum(`fluxos`.`valor`)"] || 0}\n`;
            text += `-=          P3:          ${data.arrecadacao.selosQtd.selosDigitais.p3[0]["sum(`fluxos`.`valor`)"] || 0}\n`;
            text += `-=          TAMBOREU:    ${data.arrecadacao.selosQtd.selosDigitais.tamboreu[0]["sum(`fluxos`.`valor`)"] || 0}\n`;
            text += `-=       TOTAL FISICOS:  ${data.arrecadacao.selosQtd.selosFisicos.total[0]["sum(`fluxos`.`valor`)"] || 0}\n`;
            text += `-=          P1:          ${data.arrecadacao.selosQtd.selosFisicos.p1[0]["sum(`fluxos`.`valor`)"] || 0}\n`;
            text += `-=          P3:          ${data.arrecadacao.selosQtd.selosFisicos.p3[0]["sum(`fluxos`.`valor`)"] || 0}\n`;
            text += `-=          TAMBOREU:    ${data.arrecadacao.selosQtd.selosFisicos.tamboreu[0]["sum(`fluxos`.`valor`)"] || 0}\n`;
            break;
          case "hc":
            text += "=-=-=-=- HIST. DE CAIXAS =-=-=-=-\n";
            data.caixas.historicoCaixas.forEach(caixa => {
              text += "------------------------------\n\n";
              text += `-= CAIXA:             #${caixa.id}\n`;
              text += `-= OP INICIAL:        ${caixa.operadorInicial}\n`;
              text += `-= OP FINAL:          ${caixa.operadorFinal}\n`;
              text += `-= SALDO INICIAL:     ${this.formatPrice(
                caixa.saldoInicial
              )}\n`;
              text += `-= SALDO FINAL BRUTO: ${this.formatPrice(
                caixa.saldoFinalBruto
              )}\n`;
              text += `-= SALDO FINAL REAL:  ${this.formatPrice(
                caixa.saldoFinalReal
              )}\n`;
              text += `-= MONTANTE RETIRADO: ${this.formatPrice(
                caixa.montanteRetirado
              )}\n`;
              text += `-= ESTADO:            ${
                caixa.estado ? "FECHADO" : "ABERTO"
                }\n`;
              text += `-= ABERTURA:          ${this.formatDate(caixa.created_at)}\n`;
              text += `-= FECHAMENTO:        ${
                caixa.estado ? this.formatDate(caixa.updated_at) : ""
                }\n`;
              text += "------------------------------\n";
            });
            break;
          case "cc":
            text += "=-=-=-=- CAIXA CONSOLIDADO =-=-=-=-\n";
            data.caixas.historicoCaixasConsolidados.forEach(caixa => {
              text += `-= SALDO INICIAL:         ${this.formatPrice(
                caixa["sum(`saldoInicial`)"]
              )}\n`;
              text += `-= SALDO FINAL BRUTO:     ${this.formatPrice(
                caixa["sum(`saldoFinalBruto`)"]
              )}\n`;
              text += `-= SALDO FINAL REAL:      ${this.formatPrice(
                caixa["sum(`saldoFinalReal`)"]
              )}\n`;
              text += `-= MONTANTE RETIRADO:     ${this.formatPrice(
                caixa["sum(`montanteRetirado`)"]
              )}\n`;
            });
            text += "------------------------------\n\n";
            break;
        }
        break;
    }

    text += "=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\n";
    text += "         CORINTHIANS\n";
    text += "  PQ. SAO JORGE, SAO PAULO\n";
    text += "=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\n\n\n\n\n";

    if (this.state.currentPrinter) {
      BLEPrinter.printText(text);
    } else {
      alert("Nenhuma configuração de impressora")
    }

  }

  renderLoading() {
    return (
      <ActivityIndicator style={{ flex: 1 }} animating color="black" size="large" />
    )
  }

  render() {
    return (
      <View style={styles.container}>

        <WebView
          ref={ref => {
            this.webView = ref;
          }}
          startInLoadingState={true}
          renderLoading={this.renderLoading}
          originWhitelist={['*']}
          style={!this.state.showCamera ? styles.webView : styles.hidden}
          source={{ uri: 'https://estacionamento.sccorinthians.com.br' }}
          onMessage={(event) => {
            if (event.nativeEvent.data === 'readRegistration') {
              this.toggleCamera(true)
            } else {
              this.printTicket(event)
            }
          }}
        />

        {this.state.showCamera ?
          <View style={styles.container}>
            <RNCamera
              ref={ref => {
                this.camera = ref;
              }}
              style={styles.preview}
              type={RNCamera.Constants.Type.back}
              onBarCodeRead={this.onBarCodeRead.bind(this)}
            />
            <Button title="Voltar para o sistema" onPress={() => this.setState({ showCamera: false })}></Button>
          </View>
          : null}
      </View>
    );
  }
};

const styles = StyleSheet.create({
  webView: {
    flex: 1
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  hidden: {
    // ...
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
});