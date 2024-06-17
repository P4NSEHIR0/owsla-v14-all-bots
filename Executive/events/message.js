module.exports = async (message) => {
  if (message.author.bot) return;
  const client = message.client;
  if (message.channel.type === ChannelType.DM) return;

  const prefixes = client.ayarlar.prefix;
  const prefix = prefixes.find(p => message.content.startsWith(p));
  if (!prefix) return;

  const command = message.content.split(' ')[0].slice(prefix.length);
  const params = message.content.split(' ').slice(1);
  let cmd;

  if (client.commands.has(command)) {
    cmd = client.commands.get(command);
  } else if (client.aliases.has(command)) {
    cmd = client.commands.get(client.aliases.get(command));
  }

  if (!cmd) return;

  const arr = cmd ? [...cmd.conf.aliases, cmd.help.name] : ['yok'];
  const data = await client.db.find({ guildID: message.guild.id });
  const veri = data.find(veri => arr.includes(veri.komutAd)) || { komutAd: 'yok', kisiler: [], roller: [] };
  
  const durum = veri.kisiler.includes(message.member.id) || 
                message.member.roles.cache.some(rol => veri.roller.includes(rol.id)) || 
                client.ayarlar.sahip.includes(message.author.id) || 
                message.member.permissions.has('ADMINISTRATOR');

  const kanal = !client.ayarlar.commandChannel.includes(message.channel.name) && 
                !message.member.permissions.has('ADMINISTRATOR') && 
                !message.member.permissions.has('MANAGE_CHANNELS') && 
                !message.member.permissions.has('MANAGE_ROLES');

  if (cmd) {
    cmd.run(client, message, params, durum, kanal);
  }
};
