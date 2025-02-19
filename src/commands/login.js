const { colorful, colors } = require('../utils/colors');
const banner = require('../utils/banner');
const { saveAccount, loadAccounts, updateLastUsed } = require('../utils/accountManager');

const addAccount = async (rl, client, showMenu) => {
  try {
    const token = client.token;
    await client.login(token);
    const username = client.user.username;
    
    // Save account to file
    saveAccount(username, token);
    console.log(colorful(colors.green, '     [✓] Conta adicionada com sucesso!'));
    return true;
  } catch (err) {
    console.log(colorful(colors.red, '     [x] Token inválido'));
    return false;
  }
};

const selectAccount = (rl, client, showMenu) => {
  const accounts = loadAccounts();
  
  console.clear();
  console.log(colorful(colors.blue, banner));
  console.log(colorful(colors.blue, '\n     [=] Seleção de Contas'));
  console.log(colorful(colors.blue, '     ──────────────────────'));
  
  // Lista de contas
  for (let i = 0; i < accounts.length; i++) {
    console.log(colorful(colors.green, `     [${i + 1}] ${accounts[i].username}`));
  }
  
  console.log(colorful(colors.blue, '     ──────────────────────'));
  process.stdout.write(colorful(colors.yellow, '     [0] Adicionar nova conta\n\n'));

  rl.question('     [-] Escolha uma opção: ', async (index) => {
    if (index === '0') {
      console.log(colorful(colors.blue, '     [x] Adicionando nova conta...'));
      rl.question('     [-] Token da conta: ', async (token) => {
        client.token = token;
        if (await addAccount(rl, client, showMenu)) {
          showMenu(client.user.username);
        } else {
          setTimeout(() => selectAccount(rl, client, showMenu), 2000);
        }
      });
      return;
    }

    const i = parseInt(index) - 1;
    if (i >= 0 && i < accounts.length) {
      const account = accounts[i];
      
      client.login(account.token).then(() => {
        updateLastUsed(account.username);
        console.log(colorful(colors.green, `     [✓] Logado como ${account.username}!`));
        setTimeout(() => showMenu(account.username), 2000);
      }).catch(() => {
        console.log(colorful(colors.red, '     [x] Erro ao fazer login'));
        setTimeout(() => selectAccount(rl, client, showMenu), 2000);
      });
    } else {
      console.log(colorful(colors.red, '     [x] Opção inválida'));
      setTimeout(() => selectAccount(rl, client, showMenu), 2000);
    }
  });
};

const loginClient = (rl, client, showMenu) => {
  const accounts = loadAccounts();
  
  if (accounts.length === 0) {
    console.clear();
    console.log(colorful(colors.blue, banner));
    console.log(colorful(colors.blue, '     [x] Nenhuma conta encontrada. Adicione uma conta.'));
    rl.question('     [-] Token da conta: ', async (token) => {
      client.token = token;
      if (await addAccount(rl, client, showMenu)) {
        showMenu(client.user.username);  // Changed to pass only username
      } else {
        setTimeout(() => loginClient(rl, client, showMenu), 2000);
      }
    });
  } else {
    selectAccount(rl, client, showMenu);
  }
};

module.exports = { loginClient, addAccount, selectAccount };
