const { EmbedBuilder } = require("discord.js");

module.exports.run = async (client, message, args, durum, kanal) => {
  if (durum) {
    const voiceChannel = message.member.voice.channelId;
    if (!voiceChannel) return message.reply("Herhangi bir ses kanalında değilsin!");

    const publicRooms = message.guild.channels.cache.filter(
      (c) => c.parentId === client.ayarlar.PUBLIC_KATEGORI && c.id !== client.ayarlar.SLEEP_ROOM && c.type === 2 // 2 represents voice channels in Discord.js v14
    );

    const members = Array.from(message.member.voice.channel.members.values());
    members.forEach((m, index) => {
      setTimeout(() => {
        if (m.voice.channelId !== voiceChannel) return;
        m.voice.setChannel(publicRooms.random().id);
      }, index * 1000);
    });

    message.reply(`\`${message.member.voice.channel.name}\` adlı ses kanalındaki üyeler rastgele public odalara dağıtılmaya başlandı!`);
  }
};

exports.conf = {
  aliases: ["dagit", "dağit"],
};

exports.help = {
  name: "dağıt",
};
