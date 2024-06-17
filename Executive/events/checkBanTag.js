const { EmbedBuilder, Client } = require('discord.js');
const moment = require('moment');
const sunucuayar = require('../models/sunucuayar');
const stat = require('../models/stats');
const Database = require('../models/invite');
const TaglıData = require('../models/taglıUye');
const ozelKomut = require('../models/özelkomut');

module.exports = async (client) => {
  let conf = client.ayarlar;
  let guild = client.guilds.cache.get(client.ayarlar.sunucuId);

  const updateTables = async () => {
    let data = await stat.find({});
    let teyitData = data.map(veri => ({
      Id: veri.userID,
      Total: veri.Man + veri.Woman,
      Erkek: veri.Man,
      Kadin: veri.Woman
    })).sort((a, b) => b.Total - a.Total).map((user, index) => 
      `\`${index + 1}.\` **${guild.members.cache.get(user.Id) ? guild.members.cache.get(user.Id).displayName : "@undefined"}** (\`Erkek: ${user.Erkek} Kadin: ${user.Kadin} Toplam: ${user.Total}\`)`
    ).splice(0, 30).join("\n");
    function getRandomColor() {
      return Math.floor(Math.random() * 16777215).toString(16);
    }
    let teyitEmbed = new EmbedBuilder()
      .setColor(`#${getRandomColor()}`)
      .setTimestamp()
      .setTitle("Teyit Tablosu")
      .setDescription(`${teyitData}\n\nBu veriler ${moment(Date.now()).locale("tr").format("LLL")} tarihinde yenilenmiştir.`);

    let teyitMessage = await client.channels.cache.get(conf.leaderboard.KanalID).messages.fetch(conf.leaderboard.mesajID);
    teyitMessage.edit({ embeds: [teyitEmbed] });

    let inviteData = await Database.find({});
    let davetGoster = inviteData.map(user => ({
      Id: user.userID,
      Total: user.bonus + user.regular,
      Regular: user.regular,
      Bonus: user.bonus,
      Fake: user.fake
    })).sort((a, b) => b.Total - a.Total).map((data, index) => 
      `\`${index + 1}.\` **${guild.members.cache.get(data.Id) ? guild.members.cache.get(data.Id).displayName : "Undefined"}** (\`Toplam: ${data.Total} Regular: ${data.Regular}\`)`
    ).splice(0, 30).join("\n");

    let davetEmbed = new EmbedBuilder()
      .setColor("RANDOM")
      .setTimestamp()
      .setTitle("Davet Tablosu")
      .setDescription(`${davetGoster}\n\nBu veriler ${moment(Date.now()).locale("tr").format("LLL")} tarihinde yenilenmiştir.`);

    let davetMessage = await client.channels.cache.get(conf.leaderboard.KanalID).messages.fetch(conf.leaderboard.mesajID_2);
    davetMessage.edit({ embeds: [davetEmbed] });

    let tagData = await TaglıData.find({ Durum: "stat" });
    let kayitcilar = {};
    tagData.forEach((value) => {
      if (kayitcilar[value.authorID]) kayitcilar[value.authorID] += 1;
      else kayitcilar[value.authorID] = 1;
    });

    let tagGoster = Object.keys(kayitcilar).sort((a, b) => kayitcilar[b] - kayitcilar[a]).map(e => ({
      User: e,
      Value: kayitcilar[e]
    })).map((user, index) => 
      `\`${index + 1}.\` **${guild.members.cache.get(user.User) ? guild.members.cache.get(user.User).displayName : "Undefined"}** \`${user.Value} Taglı.\``)
      .splice(0, 30).join("\n");

    let tagEmbed = new EmbedBuilder()
      .setColor("RANDOM")
      .setTimestamp()
      .setFooter({ text: conf.footer })
      .setTitle("Taglı Tablosu")
      .setDescription(`${tagGoster.length > 0 ? tagGoster : "Veri yoktur"}\n\nBu veriler ${moment(Date.now()).locale("tr").format("LLL")} tarihinde yenilenmiştir.`);

    let tagMessage = await client.channels.cache.get(conf.leaderboard.KanalID).messages.fetch(conf.leaderboard.mesajID_3);
    tagMessage.edit({ embeds: [tagEmbed] });

    let göster = await ozelKomut.find({ guildID: client.ayarlar.sunucuId, YetkiliROL: true });
    let arr = [];
    let ozelKomutVeri = göster.map(x => x.YetkiliData);
    ozelKomutVeri.forEach(v => v.forEach(x => arr.push(x)));

    let yetkiliciler = {};
    arr.forEach((value) => {
      if (yetkiliciler[value.Author]) yetkiliciler[value.Author] += 1;
      else yetkiliciler[value.Author] = 1;
    });

    let yetkiliGoster = Object.keys(yetkiliciler).sort((a, b) => yetkiliciler[b] - yetkiliciler[a]).splice(0, 30).map(e => ({
      User: e,
      Value: yetkiliciler[e]
    })).map((user, index) => 
      `\`${index + 1}.\` **${guild.members.cache.get(user.User) ? guild.members.cache.get(user.User).displayName : "Undefined"}** \`${user.Value} Yetkili.\``).join("\n");

    let yetkiliEmbed = new EmbedBuilder()
      .setColor("RANDOM")
      .setTimestamp()
      .setFooter({ text: conf.footer })
      .setTitle("Yetkili Alım Tablosu")
      .setDescription(`${yetkiliGoster.length > 0 ? yetkiliGoster : "Veri yoktur"}\n\nBu veriler ${moment(Date.now()).locale("tr").format("LLL")} tarihinde yenilenmiştir.`);

    let yetkiliMessage = await client.channels.cache.get(conf.leaderboard.KanalID).messages.fetch(conf.leaderboard.mesajID_4);
    yetkiliMessage.edit({ embeds: [yetkiliEmbed] });
  };

  updateTables();
  setInterval(updateTables, 1000 * 60 * 60);
};
