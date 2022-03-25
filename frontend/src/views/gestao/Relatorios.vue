<template>
  <div>
    <PageTitle
      title="Relatórios"
      description="Tenha controle de movimentação e arrecadação do sistema"
    />
    <v-layout row wrap>
      <v-flex xs12>
        <v-card>
          <v-card-title>
            <v-dialog
              ref="dialog"
              v-model="modal1"
              :return-value.sync="date1"
              persistent
              lazy
              full-width
              width="290px"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  v-model="date1"
                  type="date"
                  class="mx-2"
                  label="Data inicial"
                  prepend-inner-icon="event"
                  readonly
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker v-model="date1" locale="pt-br" scrollable>
                <v-spacer></v-spacer>
                <v-btn flat color="primary" @click="modal1 = false">Cancelar</v-btn>
                <v-btn flat color="primary" @click="$refs.dialog.save(date1)">OK</v-btn>
              </v-date-picker>
            </v-dialog>
            <v-dialog
              ref="dialog1"
              v-model="modal2"
              :return-value.sync="date2"
              persistent
              lazy
              full-width
              width="290px"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  class="mx-2"
                  v-model="date2"
                  label="Data final"
                  type="date"
                  prepend-inner-icon="event"
                  readonly
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker v-model="date2" locale="pt-br" scrollable>
                <v-spacer></v-spacer>
                <v-btn flat color="primary" @click="modal2 = false">Cancelar</v-btn>
                <v-btn flat color="primary" @click="$refs.dialog1.save(date2)">OK</v-btn>
              </v-date-picker>
            </v-dialog>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-actions>
            <v-layout row wrap>
              <v-flex>
                <v-btn
                  color="secondary"
                  flat
                  @click="consult(true, 'ma')"
                >Impr. movimentação e arrecadação</v-btn>
                <v-btn color="secondary" flat @click="consult(true, 'hc')">Impr. histórico de caixas</v-btn>
                <v-btn color="secondary" flat @click="consult(true, 'cc')">Impr. caixa consolidado</v-btn>
                <v-btn color="primary" depressed @click="consult()">Consultar</v-btn>
              </v-flex>
            </v-layout>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
    <v-layout v-if="report" row wrap>
      <v-flex d-flex xs12 sm6 md4>
        <v-card>
          <v-card-title primary class="title">Movimentação de pessoas</v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <v-list three-line>
              <v-list-tile>
                <v-list-tile-content>
                  <v-list-tile-title>Sócios</v-list-tile-title>
                  <v-list-tile-sub-title>
                    <span>P1: {{ report.movimentacaoPessoas.socios.p1}}</span>
                  </v-list-tile-sub-title>
                  <v-list-tile-sub-title>
                    <span>P3: {{ report.movimentacaoPessoas.socios.p3}}</span>
                  </v-list-tile-sub-title>
                  <v-list-tile-sub-title>
                    <span>Tamboréu: {{ report.movimentacaoPessoas.socios.tamboreu}}</span>
                  </v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action>{{ report.movimentacaoPessoas.socios.total}}</v-list-tile-action>
              </v-list-tile>
              <v-divider class="my-2"></v-divider>
              <v-list-tile>
                <v-list-tile-content>
                  <v-list-tile-title>Credenciados</v-list-tile-title>
                  <v-list-tile-sub-title>
                    <span>P1: {{ report.movimentacaoPessoas.credenciados.p1}}</span>
                  </v-list-tile-sub-title>
                  <v-list-tile-sub-title>
                    <span>P3: {{ report.movimentacaoPessoas.credenciados.p3}}</span>
                  </v-list-tile-sub-title>
                  <v-list-tile-sub-title>
                    <span>Tamboréu: {{ report.movimentacaoPessoas.credenciados.tamboreu}}</span>
                  </v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action>{{ report.movimentacaoPessoas.credenciados.total }}</v-list-tile-action>
              </v-list-tile>
              <v-divider class="my-2"></v-divider>
              <v-list-tile>
                <v-list-tile-content>
                  <v-list-tile-title>Funcionários</v-list-tile-title>
                  <v-list-tile-sub-title>
                    <span>P1: {{ report.movimentacaoPessoas.funcionarios.p1 }}</span>
                  </v-list-tile-sub-title>
                  <v-list-tile-sub-title>
                    <span>P3: {{ report.movimentacaoPessoas.funcionarios.p3 }}</span>
                  </v-list-tile-sub-title>
                  <v-list-tile-sub-title>
                    <span>Tamboréu: {{ report.movimentacaoPessoas.funcionarios.tamboreu }}</span>
                  </v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action>{{ report.movimentacaoPessoas.funcionarios.total }}</v-list-tile-action>
              </v-list-tile>
              <v-divider class="my-2"></v-divider>
              <v-list-tile>
                <v-list-tile-content>
                  <v-list-tile-title>Conselheiros</v-list-tile-title>
                  <v-list-tile-sub-title>
                    <span>P1: {{ report.movimentacaoPessoas.conselheiros.p1 }}</span>
                  </v-list-tile-sub-title>
                  <v-list-tile-sub-title>
                    <span>P3: {{ report.movimentacaoPessoas.conselheiros.p3 }}</span>
                  </v-list-tile-sub-title>
                  <v-list-tile-sub-title>
                    <span>Tamboréu: {{ report.movimentacaoPessoas.conselheiros.tamboreu }}</span>
                  </v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action>{{ report.movimentacaoPessoas.conselheiros.total }}</v-list-tile-action>
              </v-list-tile>
              <v-divider class="my-2"></v-divider>
              <v-list-tile>
                <v-list-tile-content>
                  <v-list-tile-title>Atletas</v-list-tile-title>
                  <v-list-tile-sub-title>
                    <span>P1: {{ report.movimentacaoPessoas.atletas.p1 }}</span>
                  </v-list-tile-sub-title>
                  <v-list-tile-sub-title>
                    <span>P3: {{ report.movimentacaoPessoas.atletas.p3 }}</span>
                  </v-list-tile-sub-title>
                  <v-list-tile-sub-title>
                    <span>Tamboréu: {{ report.movimentacaoPessoas.atletas.tamboreu }}</span>
                  </v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action>{{ report.movimentacaoPessoas.atletas.total }}</v-list-tile-action>
              </v-list-tile>
            </v-list>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex d-flex xs12 sm6 md4>
        <v-card>
          <v-card-title primary class="title">Movimentação de veículos</v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <v-list three-line>
              <v-list-tile>
                <v-list-tile-content>
                  <v-list-tile-title>Cadastrados</v-list-tile-title>
                  <v-list-tile-sub-title>
                    <span>P1: {{ report.movimentacaoVeiculos.cadastrados.p1 }}</span>
                  </v-list-tile-sub-title>
                  <v-list-tile-sub-title>
                    <span>P3: {{ report.movimentacaoVeiculos.cadastrados.p3 }}</span>
                  </v-list-tile-sub-title>
                  <v-list-tile-sub-title>
                    <span>Tamboréu: {{ report.movimentacaoVeiculos.cadastrados.tamboreu }}</span>
                  </v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action>{{ report.movimentacaoVeiculos.cadastrados.total }}</v-list-tile-action>
              </v-list-tile>
              <v-divider class="my-2"></v-divider>
              <v-list-tile>
                <v-list-tile-content>
                  <v-list-tile-title>Carros avulsos</v-list-tile-title>
                  <v-list-tile-sub-title>
                    <span>P1: {{ report.movimentacaoVeiculos.avulsosCarros.p1 }}</span>
                  </v-list-tile-sub-title>
                  <v-list-tile-sub-title>
                    <span>P3: {{ report.movimentacaoVeiculos.avulsosCarros.p3 }}</span>
                  </v-list-tile-sub-title>
                  <v-list-tile-sub-title>
                    <span>Tamboréu: {{ report.movimentacaoVeiculos.avulsosCarros.tamboreu }}</span>
                  </v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action>{{ report.movimentacaoVeiculos.avulsosCarros.total }}</v-list-tile-action>
              </v-list-tile>
              <v-divider class="my-2"></v-divider>
              <v-list-tile>
                <v-list-tile-content>
                  <v-list-tile-title>Motocicletas avulsas</v-list-tile-title>
                  <v-list-tile-sub-title>
                    <span>P1: {{ report.movimentacaoVeiculos.avulsosMotos.p1 }}</span>
                  </v-list-tile-sub-title>
                  <v-list-tile-sub-title>
                    <span>P3: {{ report.movimentacaoVeiculos.avulsosMotos.p3 }}</span>
                  </v-list-tile-sub-title>
                  <v-list-tile-sub-title>
                    <span>Tamboréu: {{ report.movimentacaoVeiculos.avulsosMotos.tamboreu }}</span>
                  </v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action>{{ report.movimentacaoVeiculos.avulsosMotos.total }}</v-list-tile-action>
              </v-list-tile>
              <v-divider class="my-2"></v-divider>
              <v-list-tile>
                <v-list-tile-content>
                  <v-list-tile-title>Bicicletas avulsas</v-list-tile-title>
                  <v-list-tile-sub-title>
                    <span>P1: {{ report.movimentacaoVeiculos.avulsosBicicletas.p1 }}</span>
                  </v-list-tile-sub-title>
                  <v-list-tile-sub-title>
                    <span>P3: {{ report.movimentacaoVeiculos.avulsosBicicletas.p3 }}</span>
                  </v-list-tile-sub-title>
                  <v-list-tile-sub-title>
                    <span>Tamboréu: {{ report.movimentacaoVeiculos.avulsosBicicletas.tamboreu }}</span>
                  </v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action>{{ report.movimentacaoVeiculos.avulsosBicicletas.total }}</v-list-tile-action>
              </v-list-tile>
            </v-list>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex d-flex xs12 sm6 md4>
        <v-card>
          <v-card-title primary class="title">Arrecadação</v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <v-list three-line>
              <v-list-tile>
                <v-list-tile-content>
                  <v-list-tile-title>Dinheiro</v-list-tile-title>
                  <v-list-tile-sub-title>
                    <span>
                      P1:
                      {{ report.arrecadacao.avulsosEntrada.dinheiro.p1[0]["sum(`fluxos`.`valor`)"] + report.arrecadacao.avulsosSaida.dinheiro.p1[0]["sum(`fluxos`.`valor`)"] | formatPrice }}
                    </span>
                  </v-list-tile-sub-title>
                  <v-list-tile-sub-title>
                    <span>
                      P3:
                      {{ report.arrecadacao.avulsosEntrada.dinheiro.p3[0]["sum(`fluxos`.`valor`)"] + report.arrecadacao.avulsosSaida.dinheiro.p3[0]["sum(`fluxos`.`valor`)"] | formatPrice }}
                    </span>
                  </v-list-tile-sub-title>
                  <v-list-tile-sub-title>
                    <span>
                      Tamboréu:
                      {{ report.arrecadacao.avulsosEntrada.dinheiro.tamboreu[0]["sum(`fluxos`.`valor`)"] + report.arrecadacao.avulsosSaida.dinheiro.tamboreu[0]["sum(`fluxos`.`valor`)"] | formatPrice }}
                    </span>
                  </v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action>{{ report.arrecadacao.avulsosEntrada.dinheiro.total[0]["sum(`fluxos`.`valor`)"] + report.arrecadacao.avulsosSaida.dinheiro.total[0]["sum(`fluxos`.`valor`)"] | formatPrice }}</v-list-tile-action>
              </v-list-tile>
              <v-divider class="my-2"></v-divider>
              <v-list-tile>
                <v-list-tile-content>
                  <v-list-tile-title>Total cartão</v-list-tile-title>
                  <v-list-tile-sub-title>
                    <span>
                      P1:
                      {{
                      report.arrecadacao.avulsosEntrada.cartaoDebito.p1[0]["sum(`fluxos`.`valor`)"] +
                      report.arrecadacao.avulsosSaida.cartaoDebito.p1[0]["sum(`fluxos`.`valor`)"] +
                      report.arrecadacao.avulsosEntrada.cartaoCredito.p1[0]["sum(`fluxos`.`valor`)"] + report.arrecadacao.avulsosSaida.cartaoCredito.p1[0]["sum(`fluxos`.`valor`)"] +
                      report.arrecadacao.avulsosCartao.p1[0]["sum(`fluxos`.`valor`)"] | formatPrice
                      }}
                    </span>
                  </v-list-tile-sub-title>
                  <v-list-tile-sub-title>
                    <span>
                      P3:
                      {{
                      report.arrecadacao.avulsosEntrada.cartaoDebito.p3[0]["sum(`fluxos`.`valor`)"] +
                      report.arrecadacao.avulsosSaida.cartaoDebito.p3[0]["sum(`fluxos`.`valor`)"] +
                      report.arrecadacao.avulsosEntrada.cartaoCredito.p3[0]["sum(`fluxos`.`valor`)"] + report.arrecadacao.avulsosSaida.cartaoCredito.p3[0]["sum(`fluxos`.`valor`)"] +
                      report.arrecadacao.avulsosCartao.p3[0]["sum(`fluxos`.`valor`)"] | formatPrice
                      }}
                    </span>
                  </v-list-tile-sub-title>
                  <v-list-tile-sub-title>
                    <span>
                      Tamboréu:
                      {{
                      report.arrecadacao.avulsosEntrada.cartaoDebito.tamboreu[0]["sum(`fluxos`.`valor`)"] +
                      report.arrecadacao.avulsosSaida.cartaoDebito.tamboreu[0]["sum(`fluxos`.`valor`)"] +
                      report.arrecadacao.avulsosEntrada.cartaoCredito.tamboreu[0]["sum(`fluxos`.`valor`)"] + report.arrecadacao.avulsosSaida.cartaoCredito.tamboreu[0]["sum(`fluxos`.`valor`)"] +
                      report.arrecadacao.avulsosCartao.tamboreu[0]["sum(`fluxos`.`valor`)"] | formatPrice
                      }}
                    </span>
                  </v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action>
                  {{
                  report.arrecadacao.avulsosEntrada.cartaoDebito.total[0]["sum(`fluxos`.`valor`)"] + report.arrecadacao.avulsosSaida.cartaoDebito.total[0]["sum(`fluxos`.`valor`)"] + report.arrecadacao.avulsosEntrada.cartaoCredito.total[0]["sum(`fluxos`.`valor`)"] + report.arrecadacao.avulsosSaida.cartaoCredito.total[0]["sum(`fluxos`.`valor`)"] +
                  report.arrecadacao.avulsosCartao.total[0]["sum(`fluxos`.`valor`)"] | formatPrice
                  }}
                </v-list-tile-action>
              </v-list-tile>
              <v-divider class="my-2" inset></v-divider>
              <v-list-tile>
                <v-list-tile-content class="ml-3">
                  <v-list-tile-title>Débito</v-list-tile-title>
                  <v-list-tile-sub-title>
                    <span>P1: {{ report.arrecadacao.avulsosEntrada.cartaoDebito.p1[0]["sum(`fluxos`.`valor`)"] + report.arrecadacao.avulsosSaida.cartaoDebito.p1[0]["sum(`fluxos`.`valor`)"] | formatPrice }}</span>
                  </v-list-tile-sub-title>
                  <v-list-tile-sub-title>
                    <span>P3: {{ report.arrecadacao.avulsosEntrada.cartaoDebito.p3[0]["sum(`fluxos`.`valor`)"] + report.arrecadacao.avulsosSaida.cartaoDebito.p3[0]["sum(`fluxos`.`valor`)"] | formatPrice }}</span>
                  </v-list-tile-sub-title>
                  <v-list-tile-sub-title>
                    <span>Tamboréu: {{ report.arrecadacao.avulsosEntrada.cartaoDebito.tamboreu[0]["sum(`fluxos`.`valor`)"] + report.arrecadacao.avulsosSaida.cartaoDebito.tamboreu[0]["sum(`fluxos`.`valor`)"] | formatPrice }}</span>
                  </v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action>{{ report.arrecadacao.avulsosEntrada.cartaoDebito.total[0]["sum(`fluxos`.`valor`)"] + report.arrecadacao.avulsosSaida.cartaoDebito.total[0]["sum(`fluxos`.`valor`)"] | formatPrice }}</v-list-tile-action>
              </v-list-tile>
              <v-divider class="my-2" inset></v-divider>
              <v-list-tile>
                <v-list-tile-content class="ml-3">
                  <v-list-tile-title>Crédito</v-list-tile-title>
                  <v-list-tile-sub-title>
                    <span>P1: {{ report.arrecadacao.avulsosEntrada.cartaoCredito.p1[0]["sum(`fluxos`.`valor`)"] + report.arrecadacao.avulsosSaida.cartaoCredito.p1[0]["sum(`fluxos`.`valor`)"] | formatPrice }}</span>
                  </v-list-tile-sub-title>
                  <v-list-tile-sub-title>
                    <span>P3: {{ report.arrecadacao.avulsosEntrada.cartaoCredito.p3[0]["sum(`fluxos`.`valor`)"] + report.arrecadacao.avulsosSaida.cartaoCredito.p3[0]["sum(`fluxos`.`valor`)"] | formatPrice }}</span>
                  </v-list-tile-sub-title>
                  <v-list-tile-sub-title>
                    <span>Tamboréu: {{ report.arrecadacao.avulsosEntrada.cartaoCredito.tamboreu[0]["sum(`fluxos`.`valor`)"] + report.arrecadacao.avulsosSaida.cartaoCredito.tamboreu[0]["sum(`fluxos`.`valor`)"] | formatPrice }}</span>
                  </v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action>{{ report.arrecadacao.avulsosEntrada.cartaoCredito.total[0]["sum(`fluxos`.`valor`)"] + report.arrecadacao.avulsosSaida.cartaoCredito.total[0]["sum(`fluxos`.`valor`)"] | formatPrice }}</v-list-tile-action>
              </v-list-tile>
              <v-divider class="my-2"></v-divider>
              <v-list-tile>
                <v-list-tile-content>
                  <v-list-tile-title>Selos</v-list-tile-title>
                  <v-list-tile-sub-title>
                    <span>P1: {{ report.arrecadacao.selosQtd.selosFisicos.p1[0]["sum(`fluxos`.`valor`)"] + report.arrecadacao.selosQtd.selosDigitais.p1[0]["sum(`fluxos`.`valor`)"] || 0 }} selos</span>
                  </v-list-tile-sub-title>
                  <v-list-tile-sub-title>
                    <span>P3: {{ report.arrecadacao.selosQtd.selosFisicos.p3[0]["sum(`fluxos`.`valor`)"] + report.arrecadacao.selosQtd.selosDigitais.p3[0]["sum(`fluxos`.`valor`)"] || 0 }} selos</span>
                  </v-list-tile-sub-title>
                  <v-list-tile-sub-title>
                    <span>Tamboréu: {{ report.arrecadacao.selosQtd.selosFisicos.tamboreu[0]["sum(`fluxos`.`valor`)"] + report.arrecadacao.selosQtd.selosDigitais.tamboreu[0]["sum(`fluxos`.`valor`)"] || 0 }} selos</span>
                  </v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action>{{ report.arrecadacao.selosQtd.selosFisicos.total[0]["sum(`fluxos`.`valor`)"] + report.arrecadacao.selosQtd.selosDigitais.total[0]["sum(`fluxos`.`valor`)"] || 0 }} selos</v-list-tile-action>
              </v-list-tile>
              <v-divider class="my-2" inset></v-divider>
              <v-list-tile>
                <v-list-tile-content class="ml-3">
                  <v-list-tile-title>Digitais</v-list-tile-title>
                  <v-list-tile-sub-title>
                    <span>P1: {{ report.arrecadacao.selosQtd.selosDigitais.p1[0]["sum(`fluxos`.`valor`)"] || 0 }} selos digitais</span>
                  </v-list-tile-sub-title>
                  <v-list-tile-sub-title>
                    <span>P3: {{ report.arrecadacao.selosQtd.selosDigitais.p3[0]["sum(`fluxos`.`valor`)"] || 0 }} selos digitais</span>
                  </v-list-tile-sub-title>
                  <v-list-tile-sub-title>
                    <span>Tamboréu: {{ report.arrecadacao.selosQtd.selosDigitais.tamboreu[0]["sum(`fluxos`.`valor`)"] || 0 }} selos digitais</span>
                  </v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action>{{ report.arrecadacao.selosQtd.selosDigitais.total[0]["sum(`fluxos`.`valor`)"] || 0 }} selos digitais</v-list-tile-action>
              </v-list-tile>
              <v-divider class="my-2" inset></v-divider>
              <v-list-tile>
                <v-list-tile-content class="ml-3">
                  <v-list-tile-title>Físicos</v-list-tile-title>
                  <v-list-tile-sub-title>
                    <span>P1: {{ report.arrecadacao.selosQtd.selosFisicos.p1[0]["sum(`fluxos`.`valor`)"] || 0 }} selos físicos</span>
                  </v-list-tile-sub-title>
                  <v-list-tile-sub-title>
                    <span>P3: {{ report.arrecadacao.selosQtd.selosFisicos.p3[0]["sum(`fluxos`.`valor`)"] || 0 }} selos físicos</span>
                  </v-list-tile-sub-title>
                  <v-list-tile-sub-title>
                    <span>Tamboréu: {{ report.arrecadacao.selosQtd.selosFisicos.tamboreu[0]["sum(`fluxos`.`valor`)"] || 0 }} selos físicos</span>
                  </v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action>{{ report.arrecadacao.selosQtd.selosFisicos.total[0]["sum(`fluxos`.`valor`)"] || 0 }} selos físicos</v-list-tile-action>
              </v-list-tile>
            </v-list>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex xs12>
        <v-card>
          <v-card-title primary class="title">Histórico de caixas</v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="report.caixas.historicoCaixas"
              no-data-text="Não há caixas para serem exibidos"
              rows-per-page-text="Caixas por página"
              :rows-per-page-items="[25, 50, 100, {'text':'Todos','value':-1}]"
            >
              <template v-slot:items="props">
                <td class="text-xs-center">Caixa #{{props.item.id}}</td>
                <td class="text-xs-center">{{props.item.operadorInicial}}</td>
                <td class="text-xs-center">{{props.item.operadorFinal}}</td>
                <td class="text-xs-center">{{props.item.saldoInicial | formatPrice}}</td>
                <td class="text-xs-center">{{props.item.saldoFinalBruto | formatPrice}}</td>
                <td class="text-xs-center">{{props.item.saldoFinalReal | formatPrice}}</td>
                <td class="text-xs-center">{{props.item.montanteRetirado | formatPrice}}</td>
                <td class="text-xs-center">{{props.item.estado ? 'Fechado' : 'Aberto'}}</td>
                <td class="text-xs-center">{{props.item.created_at | formatDate}}</td>
                <td
                  class="text-xs-center"
                >{{props.item.estado ? props.item.updated_at : null | formatDate}}</td>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex xs12>
        <v-card>
          <v-card-title primary class="title">Caixa consolidado</v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="report.caixas.historicoCaixasConsolidados"
              no-data-text="Não há dados para serem exibidos"
              rows-per-page-text="Caixas por página"
              :rows-per-page-items="[25, 50, 100, {'text':'Todos','value':-1}]"
            >
              <template v-slot:items="props">
                <td class="text-xs-center">Caixa consolidado</td>
                <td class="text-xs-center">Diversos</td>
                <td class="text-xs-center">Diversos</td>
                <td class="text-xs-center">{{props.item["sum(`saldoInicial`)"] | formatPrice}}</td>
                <td class="text-xs-center">{{props.item["sum(`saldoFinalBruto`)"] | formatPrice}}</td>
                <td class="text-xs-center">{{props.item["sum(`saldoFinalReal`)"] | formatPrice}}</td>
                <td class="text-xs-center">{{props.item["sum(`montanteRetirado`)"] | formatPrice}}</td>
                <td class="text-xs-center">Fechado</td>
                <td class="text-xs-center">{{ date1 | formatDate }}</td>
                <td class="text-xs-center">{{ date2 | formatDate }}</td>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import PageTitle from '@/components/template/PageTitle'

