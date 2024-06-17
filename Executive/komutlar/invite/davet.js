const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const mongoose = require("mongoose");
const sunucuayar = require("../../models/sunucuayar");
const Database = require("../../models/invite");

module.exports.run = async (client, message, args, durum, kanal) => {
    if (!message.guild) return;

    const conf = client.ayarlar;

    if (message.member.permissions.has(PermissionsBitField.Flags.Administrator) || conf.sahip.includes(message.author.id) || durum) {
        if (args[0] === "kanal") {
            let kanal = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
            if (!kanal) return message.channel.send('Lütfen bir kanal belirtin.');

            let inviteKanal = await sunucuayar.findOne({});
            inviteKanal.INVITEChannel = kanal.id;
            await inviteKanal.save();
            return message.channel.send(`Başarılı bir şekilde davet kanalını ${kanal} olarak tanımladınız!`);
        }
    }

    let uye = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
    let embed = new EmbedBuilder()
        .setAuthor({ name: uye.displayName, iconURL: uye.user.displayAvatarURL({ dynamic: true }) })
        .setColor(uye.displayHexColor)
        .setFooter({ text: conf.footer })
        .setTimestamp();

    Database.findOne({ guildID: message.guild.id, userID: uye.id }, (err, inviterData) => {
        if (!inviterData) {
            embed.setDescription(`Toplam **0** davete sahip! (**0** gerçek, **0** bonus, **0** fake, **0** haftalık)`);
            message.channel.send({ embeds: [embed] });
        } else {
            Database.find({ guildID: message.guild.id, inviterID: uye.id }).sort().exec((err, inviterMembers) => {
                let dailyInvites = 0;
                if (inviterMembers.length) {
                    dailyInvites = inviterMembers.filter(x => message.guild.members.cache.has(x.userID) && (Date.now() - message.guild.members.cache.get(x.userID).joinedTimestamp) < 1000 * 60 * 60 * 24 * 7).length;
                }
                embed.setDescription(`Toplam **${inviterData.regular + inviterData.bonus}** davete sahip! (**${inviterData.regular}** gerçek, **${inviterData.bonus}** bonus, **${inviterData.fake}** fake, **${dailyInvites}** haftalık)`);
                message.channel.send({ embeds: [embed] });
            });
        }
    });
};

exports.conf = {
    aliases: ["davet", "rank"]
};

exports.help = {
    name: 'invite'
};
