const {
  EmbedBuilder,
  PermissionsBitField
} = require("discord.js");
let yoklama = require("../../models/yoklama");
let sunucuayar = require("../../models/sunucuayar");

module.exports.run = async (client, message, args, durum, kanal) => {
  if (!message.guild) return;

  if (message.member.permissions.has(PermissionsBitField.Flags.Administrator) || durum) {

    let sec = args[0];

    let sData = await sunucuayar.findOne({
      guildID: message.guild.id
    });
    let yetkiliRol = sData.EnAltYetkiliRol;
    let rol = message.guild.roles.cache.get(yetkiliRol);
    const voiceChannel = message.member.voice.channel;
    if (voiceChannel.members.size < 1) return message.reply("Bu komut için ses kanalında en az 1 kişi olmalı.");

    let loading = await message.channel.send("Toplantı başlıyor...");
    let data = await yoklama.findOne({ guildID: message.guild.id }) || { Katılanlar: [], Katılmayanlar: [] };
    let seste_olanlar = rol.members.filter(member => member.roles.cache.has(yetkiliRol) && member.voice.channelId == voiceChannel.id);
    let seste_olmayanlar = rol.members.filter(member => member.roles.cache.has(yetkiliRol) && (!member.voice.channel || member.voice.channelId !== voiceChannel.id));

    seste_olanlar.forEach(async veri => {
      if (data.Katılanlar.includes(veri.id)) return;
      if (data.Katılmayanlar.includes(veri.id)) {
        return yoklama.updateOne(
          { guildID: message.guild.id },
          { $pull: { Katılmayanlar: veri.id } },
          { upsert: true, setDefaultsOnInsert: true }
        ).exec();
      }
      yoklama.updateOne(
        { guildID: message.guild.id },
        { $push: { Katılanlar: veri.id } },
        { upsert: true, setDefaultsOnInsert: true }
      ).exec();
    });

    seste_olmayanlar.forEach(async veri => {
      if (data.Katılmayanlar.includes(veri.id)) return;
      if (data.Katılanlar.includes(veri.id)) {
        return yoklama.updateOne(
          { guildID: message.guild.id },
          { $pull: { Katılanlar: veri.id } },
          { upsert: true, setDefaultsOnInsert: true }
        ).exec();
      }
      yoklama.updateOne(
        { guildID: message.guild.id },
        { $push: { Katılmayanlar: veri.id } },
        { upsert: true, setDefaultsOnInsert: true }
      ).exec();
    });

    let embed = new EmbedBuilder()
      .setColor("Random")
      .setTimestamp()
      .setFooter({ text: client.ayarlar.footer })
      .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) });

    loading.delete();
    await message.channel.send({ embeds: [embed.setDescription(`Önceki Toplantı: ${data.Katılanlar.length}
Bu Toplantı: ${seste_olanlar.size}

Bu Toplantıya Katılanlar (${seste_olanlar.size})
${seste_olanlar.map(x => `<@${x.id}>`).splice(0, 60).join(", ")}${seste_olanlar.size > 60 ? "...ve daha fazla" : ""}`)] }).then(async x => {

      let embed2 = new EmbedBuilder()
        .setColor("Random")
        .setTimestamp()
        .setFooter({ text: client.ayarlar.footer })
        .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) });

      await message.channel.send({ embeds: [embed2.setDescription(`Bu Toplantıya Katılmayanlar: (${seste_olmayanlar.size})

${seste_olmayanlar.map(x => `<@${x.id}>`).splice(0, 60).join(", ")}${seste_olmayanlar.size > 60 ? "...ve daha fazla" : ""}`)] });
    });
  } else return;
}

exports.conf = {
  aliases: ["toplantı"]
};

exports.help = {
  name: 'yoklama'
};