export default {
  name: 'Relatorios',
  components: { PageTitle },
  data() {
    return {
      date1: new Date().toISOString().substr(0, 10),
      date2: new Date().toISOString().substr(0, 10),
      modal1: false,
      modal2: false,
      report: null,
      headers: [
        {
          text: 'Caixa',
          value: 'caixa'
        },
        { text: 'Operador inicial', value: 'Operador inicial' },
        { text: 'Operador final', value: 'Operador final' },
        { text: 'Saldo inicial', value: 'Saldo inicial' },
        { text: 'Saldo final bruto', value: 'Saldo final bruto' },
        { text: 'Saldo final real', value: 'Saldo final real' },
        { text: 'Montante retirado', value: 'Montante retirado' },
        { text: 'Estado', value: 'Estado' },
        { text: 'Abertura', value: 'Abertura' },
        { text: 'Fechamento', value: 'Fechamento' }
      ]
    }
  },
  methods: {
    consult(print, modulo = 'ma') {
      this.$api(`reports/${this.date1}/${this.date2}`)
        .then(res => {
          this.report = {}
          this.report.caixas = res.data.caixas
          this.report.movimentacaoPessoas = res.data.movimentacaoPessoas
          this.report.movimentacaoVeiculos = res.data.movimentacaoVeiculos
          this.report.arrecadacao = res.data.arrecadacao
          if (print) {
            this.report.date1 = this.date1
            this.report.date2 = this.date2
            window.sendToElectron(this.report, modulo)
          }
        })
        .catch(err => {
          this.$store.commit('snackbar/showMessage', {
            text: err.response.data,
            color: 'error'
          })
        })
    }
  }
}
</script>

<style>
</style>
