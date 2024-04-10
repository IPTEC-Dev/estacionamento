const { remote } = require("electron");

window.ipc = function (data, modulo) {
  remote.app.printUsingElectron(data, modulo);
};
