module.exports = async message => {
  if (message.channel.isDMBased()) return;
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

  if (cmd) {
    try {
      await cmd.run(client, message, params);
    } catch (error) {
      console.error(`Error executing command ${command}:`, error);
    }
  }
};
