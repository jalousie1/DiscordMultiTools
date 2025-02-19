const { colorful, colors } = require('../utils/colors');
const banner = require('../utils/banner');

const clearAllDMs = async (rl, client, settings, showMenu) => {
  console.clear();
  console.log(colorful(colors.blue, banner));
  console.log(colorful(colors.blue, '     [x] Limpando todas as DMs abertas...'));

  const dms = client.channels.cache.filter(channel => channel.type === 'DM');
  const whitelistSet = new Set(settings.whitelist);
  const total = dms.size;
  let processedDMs = 0;
  let totalDeleted = 0;

  if (dms.size === 0) {
    console.log(colorful(colors.blue, '     [=] Não há DMs abertas.'));
    setTimeout(showMenu, 2000);
    return;
  }

  for (const dm of dms.values()) {
    if (whitelistSet.has(dm.recipient?.id)) {
      console.log(colorful(colors.yellow, `     [=] DM com ${dm.recipient.username} está na whitelist, pulando...`));
      processedDMs++;
      continue;
    }

    let lastId = null;
    let messagesDeleted = 0;

    while (true) {
      try {
        const messages = await dm.messages.fetch({
          limit: 100,
          ...(lastId && { before: lastId })
        });

        if (messages.size === 0) break;

        for (const message of messages.values()) {
          if (message.author.id === client.user.id && !message.system) {
            try {
              await message.delete();
              messagesDeleted++;
              totalDeleted++;
              process.stdout.clearLine(0);
              process.stdout.cursorTo(0);
              process.stdout.write(colorful(colors.green, 
                `     [+] ${dm.recipient.username}: ${messagesDeleted} mensagens deletadas (Total: ${totalDeleted})`
              ));
              await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit protection
            } catch (error) {
              console.log(colorful(colors.red, `\n     [!] Erro ao deletar mensagem: ${error}`));
            }
          }
          lastId = message.id;
        }
      } catch (error) {
        console.log(colorful(colors.red, `\n     [!] Erro ao buscar mensagens: ${error}`));
        break;
      }
    }

    processedDMs++;
    if (messagesDeleted > 0) {
      console.log(colorful(colors.green, 
        `\n     [✓] ${dm.recipient.username}: ${messagesDeleted} mensagens deletadas`
      ));
    }
  }

  console.log(colorful(colors.green, 
    `\n     [✓] Processo finalizado! ${totalDeleted} mensagens deletadas de ${processedDMs} DMs.`
  ));
  
  if (typeof showMenu === 'function') {
    setTimeout(showMenu, 3000);
  }
};

module.exports = { clearAllDMs };
