const { EmbedBuilder } = require("discord.js");
let moment = require("moment");
require("moment-duration-format");
let stats = require("../../models/stats");

module.exports.run = async (client, message, args, durum, kanal) => {
    if (!message.guild) return;
    if (kanal) return;

    let user = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
    let statData = await stats.findOne({ userID: user.id, guildID: message.guild.id }) || { autoRankup: [] };

    let rozetleri = statData.autoRankup || [];
    const embed = new EmbedBuilder()
        .setAuthor({ name: user.user.tag, iconURL: user.user.avatarURL({ dynamic: true }) })
        .setThumbnail(user.user.avatarURL({ dynamic: true }))
        .setColor("BLACK")
        .setFooter({ text: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

    if (message.guild.members.cache.has(user.id)) {
        let member = message.guild.members.cache.get(user.id);
        let nickname = member.displayName == user.user.username ? `${user.user.username} [Yok]` : member.displayName;
        const members = message.guild.members.cache.filter(x => !x.user.bot).sort((a, b) => a.joinedTimestamp - b.joinedTimestamp).map(m => m);
        const joinPos = members.map((u) => u.id).indexOf(member.id);
        const roles = member.roles.cache.filter(role => role.id !== message.guild.id).sort((a, b) => b.position - a.position).map(role => `<@&${role.id}>`);
        const rolleri = [];

        if (roles.length > 6) {
            const lent = roles.length - 6;
            let itemler = roles.slice(0, 6);
            itemler.map(x => rolleri.push(x));
            rolleri.push(`${lent}...`);
        } else {
            roles.map(x => rolleri.push(x));
        }

        embed.setDescription(`
**❯ Kullanıcı Bilgisi**
\`•\` Rozetler: \`${rozetleri.length === 0 ? "Rozet yoktur" : rozetleri.join(" ")}\`
\`•\` Hesap: ${user}
\`•\` Kullanıcı ID: \`${member.id}\`
\`•\` Kuruluş Tarihi: \`${moment(member.user.createdTimestamp).locale("tr").format("LLL")} - (${moment(member.user.createdTimestamp).locale("tr").fromNow()})\`

**❯ Sunucu Bilgisi**
\`•\` Sunucu İsmi: \`${nickname}\`
\`•\` Katılım Tarihi: \`${moment(member.joinedAt).locale("tr").format("LLL")} - (${moment(member.joinedAt).locale("tr").fromNow()})\`
\`•\` Katılım Sırası: \`${joinPos} / ${message.guild.members.cache.size}\`

\`•\` Rolleri (${rolleri.length}): ${rolleri.join(", ")}
`);
        embed.setColor(member.displayHexColor);
    }
    message.channel.send({ embeds: [embed] });
}

exports.conf = { aliases: ["Bilgi", "profil", "info", "i"] };
exports.help = { name: 'bilgi' };
