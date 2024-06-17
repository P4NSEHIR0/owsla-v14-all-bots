const { EmbedBuilder } = require("discord.js");
let mongoose = require("mongoose");
let afk = require("../models/afk");
let moment = require("moment");
require("moment-duration-format");
moment.locale("tr");

module.exports = async message => {
    if (!message.guild) return;
    if (message.author.bot) return;

    let userData = await afk.findOne({ userID: message.author.id, guildID: message.guild.id }) || { Reason: null, Time: null };

    let afkReason = userData.Reason;
    if (afkReason) {
        let ha = moment(userData.Time).fromNow();
        let embed = new EmbedBuilder()
            .setDescription(`<@${message.author.id}> AFK modundan başarıyla çıkış yaptın, ${ha} AFK olmuştun.`);
        message.channel.send({ embeds: [embed] }).then(msg => {
            setTimeout(() => msg.delete().catch(() => {}), 7000);
        });

        let nicke = message.member.displayName.replace("[AFK]", "");
        await message.member.setNickname(nicke);
        await afk.deleteOne({ userID: message.author.id, guildID: message.guild.id }).exec();
    }

    message.mentions.members.forEach(async u => {
        let userData = await afk.findOne({ userID: u.id, guildID: message.guild.id }) || { Reason: null, Time: null };
        let ha = moment(userData.Time).fromNow();
        if (userData.Reason) {
            let embed = new EmbedBuilder()
                .setDescription(`<@${userData.userID}> ${ha} AFK moduna geçti. Sebep: ${userData.Reason}`);
            message.channel.send({ embeds: [embed] }).then(msg => {
                setTimeout(() => msg.delete().catch(() => {}), 7000);
            });
        }
    });
};
