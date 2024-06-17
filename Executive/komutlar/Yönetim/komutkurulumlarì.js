const { EmbedBuilder } = require("discord.js");
const mongoose = require("mongoose");
const sunucuayar = require("../../models/sunucuayar");

module.exports.run = async (client, message, args, durum, kanal) => {
    if (!message.guild) return;

    if (durum) {
        let data = await sunucuayar.findOne({ guildID: message.guild.id });
        let embed = new EmbedBuilder()
            .setColor("Random")
            .setTimestamp()
            .setFooter({ text: client.ayarlar.footer })
            .setAuthor({ name: message.author.tag, iconURL: message.author.avatarURL({ dynamic: true }) })
            .setDescription(`Mute-Ban-Jail-Reklam-VMute-Register komutlarının yardım kategorisi:`)
            .addFields(
                {
                    name: "Mute Komutu",
                    value: `
Mute Limit: **${data.MUTELimit}**
Mute Kanal: <#${data.MUTEChannel}>
Yetkililer: ${data.MUTEAuthorized.map(x => `<@&${x}>`).join(", ")}`
                },
                {
                    name: "VMute Komutu",
                    value: `
VMute Limit: **${data.VMuteLimit}**
VMute Kanal: <#${data.VMUTEChannel}>
Yetkililer: ${data.VMUTEAuthorized.map(x => `<@&${x}>`).join(", ")}`
                },
                {
                    name: "Jail Komutu",
                    value: `
Jail Limit: **${data.JAILLimit}**
Jail Kanal: <#${data.JAILChannel}>
Yetkililer: ${data.JAILAuthorized.map(x => `<@&${x}>`).join(", ")}`
                },
                {
                    name: "Reklam Komutu",
                    value: `
Reklam Limit: **${data.REKLAMLimit}**
Reklam Kanal: <#${data.REKLAMChannel}>
Yetkililer: ${data.REKLAMAuthorized.map(x => `<@&${x}>`).join(", ")}`
                },
                {
                    name: "Ban Komutu",
                    value: `
Ban Limit: **${data.BANLimit}**
Ban Kanal: <#${data.BANChannel}>
Yetkililer: ${data.BANAuthorized.map(x => `<@&${x}>`).join(", ")}`
                },
                {
                    name: "Register Komutu",
                    value: `
Kayıt Kanal: <#${data.REGISTER}>
Yetkililer: ${data.REGISTERAuthorized.map(x => `<@&${x}>`).join(", ")}`
                }
            );

        message.channel.send({ embeds: [embed] });
    } else {
        return;
    }
};

exports.conf = {
    aliases: ["komutkurulum"]
};

exports.help = {
    name: 'kkurulum'
};
