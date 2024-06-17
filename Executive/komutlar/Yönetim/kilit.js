const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const mongoose = require("mongoose");

module.exports.run = async (client, message, args, durum, kanal) => {
    if (!message.guild) return;

    if (message.member.permissions.has(PermissionsBitField.Flags.Administrator) || durum) {
        if (args[0] == "aç") {
            message.channel.permissionOverwrites.edit(message.guild.id, {
                SEND_MESSAGES: false
            }).then(async() => {
                await message.reply("Kanal başarıyla kilitlendi.");
            }).catch(console.error);
        }

        if (args[0] == "kapat") {
            message.channel.permissionOverwrites.edit(message.guild.id, {
                SEND_MESSAGES: true
            }).then(async() => {
                await message.reply("Kanalın kilidi başarıyla açıldı.");
            }).catch(console.error);
        }

    } else {
        return message.reply("Yönetici yetkisine sahip olmalısın.");
    }
};

exports.conf = {
    aliases: ["kilit"]
};

exports.help = {
    name: 'Kilit'
};
