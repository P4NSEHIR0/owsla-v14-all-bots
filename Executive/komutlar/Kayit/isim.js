const { EmbedBuilder, Client, GatewayIntentBits, Partials } = require("discord.js");
const mongoose = require("mongoose");
const sunucuayar = require("../../models/sunucuayar");
const teyit = require("../../models/teyit");
const isim_limit = new Map();

module.exports.run = async (client, message, args, durum, kanal) => {
    if (!message.guild) return;
    if ((isim_limit.get(message.author.id) || 0) >= 5) {
        return message.reply("5 dakikada en fazla 5 isim değişikliği yapabilirsin.");
    }
    isim_limit.set(message.author.id, (isim_limit.get(message.author.id) || 0) + 1);

    setTimeout(() => {
        isim_limit.set(message.author.id, (isim_limit.get(message.author.id) || 0) - 1);
    }, 1000 * 60 * 5);

    let data = await sunucuayar.findOne({ guildID: message.guild.id });
    if (message.member.roles.cache.some(rol => data.REGISTERAuthorized.some(rol2 => rol.id === rol2)) || message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        let tag = data.TAG;
        let tag2 = data.TAG2;

        let target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply("Lütfen bir kullanıcı etiketleyiniz veya ID belirtiniz");
        if (message.member.roles.highest.position <= target.roles.highest.position) {
            return message.reply(`Belirttiğin kişi senden üstün veya onunla aynı yetkidesin!`);
        }

        let isim = args[1];
        if (isim) {
            isim = isim[0].toUpperCase() + isim.substring(1);
        }
        let yaş = Number(args[2]);

        if (!isim) return message.reply("Lütfen bir isim belirtiniz");
        if (!yaş) return message.reply("Lütfen bir yaş belirtiniz");

        await target.setNickname(`${target.user.username.includes(tag) ? tag : tag2 ? tag2 : tag} ${isim} | ${yaş}`)
            .then(() => message.react(client.emojis.cache.find(x => x.name === "stfu_tik")))
            .catch(err => message.reply("İsim değiştirme işlemi sırasında bir hata oluştu."));

        await teyit.updateOne({ userID: target.id }, {
            $push: { userName: `\`${target.user.username.includes(tag) ? tag : tag2 ? tag2 : tag} ${isim} | ${yaş}\` (İsim Güncellendi)` }
        }, { upsert: true }).exec();
    } else {
        return;
    }
};

exports.conf = {
    aliases: ["isim", "İsim", "İSİM", "ISIM"]
};

exports.help = {
    name: 'name'
};
