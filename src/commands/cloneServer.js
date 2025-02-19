const { colorful, colors } = require('../utils/colors');
const banner = require('../utils/banner');

const cloneServer = async (rl, client, callback) => {
  console.clear();
  console.log(colorful(colors.blue, banner));
  console.log(colorful(colors.blue, '     [x] Utilizando Server Cloner...'));

  const cloneChannels = async (originalGuild, newGuild) => {
    const categories = originalGuild.channels.cache.filter(c => c.type === 'GUILD_CATEGORY');
    const others = originalGuild.channels.cache.filter(c => c.type !== 'GUILD_CATEGORY');
    const categoryMap = new Map();

    // Clone categories first
    for (const [id, category] of categories) {
      try {
        const newCategory = await newGuild.channels.create(category.name, {
          type: 'GUILD_CATEGORY',
          position: category.position
        });
        categoryMap.set(id, newCategory.id);
        console.log(colorful(colors.green, `     [+] Categoria criada: ${category.name}`));
      } catch (error) {
        console.log(colorful(colors.red, `     [!] Erro ao criar categoria ${category.name}: ${error}`));
      }
    }

    // Clone other channels
    for (const [, channel] of others) {
      try {
        const channelData = {
          name: channel.name,
          type: channel.type,
          parent: categoryMap.get(channel.parentId),
          nsfw: channel.nsfw,
          bitrate: channel.bitrate,
          userLimit: channel.userLimit,
          position: channel.position,
          topic: channel.topic
        };

        await newGuild.channels.create(channel.name, channelData);
        console.log(colorful(colors.green, `     [+] Canal criado: ${channel.name}`));
        await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit protection
      } catch (error) {
        console.log(colorful(colors.red, `     [!] Erro ao criar canal ${channel.name}: ${error}`));
      }
    }
  };

  const cloneRoles = async (originalGuild, newGuild) => {
    const roles = originalGuild.roles.cache.filter(role => role.name !== '@everyone');
    
    for (const [, role] of roles) {
      try {
        await newGuild.roles.create({
          name: role.name,
          color: role.color,
          hoist: role.hoist,
          permissions: role.permissions,
          mentionable: role.mentionable,
          position: role.position
        });
        console.log(colorful(colors.green, `     [+] Cargo criado: ${role.name}`));
        await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit protection
      } catch (error) {
        console.log(colorful(colors.red, `     [!] Erro ao criar cargo ${role.name}: ${error}`));
      }
    }
  };

  rl.question('     [-] ID do servidor original: ', async (originalId) => {
    rl.question('     [-] ID do servidor destino: ', async (targetId) => {
      try {
        const originalGuild = client.guilds.cache.get(originalId);
        const targetGuild = client.guilds.cache.get(targetId);

        if (!originalGuild || !targetGuild) {
          console.log(colorful(colors.red, '     [x] Um ou ambos os servidores não foram encontrados.'));
          setTimeout(callback, 2000);
          return;
        }

        console.log(colorful(colors.blue, '     [=] Iniciando clonagem...'));

        // Update server settings
        await targetGuild.setName(originalGuild.name);
        if (originalGuild.icon) {
          await targetGuild.setIcon(originalGuild.iconURL({ dynamic: true }));
        }

        // Clear existing channels and roles
        await Promise.all([
          ...targetGuild.channels.cache.map(channel => channel.deletable ? channel.delete() : null),
          ...targetGuild.roles.cache
            .filter(role => role.name !== '@everyone' && role.editable)
            .map(role => role.delete())
        ]);

        // Clone roles and channels
        await cloneRoles(originalGuild, targetGuild);
        await cloneChannels(originalGuild, targetGuild);

        console.log(colorful(colors.green, '     [✓] Clonagem concluída com sucesso!'));
        setTimeout(callback, 3000);

      } catch (error) {
        console.log(colorful(colors.red, `     [x] Erro durante a clonagem: ${error}`));
        setTimeout(callback, 3000);
      }
    });
  });
};

module.exports = { cloneServer };
