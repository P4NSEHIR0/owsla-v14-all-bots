const { EmbedBuilder } = require('@discordjs/builders');
const { Client, GatewayIntentBits } = require('discord.js');
const conf = client.ayarlar;
const mongoose = require('mongoose');
const teyit = require('../../models/teyit');
const sunucuayar = require('../../models/sunucuayar');

module.exports.run = async (client, message, args, durum, kanal) => {
    if (!message.guild) return;
    if (kanal) return;
    if (durum) {
        let target = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;

        let teyitData = await teyit.findOne({ userID: target.id }) || { userName: [] };

        let embed = new EmbedBuilder()
            .setAuthor({ name: target.displayName, iconURL: target.user.displayAvatarURL({ dynamic: true }) })
            .setColor('Random')
            .setDescription(`
${teyitData.userName.length <= 0 ? `İsim Geçmişi Bulunamadı.` : `${target} kişisinin toplamda ${teyitData.userName.length} isim kayıtı bulundu.`} 

${teyitData.userName.reverse().join('\n')}
            `);

        message.channel.send({ embeds: [embed] });
    }
};

exports.conf = {
    aliases: ['İsimler', 'names']
};

exports.help = {
    name: 'isimler'
};
