const { EmbedBuilder, Client, GatewayIntentBits, Partials } = require('discord.js');
const moment = require('moment');
moment.locale('tr');
const mongoose = require('mongoose');
const sunucuayar = require('../../models/sunucuayar');
const ceza = require('../../models/ceza');
const profil = require('../../models/profil');
const limit = new Map();

module.exports.run = async (client, message, args, durum, kanal) => {
    if (!message.guild) return;

    let sec = args[0];
    let data = await sunucuayar.findOne({ guildID: message.guild.id });
    let banSorumlusu = data.BANAuthorized;
    let banLogKanal = data.BANChannel;
    let banLimit = data.BANLimit;
    let cezaID = data.WARNID;

    if (sec === 'setup') {
        if (!args[1]) return message.reply('Lütfen `yetki-kanal-limit` belirleyiniz');
        if (message.guild.members.cache.some(member => conf.sahip.includes(member.id)) || message.member.permissions.has('ADMINISTRATOR') || message.author.id === message.guild.ownerId) {
            await sunucuayar.findOne({ guildID: message.guild.id }, async (err, data) => {
                if (args[1] === 'yetki') {
                    let select;
                    if (message.mentions.roles.size >= 1) {
                        select = message.mentions.roles.map(r => r.id);
                    } else {
                        select = args.slice(1).map(id => message.guild.roles.cache.get(id)).filter(r => r !== undefined);
                    }
                    if (!select) return message.react(client.emojis.cache.find(res => res.name === "stfu_iptal"));
                    data.BANAuthorized = select;
                    data.save().then(() => message.react(client.emojis.cache.find(res => res.name === "stfu_tik")));
                }
                if (args[1] === 'kanal') {
                    let select = message.mentions.channels.first();
                    if (!select) return message.react(client.emojis.cache.find(res => res.name === "stfu_iptal"));
                    data.BANChannel = select.id;
                    data.save().then(() => message.react(client.emojis.cache.find(res => res.name === "stfu_tik")));
                }
                if (args[1] === 'limit') {
                    let select = Number(args[2]);
                    if (!select) return message.react(client.emojis.cache.find(res => res.name === "stfu_iptal"));
                    data.BANLimit = select;
                    data.save().then(() => message.react(client.emojis.cache.find(res => res.name === "stfu_tik")));
                }
            });
        } else return message.reply('Bu komutu kullanabilmek için YÖNETİCİ - Sunucu Sahibi olmanız gerekiyor');
    }

    if (await client.permAyar(message.author.id, message.guild.id, 'ban') || durum) {
        if (banSorumlusu.length >= 1 && client.channels.cache.get(banLogKanal) && banLimit >= 1) {
            let target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
            if (!target) return message.reply('Lütfen bir kişi ve sebep belirtiniz');
            let reason = args.slice(1).join(' ');
            if (!reason) return message.reply('Lütfen bir sebep belirtiniz!');
            if (limit.get(message.author.id) >= banLimit) return message.reply('`ban` komutu için limite ulaştın!');
            if (message.member.roles.highest.position <= target.roles.highest.position) return message.reply('Belirttiğin kişi senden üstün veya onunla aynı yetkidesin!');
            if (target.id === message.author.id) return message.reply('Kendini banlayamazsın!');

            limit.set(`${message.author.id}`, (Number(limit.get(`${message.author.id}`) || 0)) + 1);
            setTimeout(() => {
                limit.set(`${message.author.id}`, (Number(limit.get(`${message.author.id}`) || 0)) - 1);
            }, 1000 * 60 * 3);

            await banSistemi(message, client, banLogKanal, target, cezaID, reason);
        } else return message.reply(`Lütfen ban komutunun kurulumunu tamamlayınız \`${conf.prefix[0]}ban setup\` yazarak kurunuz!`);
    } else return client.Embed(message.channel.id, 'Bu komutu kullanabilmek için Yönetici - Ban Sorumlusu olmalısın!');
};

exports.conf = {
    aliases: ['Ban']
};
exports.help = {
    name: 'ban'
};

async function banSistemi(message, client, banLogKanal, target, cezaID, reason) {
    const embed = new EmbedBuilder()
        .setColor('Random')
        .setAuthor({ name: message.author.tag, iconURL: message.author.avatarURL({ dynamic: true }) })
        .setFooter({ text: conf.footer })
        .setTimestamp()
        .setDescription(`**${target} Üyesi Sunucudan ${reason} Sebebiyle\n${message.author} Tarafından banlandı! Ceza Numarası:** (\`#${cezaID + 1}\`)`);

    const messageLogEmbed = new EmbedBuilder()
        .setColor('Random')
        .setAuthor({ name: message.author.tag, iconURL: message.author.avatarURL({ dynamic: true }) })
        .setFooter({ text: conf.footer })
        .setTimestamp()
        .setDescription(`
• Ceza ID: \`#${cezaID + 1}\`
• Yasaklanan Üye: ${target} (\`${target.id}\`)
• Yasaklayan Yetkili: ${message.author} (\`${message.author.id}\`)
• Yasaklanma Tarihi: \`${moment(Date.now()).format('LLL')}\`
• Yasaklanma Sebebi: [\`${reason}\`]
`);

    await message.guild.members.ban(target.id, { reason: `${reason} | Yetkili: ${message.author.tag}`, days: 1 });
    await message.channel.send({ embeds: [embed] });
    await client.channels.cache.get(banLogKanal).send({ embeds: [messageLogEmbed] });
    await target.user.send(`${message.guild.name} adlı sunucumuzdan ${reason} sebebi ile uzaklaştırıldın`);

    let newData = ceza({
        ID: cezaID + 1,
        userID: target.id,
        Yetkili: message.author.id,
        Ceza: 'BAN',
        Sebep: reason,
        Puan: 30,
        Atilma: Date.now(),
        Bitis: null,
    });

    await profil.updateOne({ userID: message.author.id, guildID: message.guild.id }, { $inc: { BanAmount: 1 } }, { upsert: true }).exec();
    await client.savePunishment();
    await newData.save();
}
