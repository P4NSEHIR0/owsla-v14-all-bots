const {
    Client,
    EmbedBuilder,
    AttachmentBuilder
} = require('discord.js');
const {
    Canvas
} = require('canvas-constructor/cairo');
const {
    loadImage
} = require('canvas');
const {
    join
} = require("path");
require("moment-timezone")
let Stat = require("../../models/stats");

module.exports.run = async (client, message, args, durum, kanal) => {
    if (!message.guild) return;

    let target = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
    let data = await Stat.findOne({ userID: target.id, guildID: message.guild.id });
    let loading = await message.channel.send(`Veriler yükleniyor...`);

    const background = await loadImage("https://cdn.discordapp.com/attachments/833784440173232238/836787367196753940/owslarank.png");
    const avatar = await loadImage(target.user.displayAvatarURL({ format: "jpg" }));

    const image = new Canvas(478, 180)
        .printImage(background, 0, 0, 478, 180)
        .printCircularImage(avatar, 100.5, 64.5, 58.5)
        .setColor("#fff")
        .setTextFont('36px Impact Bold')
        .printText(`${target.user.tag}`, 8, 170, 150)
        .setColor("#fff")
        .setTextFont('14px Arial Black')
        .printText(`${data.messageLevel} LvL.`, 380, 110, 150)
        .setColor("#fff")
        .setTextFont('14px Arial Black')
        .printText(`${data.voiceLevel} LvL.`, 380, 150, 150)
        .save()
        .createRoundedClip(214.5, 114, getProgressBarWidth(data.messageXP, data.messageLevel * 643, 232), 17, 25)
        .setColor("#901bff")
        .fill()
        .restore()
        .setColor("#fff")
        .setTextFont('12px LEMON MILK Bold')
        .printText(`${data.messageXP}/${data.messageLevel * 643} XP`, 220, 128, 150)
        .createRoundedClip(214.5, 153.5, getProgressBarWidth(data.voiceXP, data.voiceLevel * 643, 232), 17, 25)
        .setColor("#901bff")
        .fill()
        .restore()
        .setColor("#fff")
        .setTextFont('12px LEMON MILK Bold')
        .printText(`${data.voiceXP}/${data.voiceLevel * 643} XP`, 220.5, 168, 150);

    const attachment = new AttachmentBuilder(image.toBuffer(), { name: 'owsla-level.png' });
    let embed = new EmbedBuilder().setColor("0b7888").setImage('attachment://owsla-level.png');

    loading.delete();
    message.channel.send({ content: `[ **${target.user.tag}** ] adlı kullanıcının level bilgileri:`, embeds: [embed], files: [attachment] });
}

exports.conf = { aliases: ["Level", "lvl", "Lvl", "LvL"] }
exports.help = { name: 'level' }

function getProgressBarWidth(currentXP, requiredXP, maxWidth) {
    if ((currentXP + 0.1) > requiredXP) return maxWidth;

    let width = currentXP <= 0 ? 0 : ((currentXP + 0.1) * maxWidth) / requiredXP;
    if (width > maxWidth) width = maxWidth;
    return width;
}
