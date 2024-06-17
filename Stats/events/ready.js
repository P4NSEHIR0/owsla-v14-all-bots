const moment = require('moment');
const { EmbedBuilder, ChannelType, ActivityType } = require('discord.js');
require("moment-duration-format");
let sunucuayar = require("../models/sunucuayar");
const client = global.client;
let conf = client.ayarlar;

module.exports = async client => {
  try {
    console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] BOT: Aktif, Komutlar yüklendi!`);
    console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] BOT: ${client.user.username} ismi ile giriş yapıldı!`);

    client.user.setStatus("idle");
    let kanal = client.channels.cache.filter(x => x.type === ChannelType.GuildVoice && x.id === client.ayarlar.botSesID);
    setInterval(() => {
      const oynuyor = client.ayarlar.readyFooter;
      const index = Math.floor(Math.random() * (oynuyor.length));
      client.user.setActivity(`${oynuyor[index]}`, { type: ActivityType.Watching });
      kanal.forEach(channel => {
        if (channel.id === client.ayarlar.botSesID) {
          if (channel.members.some(member => member.id === client.user.id)) return;
          if (!client.channels.cache.get(client.ayarlar.botSesID)) return;
          client.channels.cache.get(channel.id).join().then(x => console.log("Bot başarılı bir şekilde ses kanalına bağlandı")).catch(() => console.log("Bot ses kanalına bağlanırken bir sorun çıktı Lütfen Yetkileri kontrol ediniz!"));
        } else return;
      });
    }, 10000);

  } catch (err) {
    console.error(err);
  }

  setInterval(async () => {
    let alarmModel = require("../models/alarm.js");
    let alarmlar = await alarmModel.find({ bitis: { $lte: Date.now() } });
    for (let alarm of alarmlar) {
      let uye = client.guilds.cache.get(client.ayarlar.sunucuId).members.cache.get(alarm.uye);
      if (!uye) continue;
      let embed = new EmbedBuilder().setColor("Random").setDescription(alarm.aciklama).setTimestamp();
      try {
        await uye.send({ content: `**${uye} sana hatırlatmamı istediğin şeyin vakti geldi!**`, embeds: [embed] });
      } catch (err) {
        console.error(err);
      }
      let kanal = client.channels.cache.get(alarm.kanal);
      if (kanal) {
        kanal.send({ content: `**${uye} sana hatırlatmamı istediğin şeyin vakti geldi!**`, embeds: [embed] });
      }
      await alarm.remove();
    }
  }, 10000);
};
