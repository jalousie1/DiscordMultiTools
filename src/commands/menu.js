const { colorful, colors } = require('../utils/colors');
const banner = require('../utils/banner');
const { clearDm } = require('./clearDm');
const { showAccountMenu, addAccount } = require('./accountManager');
const { closeDMs } = require('./closeDMs');
const { cloneServer } = require('./cloneServer');
const { removeServers } = require('./removeServers');
const { clearDmFriends } = require('./clearDmFriends');
const { showWhitelistMenu } = require('./whitelist');
const { removeFriends } = require('./removeFriends');
const { clearAllDMs } = require('./clearAllDMs');
const { exportChat } = require('./chatExport');
const { loadAccountSettings } = require('../utils/settings');

const showMenu = (rl, client, loggedInUser, settings) => {
  console.clear();
  console.log(colorful(colors.blue, banner));
  console.log(colorful(colors.blue, `     [=] Bem-vindo, ${loggedInUser}!`));
  console.log(colorful(colors.blue, '     [=] Escolha uma função:'));
  console.log("");
  console.log(colorful(colors.green, '     [1] Limpar DM.'));
  console.log(colorful(colors.green, '     [2] Limpar todas as DMs abertas.'));
  console.log(colorful(colors.green, '     [3] Limpar DM de Amigos.'));
  console.log(colorful(colors.green, '     [4] Remover Amizades.'));
  console.log(colorful(colors.green, '     [5] Clonar servidor. (Sem perm em canais)'));
  console.log(colorful(colors.green, '     [6] Remover Servidores.'));
  console.log(colorful(colors.green, '     [7] Fechar todas as DMs.'));
  console.log(colorful(colors.green, '     [8] Gerenciar Contas'));
  console.log(colorful(colors.green, '     [9] Gerenciar Whitelist'));
  console.log(colorful(colors.green, '     [10] Exportar Chat'));
  console.log(colorful(colors.green, '     [11] Adicionar Nova Conta'));
  console.log(colorful(colors.green, '     [0] Fechar.'));
  console.log("");

  rl.question('     [-] Escolha: ', (choice) => {
    const showMenuCallback = () => showMenu(rl, client, loggedInUser, settings);
    switch (choice) {
      case '1':
        clearDm(rl, client, settings, showMenuCallback);
        break;
      case '2':
        clearAllDMs(rl, client, settings, showMenuCallback);
        break;
      case '3':
        clearDmFriends(rl, client, settings, showMenuCallback);
        break;
      case '4':
        removeFriends(rl, client, settings, showMenuCallback);
        break;
      case '5':
        cloneServer(rl, client, showMenuCallback);
        break;
      case '6':
        removeServers(rl, client, settings, showMenuCallback);
        break;
      case '7':
        closeDMs(rl, client, settings, showMenuCallback);
        break;
      case '8':
        showAccountMenu(rl, client, () => {
          const updatedSettings = loadAccountSettings(loggedInUser);
          showMenu(rl, client, loggedInUser, updatedSettings);
        });
        break;
      case '9':
        showWhitelistMenu(rl, client, settings, showMenuCallback);
        break;
      case '10':
        exportChat(rl, client, showMenuCallback);
        break;
      case '11':
        addAccount(rl, client, () => {
          const updatedSettings = loadAccountSettings(loggedInUser);
          showMenu(rl, client, loggedInUser, updatedSettings);
        });
        break;
      case '0':
        console.log('Saindo...');
        process.exit(0);
        break;
      default:
        console.log('Opção inválida!');
        setTimeout(showMenuCallback, 2000);
    }
  });
};

module.exports = { showMenu };
