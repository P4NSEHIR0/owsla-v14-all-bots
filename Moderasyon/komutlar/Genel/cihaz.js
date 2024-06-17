const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports.run = async (client, message, args, durum, kanal) => {
    if (!message.guild) return;

    if (!message.member.permissions.has(PermissionsBitField.Flags.ViewAuditLog)) return;
    
    let embed = new EmbedBuilder()
        .setAuthor({ name: message.member.displayName, iconURL: message.author.avatarURL({ dynamic: true }) })
        .setColor(client.randomColor())
        .setTimestamp();
    
    let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;

    if (member.presence?.status === "offline") return message.channel.send({ embeds: [embed.setDescription(`${member} üyesi çevrim dışı!`)] });

    let clientStatus = member.presence?.clientStatus;
    if (!clientStatus) return message.channel.send({ embeds: [embed.setDescription(`${member} üyesinin cihaz bilgisi alınamıyor.`)] });

    message.channel.send({
        embeds: [embed.setDescription(`${member} üyesinin şu anki cihazları;\n\n${Object.keys(clientStatus).map(c => `\`•\` ${c.replace("desktop", "Masaüstü Uygulaması").replace("mobile", "Mobil Cihaz").replace("web", "İnternet Tarayıcısı")} (${clientStatus[c].replace("online", "Çevrim içi").replace("dnd", "Rahatsız etmeyin").replace("idle", "Boşta")})`).join("\n")}`)]
    });
}

exports.conf = { aliases: ["cihaz"] };
exports.help = { name: 'Cihaz' };
