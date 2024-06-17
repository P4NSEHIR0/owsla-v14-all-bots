const {
    EmbedBuilder
} = require("discord.js");
const mongoose = require("mongoose");
const sunucuayar = require("../../models/sunucuayar");
const taglıData = require("../../models/taglıUye");
const Stat = require("../../models/stats");
const StaffXP = require("../../models/stafxp");
const hanedan = require("../../models/hanedanlik");
let limit = new Map();

module.exports.run = async (client, message, args, durum, kanal) => {
    if (!message.guild) return;

    let data = await sunucuayar.findOne({});
    if (durum) {
        let target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply("Lütfen bir kullanıcı etiketleyiniz!");
        if (target.id === message.author.id) return message.react(client.emojis.cache.find(x => x.name === "stfu_iptal"));
        if (!target.user.username.includes(data.TAG)) return message.reply("Bu kullanıcı adına sunucu tagımızı almamış!");

        limit.set(target.id, true);

        await taglıData.findOne({
            userID: target.id,
            Durum: "stat"
        }, async (err, res) => {
            if (!res) return message.reply(`Bu komutu sadece kayıtsız üyelere tag aldırdığınız zaman kullanabilirsiniz.`);
            if (res.authorID != "x") return message.reply(`Tag aldırmaya çalıştığın üye farklı bir yetkili tarafından zaten taga alınmış!`);

            await message.channel.send(`${message.author}, Başarılı bir şekilde ${target} adlı üyeye tag aldırdınız.`);
            message.react(client.emojis.cache.find(x => x.name === "stfu_tik"));
            client.channels.cache.get(client.ayarlar.taglogkanal).send(`${message.author} adlı yetkili ${target} adlı yetkiliye başarılı bir şekilde tag aldırdı.`);
            
            res.authorID = message.author.id;
            await res.save();
                    
            let hanedanData = await hanedan.findOne({ userID: message.author.id, guildID: client.ayarlar.sunucuId });
            if (hanedanData) {
                await hanedan.updateOne({ userID: message.author.id, guildID: client.ayarlar.sunucuId }, {
                    $inc: { Taglı: 1 }
                }, { upsert: true }).exec();
            }

            await taglıData.updateOne({
                userID: target.id,
                Durum: "puan"
            }, {
                authorID: message.author.id
            }, {
                upsert: true
            }).exec();

            await Stat.updateOne({ userID: message.author.id, guildID: message.guild.id }, { $inc: { coin: 30 } }, { upsert: true }).exec();
            await client.easyMission(message.author.id, "taglı", 1);
            await client.dailyMission(message.author.id, "taglı", 1);
            baddAudit(message.author.id, 1);
        });
    }
};

exports.conf = {
    aliases: ["Taglı"]
};

exports.help = {
    name: 'taglı'
};

async function baddAudit(id, value) {
    try {
        await Stat.updateMany({ userID: id, guildID: client.ayarlar.sunucuId }, { $inc: { "yedi.TagMember": value } }).exec();
    } catch (err) {
        console.error(err);
    }
};
