const { EmbedBuilder } = require("discord.js");
require("moment-timezone");
const Stat = require("../../models/stats");
const sunucuayar = require("../../models/sunucuayar");
const xpData = require("../../models/stafxp");
const uyarıData = require("../../models/uyarı");
const puansystem = require("../../models/puansystem");
const taglıData = require("../../models/taglıUye");
const yetkiliDB = require("../../models/yetkili");
const ozelKomut = require("../../models/özelkomut");
const missionSystem = require("../../models/randomMission");

module.exports.run = async (client, message, args, durum, kanal) => {
    if (!message.guild) return;

    const sunucuData = await sunucuayar.findOne({ guildID: message.guild.id });
    if (!sunucuData.GKV.includes(message.author.id) && !durum && !client.ayarlar.sahip.includes(message.author.id)) return;

    const sec = args[0];
    if (sec === "üye") {
        const target = message.mentions.members.first() || message.guild.members.cache.get(args[1]);
        if (!target) return message.reply("Lütfen bir kullanıcı etiketleyiniz.");

        await Stat.updateOne(
            { userID: target.id, guildID: message.guild.id },
            {
                $set: {
                    "EtkinlikPuan": 0,
                    "yedi.Id": target.id,
                    "yedi.Voice": {},
                    "yedi.Chat": {},
                    "yedi.TagMember": 0,
                    "yedi.Invite": 0,
                    "yedi.Register": 0,
                    "yedi.Yetkili": 0,
                },
            }
        ).exec();
        await xpData.updateOne({ userID: target.id }, { $set: { currentXP: 0 } }, { upsert: true }).exec();
        await ozelKomut.updateMany({ guildID: message.guild.id, komutAd: { $exists: true } }, { $pull: { YetkiliData: { Author: target.id } } }).exec();
        await taglıData.deleteMany({ Durum: "puan", authorID: target.id }).exec();
        await yetkiliDB.deleteMany({ Durum: "puan", authorID: target.id }).exec();

        return message.reply(`Başarılı bir şekilde ${target} adlı kullanıcının puanlarını sıfırladınız.`);
    }

    if (sec === "rol") {
        const rol = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
        if (!rol) return message.reply("Lütfen bir rol etiketleyiniz.");

        rol.members.forEach(async (target) => {
            await Stat.updateOne(
                { userID: target.id, guildID: message.guild.id },
                {
                    $set: {
                        "EtkinlikPuan": 0,
                        "yedi.Id": target.id,
                        "yedi.Voice": {},
                        "yedi.Chat": {},
                        "yedi.TagMember": 0,
                        "yedi.Invite": 0,
                        "yedi.Register": 0,
                        "yedi.Yetkili": 0,
                    },
                }
            ).exec();
            await xpData.updateOne({ userID: target.id }, { $set: { currentXP: 0 } }, { upsert: true }).exec();
            await ozelKomut.updateMany({ guildID: message.guild.id, komutAd: { $exists: true } }, { $pull: { YetkiliData: { Author: target.id } } }).exec();
            await taglıData.deleteMany({ Durum: "puan", authorID: target.id }).exec();
            await yetkiliDB.deleteMany({ Durum: "puan", authorID: target.id }).exec();
        });

        return message.reply(`Başarılı bir şekilde <@&${rol.id}> adlı rolündeki üyelerin puanlarını sıfırladınız.`);
    }
};

exports.conf = {
    aliases: ["stat-sıfırla"]
};

exports.help = {
    name: "stats-sıfırla"
};
