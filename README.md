# Controle de Estacionamento

Sistema para controle do estacionamento do Parque São Jorge

## Começando

Estas instruções vão te prover uma cópia do sistema rodando localmente para desenvolvimento e testes. Veja deployment para consultar como realizar o deploy do sistema.

### Pré-requisitos

O que você precisa para instalar o sistema localmente

* [Docker](https://docs.docker.com/) - Plataforma Open Source que facilita a criação e administração de ambientes isolados
* [Docker Compose](https://docs.docker.com/compose/) - Orquestrador de containers
* [NPM](https://www.npmjs.com/) - Gerenciador de dependências do sistema
* [VueJS](https://vuejs.org/v2/guide/) - Framework reativo utilizado no sistema
* [Knex](https://knexjs.org/) - Construtor de consultas SQL (Somente para atualizações no banco de dados de desenvolvimento)

### Instalando

O passo a passo de como reproduzir o sistema localmente para desenvolvimento

Instale as dependências do backend

```
$> cd ./backend/ && npm i
```

Instale as dependências do frontend

```
$> cd ./frontend/ && npm i
```

Inicie o banco de dados e o backend

```
$> docker-compose up
```

Altere o arquivo Axios.js

```
$> Alterar o baseUrl para: http://localhost:3001
```

Inicie o serviço do frontend

```
$> cd ./frontend/ && npm run serve
```

## Deployment

Notas adicionais de como realizar o deploy do sistema

Faça o build do sistema

```
docker build -t registry.gitlab.com/iptec/utils/estacionamento:AAAAMMDD-# .
```

Envie a imagem para o registry do GitLab
```
docker push registry.gitlab.com/iptec/utils/estacionamento:AAAAMMDD-#
```

## Versionamento

Utiliza-se a tag quando realizar o build do sistema. A tag é formada por [ano][mês][dia]-[número-do-build-feito-no-dia]




## Versão Mobile Instalação na Maquininha Windows 


No Command Prompt, instalar o **Chocolatey** (windows)

verificar se você possui permissões para instalar dependências com o terminal com o comando **Get-ExecutionPolicy**

Se o retorno desse comando for “**Restricted**” 

execute o próximo comando **Set-ExecutionPolicy AllSigned**

Agora, execute o seguinte comando para instalar o Chocolatey:
**Set-ExecutionPolicy Bypass -Scope Process -Force; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))**

Agora, teste se a instalação ocorreu corretamente executando o seguinte comando no seu terminal: choco

Instalar o Node, Python2 e a JDK8 (Java Development Kit 8):
**choco install -y nodejs.install python2 jdk8**


Instalar o CLI (Command Line Interface) do React Native que nos ajudará na criação e teste de novos projetos.
Nesse passo você provavelmente deve reiniciar seu terminal para o comando funcionar.
**npm install -g react-native-cli**


Se tudo ocorreu bem até aqui, você conseguirá executar o seguinte comando:
**react-native -h**

Configurando SDK do Android no Windows

Crie uma pasta em um local desejado para instalação da SDK. Ex: **C:\Android\Sdk**

Acesse **https://developer.android.com/studio/#downloads**, baixe a SDK referente ao seu sistema operacional.


no Painel de Controle do Windows, abra o item “Sistema e Segurança” ou “Sistema”, clique em “Configurações avançadas do sistema”, 
selecione “Variáveis de ambiente” e clique no botão “Nova variável de ambiente”,indique o nome da variável como **ANDROID_HOME**, 
adicione o caminho utilizado acima **(Ex: C:\Android\Sdk)** como segundo parâmetro e clique em OK.

Na mesma janela de "Variáveis de ambiente" no Windows, clique na variável PATH e então em "Editar". 
Haverá uma lista de caminhos e você deve adicionar esses dois novos caminhos no fim da lista:

**%ANDROID_HOME%\platform-tools**
**%ANDROID_HOME%\tools**



No seu Command Prompt ou PowerShell como administrador e execute o seguinte comando:
**C:\Android\Sdk\tools\bin\sdkmanager  "platform-tools" "platforms;android-27" "build-tools;27.0.3"**

Com tudo instalado, abra o projeto no Android Studio dentro do diretório mobile.

Conecte o dispositivo via USB 

Verifique se o dispisitivo está sendo reconhecido com o comando dento do **%USERPROFILE%\AppData\Local\Android\sdk\platform-tools**
**adb devices**

Dentro do diretório mobile no cmd digite os seguintes comandos:
**npm start**

após comando estar OK digitar o comando: 
**react-native run-android**






