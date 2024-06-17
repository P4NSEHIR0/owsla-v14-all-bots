const { EmbedBuilder, Client, GatewayIntentBits, Partials } = require('discord.js');
const moment = require('moment');
moment.locale('tr');

module.exports.run = async (client, message, args, durum, kanal) => {
    if (!message.guild) return;

    if (durum) {
        let mesaj = client.snipe.get(message.channel.id);
        if (!mesaj) return message.react("🚫");
        
        const embed = new EmbedBuilder()
            .setColor('Random')
            .setAuthor({ name: mesaj.author.tag, iconURL: mesaj.author.displayAvatarURL({ dynamic: true }) })
            .setDescription(mesaj.content)
            .setFooter({ text: "Silinen Tarih: " + moment(mesaj.createdTimestamp).add(3, 'hours').format("ll") + ", " + moment(mesaj.createdTimestamp).add(3, 'hours').format("LTS") });
        
        message.channel.send({ embeds: [embed] }).then(msg => { setTimeout(() => msg.delete(), 3500) });
        client.snipe.delete(message.channel.id);
    } else return;
};

exports.conf = { aliases: ["snipe"] };
exports.help = { name: 'Snipe' };
