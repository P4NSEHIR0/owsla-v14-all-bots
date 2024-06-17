const { EmbedBuilder } = require("discord.js");
let ekipKomut = require("../../models/ekip");
let sunucuayar = require("../../models/sunucuayar");

module.exports.run = async (client, message, args, durum, kanal) => {
  if (!message.guild) return;

  let sunucuData = await sunucuayar.findOne({ guildID: message.guild.id });
  if (durum || sunucuData.GKV.includes(message.author.id) || message.author.id == message.guild.ownerId || client.ayarlar.sahip.includes(message.author.id)) {
    let sec = args[0];
    if (["oluştur"].includes(sec)) {
      let rol = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
      if (!rol) return message.reply("Lütfen bir rol etiketleyin veya rol ID'si girin.");
      let ekipKomutDATA = await ekipKomut.findOne({ guildID: message.guild.id, ekipRol: rol.id });
      if (ekipKomutDATA) return message.reply("Bu isimde zaten bir ekip mevcut");
      let newData = new ekipKomut({ guildID: message.guild.id, ekipRol: rol.id });
      newData.save();
      message.channel.send("Başarılı");
    }

    if (["sil"].includes(sec)) {
      let rol = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
      if (!rol) return message.reply("Lütfen bir ekip rolü giriniz");
      let ekipKomutDATA = await ekipKomut.findOne({ guildID: message.guild.id, ekipRol: rol.id });
      if (!ekipKomutDATA) return message.reply("Bu isimde bir ekip mevcut değil");
      await ekipKomut.deleteOne({ guildID: message.guild.id, ekipRol: rol.id });
      message.reply(`Başarılı bir şekilde ${rol} ekibini sildim.`);
    }

    if (["bak"].includes(sec)) {
      let rol = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
      if (!rol) return message.reply("Lütfen bir ekip rolü giriniz.");
      let data2 = await ekipKomut.findOne({ guildID: message.guild.id, ekipRol: rol.id });
      if (!data2) return;

      let mesaj = new EmbedBuilder()
        .setColor("RANDOM")
        .setTimestamp()
        .setFooter({ text: client.ayarlar.footer })
        .setAuthor({ name: message.author.tag, iconURL: message.author.avatarURL({ dynamic: true }) })
        .addFields(
          { name: `Ekip üyeleri (${rol.members.size} kişi)`, value: `${rol.members.size < 50 ? rol.members.map(x => `${x} [\`${x.displayName}\`] (\`${x.id}\`)`).join("\n") : "100'den fazla kişi olduğu için listeleyemiyorum."}` },
          { name: `Seste olan üyeler (${rol.members.filter(x => x.voice.channel).size} kişi)`, value: `${rol.members.filter(x => x.voice.channel).size < 10 ? rol.members.filter(x => x.voice.channel).map(x => `${x} [\`${x.displayName}\`] (\`${x.id}\`)`).join("\n") : "100'dan fazla kişi olduğu için listeleyemiyorum."}` }
        );

      message.channel.send({ embeds: [mesaj] });
      message.channel.send("Aktif olmayanları etiketlemek için");
      message.channel.send(rol.members.filter(x => !x.voice.channel && x.presence?.status !== "offline").map(x => `(<@${x.id}>)`).join(", "), { split: true });
    }

    if (!sec) {
      let loading = await message.channel.send("Veriler yükleniyor...");
      let data = await ekipKomut.find({ guildID: message.guild.id });
      let totalAktif = 0;
      let totalSesteki = 0;
      let totalUnSesteki = 0;
      let tümYetkililer = 0;
      let tagAlanlar = 0;
      let göster = data.length > 0 ? data.map((veri) => {
        tagAlanlar += message.guild.roles.cache.get(veri.ekipRol).members.filter(member => member.user.username.includes(sunucuData.TAG)).size;
        tümYetkililer += message.guild.roles.cache.get(veri.ekipRol).members.size;
        totalAktif += message.guild.roles.cache.get(veri.ekipRol).members.filter(x => x.presence?.status !== "offline").size;
        totalSesteki += message.guild.roles.cache.get(veri.ekipRol).members.filter(x => x.presence?.status !== "offline" && x.voice.channel).size;
        totalUnSesteki += message.guild.roles.cache.get(veri.ekipRol).members.filter(x => x.presence?.status !== "offline" && !x.voice.channel).size;
        return {
          Mesaj: `<@&${veri.ekipRol}> **Ekip Bilgileri**

Toplam Üye: \`${message.guild.roles.cache.get(veri.ekipRol).members.size} kişi\`
Taglı Üye: \`${message.guild.roles.cache.get(veri.ekipRol).members.filter(member => member.user.username.includes(sunucuData.TAG)).size} kişi\`
Çevrimiçi Üye: \`${message.guild.roles.cache.get(veri.ekipRol).members.filter(x => x.presence?.status !== "offline").size} kişi\`
Sesteki Üye: \`${message.guild.roles.cache.get(veri.ekipRol).members.filter(x => x.voice.channel).size} kişi\`
Seste Olmayan Üye: \`${message.guild.roles.cache.get(veri.ekipRol).members.filter(x => !x.voice.channel && x.presence?.status !== "offline").size} kişi\`
─────────────────────`
        };
      }).map(x => `${x.Mesaj}`).join("\n") : "Veri yoktur.";

      loading.delete();
      message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor("RANDOM")
            .setAuthor({ name: message.author.tag, iconURL: message.author.avatarURL({ dynamic: true }) })
            .setTimestamp()
            .setFooter({ text: client.ayarlar.footer })
            .setDescription(`
Aşağıdaki ekip üyelerini'ı daha detaylı bir şekilde görmek için aşağıdaki komutu yazınız.
\`.ekip bak @ekiprol\`
─────────────────────
Toplam Üyeler: \`${tümYetkililer} kişi\`
Toplam Taglılar: \`${tagAlanlar} kişi\`
Çevrimiçi Üyeler: \`${totalAktif} kişi\`
Sesteki Üyeler: \`${totalSesteki} kişi\`
Seste Olmayan Üyeler: \`${totalUnSesteki} kişi\`
─────────────────────
${göster}`)
        ]
      });
    }
  } else return;
};

exports.conf = {
  aliases: ["ekip"],
};

exports.help = {
  name: "Ekip",
};
