module.exports = async message => {
  if (!message.guild) return;
  if (message.author.bot) return;

  let client = message.client;
  const prefixes = client.ayarlar.prefix;
  const prefix = prefixes.find(p => message.content.startsWith(p));
  if (!prefix) return;

  let command = message.content.slice(prefix.length).trim().split(/ +/g)[0];
  let params = message.content.slice(prefix.length).trim().split(/ +/g).slice(1);
  let cmd;

  if (client.commands.has(command)) {
    cmd = client.commands.get(command);
  } else if (client.aliases.has(command)) {
    cmd = client.commands.get(client.aliases.get(command));
  }

  let arr = cmd ? cmd.conf.aliases : [];
  if (cmd) arr.push(cmd.help.name);

  let data = await client.db.find({ guildID: message.guild.id });
  let veri = data.find(veri => arr.includes(veri.komutAd)) || { komutAd: "yok", kisiler: [], roller: [] };

  let durum = veri.kisiler.includes(message.member.id) || 
              message.member.roles.cache.some(rol => veri.roller.includes(rol.id)) || 
              client.ayarlar.sahip.includes(message.author.id) || 
              message.member.permissions.has('Administrator');

  let kanal = !client.ayarlar.commandChannel.includes(message.channel.name) && 
              !message.member.permissions.has('Administrator') && 
              !message.member.permissions.has('ManageChannels') && 
              !message.member.permissions.has('ManageRoles');

  if (cmd) {
    try {
      await cmd.run(client, message, params, durum, kanal);
    } catch (error) {
      console.error(`Error executing command ${command}:`, error);
    }
  }
};
