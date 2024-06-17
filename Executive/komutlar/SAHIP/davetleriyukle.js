const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const conf = client.ayarlar;
const mongoose = require("mongoose");
const sunucuayar = require("../../models/sunucuayar");
const Database = require("../../models/invite");

module.exports.run = async (client, message, args, durum, kanal) => {
    if (!message.guild) return;
    if (kanal) return;

    if (!client.ayarlar.sahip.includes(message.author.id)) return;

    try {
        const invites = await message.guild.invites.fetch();
        invites.forEach(async invite => {
            let author = invite.inviter;
            let uses = invite.uses;
            if (!author) return;
            await Database.updateOne(
                { userID: author.id },
                { $inc: { bonus: uses } },
                { upsert: true }
            ).exec();
        });
    } catch (error) {
        console.error(error);
    }
};

exports.conf = { aliases: ["davetleriekle", "davetleriyukle"] };
exports.help = { name: 'alladdinvite' };
