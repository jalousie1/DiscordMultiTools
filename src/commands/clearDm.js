const { colorful, colors } = require('../utils/colors');
const banner = require('../utils/banner');

const clearDm = async (rl, client, settings, showMenuCallback) => {
  console.clear();
  console.log(colorful(colors.blue, banner));
  console.log(colorful(colors.blue, '     [x] Limpando DM...'));
  
  rl.question('     [-] ID do usuário: ', async (userId) => {
    try {
      const user = await client.users.fetch(userId);
      if (!user) {
        console.log(colorful(colors.red, '     [x] Usuário não encontrado!'));
        if (typeof showMenuCallback === 'function') {
          setTimeout(showMenuCallback, 2000);
        }
        return;
      }

      const dm = await user.createDM();
      let lastId = null;
      let totalDeleted = 0;

      while (true) {
        const messages = await dm.messages.fetch({
          limit: 100,
          ...(lastId && { before: lastId })
        });

        if (messages.size === 0) break;

        for (const message of messages.values()) {
          if (message.author.id === client.user.id && !message.system) {
            try {
              await message.delete();
              totalDeleted++;
              process.stdout.clearLine(0);
              process.stdout.cursorTo(0);
              process.stdout.write(colorful(colors.green, `     [+] Mensagens deletadas: ${totalDeleted}`));
              await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit protection
            } catch (error) {
              console.log(colorful(colors.red, `\n     [!] Erro ao deletar mensagem: ${error}`));
            }
          }
          lastId = message.id;
        }
      }

      console.log(colorful(colors.green, `\n     [✓] Limpeza concluída! ${totalDeleted} mensagens deletadas.`));
      
      if (typeof showMenuCallback === 'function') {
        setTimeout(showMenuCallback, 3000);
      }

    } catch (error) {
      console.log(colorful(colors.red, `     [x] Erro: ${error}`));
      if (typeof showMenuCallback === 'function') {
        setTimeout(showMenuCallback, 3000);
      }
    }
  });
};

module.exports = { clearDm };
