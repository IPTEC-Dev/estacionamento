
# Script de migração de estrutura de dados

Para executar o script, instale as dependências com o seguinte comando:
```js
$> npm install
```

---
Em seguida, trunque todas as tabelas do banco de dados "novo_estacionamento", que está no servidor SCCP58.
Os dados de acesso para o novo banco de dados são:
- __Usuário__: novo_estacionamento
- __Senha__: Mesma senha do banco de dados em produção do estacionamento. A senha pode ser encontrada no PWD

---
Em seguida, configure as credenciais de acesso aos bancos de dados no arquivo __./knexfile.js__.

---
Em seguida, execute a migration para gerar a estrutura do banco de dados com o seguinte comando:
```js
$> npm run migrate:staging
```
---
Após gerar a estrutura do banco de dados, execute a migração do script com:
```js
$> npm run start
```
---
## Como rodar o script em ambiente de desenvolvimento?

Configure o banco de dados development no arquivo __./knexfile.js__.

---

Ao invés de executar o comando 
```js
$> npm run migrate:staging
```
para gerar a estrutura de dados no banco, execute
```js
$> npm run migrate:development
```
para gerar a estrutura de dados no banco local.

---
Substitua a variável __stagingDatabase__ por __developmentDatabase__ no corpo do script.

---

## Como ativar o modo Debug?

Para ativar o modo debug (irá lhe fornecer informações detalhadas sobre todas as ações realizadas no banco de dados), edite a variável __debugMode__ no arquivo __./index.js__.

Após ativar o modo Debug, basta executar o script.