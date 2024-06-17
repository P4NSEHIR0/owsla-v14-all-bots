const client = global.client;
const conf = client.ayarlar;
const teyit = require('../models/teyit');
const sunucuayar = require('../models/sunucuayar');

module.exports = async (member) => {
  const data2 = await sunucuayar.findOne({});
  const unregister = data2.UNREGISTER;

  if (member.roles.cache.some(role => unregister.includes(role.id))) return;

  const data = await teyit.findOne({ userID: member.id, guildID: member.guild.id });

  if (!data) return;

  data.userName.push(`\`${member.displayName}\` (Sunucudan Ayrılma)`);
  await data.save();
};
