const { EmbedBuilder } = require("discord.js");
const conf = client.ayarlar;
const mongoose = require("mongoose");
const sunucuayar = require("../../models/sunucuayar");

module.exports.run = async (client, message, args, durum, kanal) => {
    if (!message.guild) return;

    if (message.member.permissions.has(PermissionsBitField.Flags.Administrator) || durum) {
        let data = await sunucuayar.findOne({});
        let sunucuTAG = data.TAG;
        let tag = await message.guild.members.cache.filter(member => member.user.username.includes(sunucuTAG)).size;
        let sesli = message.guild.channels.cache
            .filter(channel => channel.isVoiceBased())
            .map(channel => channel.members.filter(member => !member.user.bot).size)
            .reduce((a, b) => a + b, 0);
        let bot = message.guild.channels.cache
            .filter(channel => channel.isVoiceBased())
            .map(channel => channel.members.filter(member => member.user.bot).size)
            .reduce((a, b) => a + b, 0);
        let embed = new EmbedBuilder()
            .setColor("Black")
            .setDescription(`\`❯\` Şu anda toplam **${sesli}** (**+${bot} bot**) kişi seslide.
                \`❯\` Sunucuda **${message.guild.memberCount}** adet üye var (**${message.guild.members.cache.filter(member => member.presence && member.presence.status !== "offline").size}** Aktif)
                \`❯\` Toplamda **${tag}** kişi tagımızı alarak bizi desteklemiş.
                \`❯\` Toplamda **${message.guild.premiumSubscriptionCount}** adet boost basılmış! ve Sunucu **${message.guild.premiumTier}** seviye`);
        message.channel.send({ embeds: [embed] });
    }
}

exports.conf = {
    aliases: ["sunucusay", "serversay", "Say"]
};

exports.help = {
    name: 'say'
};
