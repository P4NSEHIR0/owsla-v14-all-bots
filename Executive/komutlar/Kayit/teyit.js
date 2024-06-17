const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const conf = client.ayarlar;
const mongoose = require("mongoose");
const teyit = require("../../models/stats");
const sunucuayar = require("../../models/sunucuayar");

module.exports.run = async (client, message, args, durum, kanal) => {
    if (!message.guild) return;

    const data = await sunucuayar.findOne({});
    const kayitSorumlusu = data.REGISTERAuthorized;
    const jailSorumluRol = data.JAILAuthorized;

    if (
        message.member.permissions.has(PermissionsBitField.Flags.Administrator) ||
        message.member.roles.cache.some(role => kayitSorumlusu.includes(role.id)) ||
        message.member.roles.cache.some(role => jailSorumluRol.includes(role.id)) ||
        durum
    ) {
        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.author;
        const userData = await teyit.findOne({ userID: target.id, guildID: message.guild.id });

        const embed = new EmbedBuilder()
            .setColor("Random")
            .setTimestamp()
            .setFooter({ text: conf.footer })
            .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setDescription(`**Toplam Bilgiler**
\`Erkek: ${userData ? userData.Man : 0} Kadın: ${userData ? userData.Woman : 0} (${userData ? (userData.Man + userData.Woman) : 0})\``);

        message.channel.send({ embeds: [embed] });
    } else {
        return;
    }
};

exports.conf = {
    aliases: ["teyitbilgi"]
};

exports.help = {
    name: 'Teyitbilgi'
};
