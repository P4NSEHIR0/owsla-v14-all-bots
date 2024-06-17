const { EmbedBuilder } = require("discord.js");
const sunucuayar = require("../../models/sunucuayar");

module.exports.run = async (client, message, args, durum, kanal) => {
    if (!message.guild) return;

    let data = await sunucuayar.findOne({ guildID: message.guild.id });
    message.channel.send(`${data.LINK}`);
}

exports.conf = { aliases: [] };
exports.help = { name: 'link' };
