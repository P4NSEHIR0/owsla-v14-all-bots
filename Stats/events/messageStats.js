const { AttachmentBuilder, Collection, EmbedBuilder } = require("discord.js");
const { Canvas } = require('canvas-constructor');
const { loadImage } = require('canvas');
const { join } = require("path");
let Stat = require("../models/stats");
let StaffXP = require("../models/stafxp");
let randMiss = require("../models/randomMission");
let sunucuayar = require("../models/sunucuayar");
let muteInterval = require("../models/muteInterval");
const hanedan = require("../models/hanedanlik");

module.exports = async message => {
  if (!message.guild) return;
  if (message.author.bot) return;

  let sunucuData = await sunucuayar.findOne({guildID: message.guild.id});
  let muteRol = sunucuData.MUTED;
  let check = await muteInterval.findOne({userID: message.author.id});
  if (check && !message.member.roles.cache.has(muteRol)) {
    message.member.roles.add(muteRol);
  }
  await client.checkLevel(message.author.id, client.ayarlar.sunucuId, "mesaj");
  let data2 = await randMiss.findOne({userID: message.author.id}) || { Mission: { MISSION: null, CHANNEL: null } };
  if (data2.Mission.MISSION == "mesaj" && data2.Mission.CHANNEL == message.channel.id) {
    await client.dailyMission(message.author.id, "mesaj", 1);
  }
  
  let data = await Stat.findOne({userID: message.author.id, guildID: message.guild.id}) || { messageLevel: 0 };
  let siradakilevel = data.messageLevel * 643;


  await client.easyMission(message.author.id, "mesaj", 1);
  await addMessageStat(message.author.id, message.channel.id, 1, message.channel.parentId || "nocategory");
};

async function addMessageStat(id, channel, value, category) {
  let veris = await Stat.findOne({userID: id, guildID: client.ayarlar.sunucuId});
  if (!veris) {
    let newData = new Stat({
      userID: id,
      guildID: client.ayarlar.sunucuId,
      yedi: {
        Id: id,
        Invite: 0,
        Chat: {},
        Voice: {},
        TagMember: 0,
        Register: 0,
        Yetkili: 0
      }
    });
    newData.save();
  } else {
    let randomMessageXP = [2, 4, 6, 8, 10, 12, 14, 16, 18].random();
    if ([client.ayarlar.CHAT_KANAL].includes(channel)) {
      hanedan.findOne({userID: id, guildID: client.ayarlar.sunucuId}, (err, data) => {
        if (!data) return;
        hanedan.updateOne({userID: id, guildID: client.ayarlar.sunucuId}, {
          $inc: {
            [`Mesaj`]: value,
          }
        }, {upsert: true}).exec()
      });
      Stat.updateOne({ userID: id, guildID: client.ayarlar.sunucuId}, { $inc: { coin: 0.2 } }, { upsert: true }).exec();
    }
    Stat.updateOne({ userID: id, guildID: client.ayarlar.sunucuId}, { $inc: { messageXP: randomMessageXP, totalMessage: value, [`messageChannel.${channel}`]: value, [`messageCategory.${category}`]: value, [`yedi.Chat.${channel}`]: value} }, { upsert: true }).exec();
  }
  return;
};
