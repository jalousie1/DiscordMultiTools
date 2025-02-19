const { colorful, colors } = require('../utils/colors');
const banner = require('../utils/banner');
const axios = require('axios');

const getFriends = async (client) => {
  try {
    const res = await axios.get('https://discord.com/api/v9/users/@me/relationships', {
      headers: {
        'Authorization': client.token,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    return res.data.filter(user => user.type === 1); // Type 1 = Friend
  } catch (error) {
    console.log(colorful(colors.red, `     [!] Erro ao buscar amigos: ${error}`));
    return [];
  }
};

const clearDmFriends = async (rl, client, settings, showMenu) => {
  console.clear();
  console.log(colorful(colors.blue, banner));
  console.log(colorful(colors.blue, '     [x] Limpando DMs de Amigos...'));

  const friends = await getFriends(client);
  const whitelistSet = new Set(settings.whitelist);
  let totalDeleted = 0;
  let processedFriends = 0;

  if (friends.length === 0) {
    console.log(colorful(colors.blue, '     [=] Nenhum amigo encontrado.'));
    setTimeout(showMenu, 2000);
    return;
  }

  for (const friend of friends) {
    if (whitelistSet.has(friend.id)) {
      console.log(colorful(colors.yellow, `     [=] Amigo ${friend.user.username} está na whitelist, pulando...`));
      processedFriends++;
      continue;
    }

    try {
      const dm = await client.users.cache.get(friend.id)?.createDM();
      if (!dm) continue;

      let lastId = null;
      let messagesDeleted = 0;

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
              messagesDeleted++;
              totalDeleted++;
              process.stdout.clearLine(0);
              process.stdout.cursorTo(0);
              process.stdout.write(colorful(colors.green, 
                `     [+] ${friend.user.username}: ${messagesDeleted} mensagens deletadas (Total: ${totalDeleted})`
              ));
              await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit
            } catch (error) {
              console.log(colorful(colors.red, `\n     [!] Erro ao deletar mensagem: ${error}`));
            }
          }
          lastId = message.id;
        }
      }

      processedFriends++;
      if (messagesDeleted > 0) {
        console.log(colorful(colors.green, 
          `\n     [✓] ${friend.user.username}: ${messagesDeleted} mensagens deletadas`
        ));
      }

    } catch (error) {
      console.log(colorful(colors.red, `\n     [!] Erro ao processar DM de ${friend.user.username}: ${error}`));
    }
  }

  console.log(colorful(colors.green, 
    `\n     [✓] Processo finalizado! ${totalDeleted} mensagens deletadas de ${processedFriends} amigos.`
  ));
  setTimeout(showMenu, 3000);
};

module.exports = { clearDmFriends };
