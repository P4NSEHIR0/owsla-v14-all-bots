const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const conf = client.ayarlar;
const moment = require("moment");
moment.locale("tr");
const ms = require("ms");
const mongoose = require("mongoose");
const sunucuayar = require("../../models/sunucuayar");
const ceza = require("../../models/ceza");
const reklamInterval = require("../../models/reklamInterval");

const limit = new Map();

module.exports.run = async (client, message, args, durum, kanal) => {
    if (!message.guild) return;

    let sec = args[0];
    let data = await sunucuayar.findOne({});
    let jailSorumlusu = data.REKLAMAuthorized;
    let reklamLOGKanal = data.REKLAMChannel;
    let REKLAMLimit = data.REKLAMLimit;
    let cezaID = data.WARNID;
    let reklamROL = data.REKLAM;
    let booster = data.BOOST;

    if (sec === "setup") {
        if (!args[1]) return message.reply("Lütfen `yetki-kanal-limit` belirleyiniz");
        if (message.guild.members.cache.some(member => conf.sahip.some(sahip => member.id === sahip)) || message.member.permissions.has(PermissionsBitField.Flags.Administrator) || message.author.id === message.guild.ownerId) {
            await sunucuayar.findOne({ guildID: message.guild.id }, async (err, data) => {
                if (args[1] === "yetki") {
                    let select;
                    if (message.mentions.roles.size >= 1) {
                        select = message.mentions.roles.map(r => r.id);
                    } else {
                        select = args.splice(1).map(id => message.guild.roles.cache.get(id)).filter(r => r != undefined);
                    }
                    if (!select) return message.react(client.emojis.cache.find(res => res.name === "stfu_iptal"));
                    data.REKLAMAuthorized = select;
                    data.save().then(() => message.react(client.emojis.cache.find(res => res.name === "stfu_tik")));
                } else if (args[1] === "kanal") {
                    let select = message.mentions.channels.first();
                    if (!select) return message.react(client.emojis.cache.find(res => res.name === "stfu_iptal"));
                    data.REKLAMChannel = select.id;
                    data.save().then(() => message.react(client.emojis.cache.find(res => res.name === "stfu_tik")));
                } else if (args[1] === "limit") {
                    let select = Number(args[2]);
                    if (!select) return message.react(client.emojis.cache.find(res => res.name === "stfu_iptal"));
                    data.REKLAMLimit = select;
                    data.save().then(() => message.react(client.emojis.cache.find(res => res.name === "stfu_tik")));
                }
            });
        } else return message.reply("Bu komutu kullanabilmek için YÖNETİCİ - Sunucu Sahibi olmanız gerekiyor");
    }

    if (await client.permAyar(message.author.id, message.guild.id, "reklam")) {
        if (jailSorumlusu.length >= 1 && client.channels.cache.get(reklamLOGKanal) && REKLAMLimit >= 1) {
            let target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
            let reason = "Reklam";
            if (!target) return client.Embed(message.channel.id, `Lütfen bir kişi belirtiniz`);
            if (target.roles.cache.has(reklamROL)) return message.react(client.emojis.cache.find(res => res.name === "stfu_iptal"));
            if (limit.get(message.author.id) >= REKLAMLimit) return message.reply(`\`reklam komutu için limite ulaştın!\``);
            if (message.member.roles.highest.position <= target.roles.highest.position) return client.Embed(message.channel.id, `Belirttiğin kişi senden üstün veya onunla aynı yetkidesin!`);
            if (target.roles.cache.has(data.EnAltYetkiliRol) && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return message.reply("Yetkililer birbirine ceza-i işlem uygulayamazlar.");
            if (target.id === message.author.id) return;

            let embedContent = `${target} Üyesi Sunucudan **${reason}** sebebiyle ${message.author} Tarafından reklam cezası yedi! **Ceza Numarası:** (\`#${cezaID + 1}\`)`;
            let messageLogEmbed = new EmbedBuilder()
                .setColor("Random")
                .setAuthor({ name: message.author.tag, iconURL: message.author.avatarURL({ dynamic: true }) })
                .setFooter({ text: conf.footer })
                .setTimestamp()
                .setDescription(`
                • Ceza ID: \`#${cezaID + 1}\`
                • Reklam Yapan Üye: ${target} (\`${target.id}\`)
                • Yetkili: ${message.author} (\`${message.author.id}\`)
                • Reklam Tarihi: \`${moment(Date.now()).format('LLL')}\`
                • Ceza Sebebi: [\`${reason}\`]
            `);

            reklamInterval.findOne({ userID: target.id }, (err, data) => {
                if (!data) {
                    let newData = new reklamInterval({
                        userID: target.id,
                        reklam: true,
                    });
                    newData.save();
                } else {
                    data.reklam = true;
                    data.save();
                }
            });

            limit.set(`${message.author.id}`, (Number(limit.get(`${message.author.id}`) || 0)) + 1);
            setTimeout(() => {
                limit.set(`${message.author.id}`, (Number(limit.get(`${message.author.id}`) || 0)) - 1);
            }, 1000 * 60 * 3);

            applyReklamPunishment(target, booster, reklamROL, message, embedContent, client, reklamLOGKanal, messageLogEmbed, cezaID, reason);
        } else return client.Embed(message.channel.id, "Lütfen reklam komudunun kurulumunu tamamlayınız `" + conf.prefix[0] + "reklam setup` yazarak kurunuz!");
    } else return;
};

exports.conf = {
    aliases: ["Reklam"]
};

exports.help = {
    name: 'reklam'
};

function applyReklamPunishment(target, booster, reklamROL, message, embedContent, client, reklamLOGKanal, messageLogEmbed, cezaID, reason) {
    target.setNickname("Reklamcı");
    target.roles.set(target.roles.cache.has(booster) ? [reklamROL, booster] : [reklamROL]);
    message.channel.send(embedContent);
    client.channels.cache.get(reklamLOGKanal).send({ embeds: [messageLogEmbed] });

    let newData = new ceza({
        ID: cezaID + 1,
        userID: target.id,
        Yetkili: message.author.id,
        Ceza: "REKLAM",
        Sebep: reason,
        Puan: 0,
        Atilma: Date.now(),
        Bitis: "null",
    });

    client.savePunishment();
    newData.save();
}
