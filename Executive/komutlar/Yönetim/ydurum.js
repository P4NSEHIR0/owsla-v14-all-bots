const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports.run = async (client, message, args, durum, kanal) => {
    if (!message.guild) return;

    if (message.member.permissions.has(PermissionsBitField.Flags.Administrator) && durum) {
        let alt_yönetim = [
            "846064625279434802",
            "846064629347516446",
            "846064638759534615",
            "846064643385589810",
            "846064661446262795",
        ];

        let alt_yönetim_ses = message.guild.members.cache.filter(member => member.roles.cache.some(rol => alt_yönetim.includes(rol.id))).size;

        let alt_yönetim_ses_olmayan = message.guild.members.cache.filter(member => member.roles.cache.some(rol => alt_yönetim.includes(rol.id)) && !member.voice.channel && member.presence?.status !== "offline" && !member.user.bot).map(x => `<@${x.id}>`);

        let alt_yönetim_ses_olan = message.guild.members.cache.filter(member => member.roles.cache.some(rol => alt_yönetim.includes(rol.id)) && member.voice.channel && !member.user.bot).map(x => `<@${x.id}>`);

        let embed = new EmbedBuilder()
            .setColor("Random")
            .setTimestamp()
            .setFooter({ text: client.ayarlar.footer })
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setAuthor({ name: message.author.tag, iconURL: message.author.avatarURL({ dynamic: true }) })
            .setDescription(`Sunucumuzda bulunan toplam yetkili sayısı \`${alt_yönetim_ses}\`
Sunucumuzda aktif olup seste olmayan yetkili sayısı \`${alt_yönetim_ses_olmayan.length}\`
Sunucumuzda ses kanallarında bulunan yetkili sayısı \`${alt_yönetim_ses_olan.length}\``);
        
        message.channel.send({ embeds: [embed] });
    } else {
        return;
    }
};

exports.conf = {
    aliases: ["yetkilidurum"]
};

exports.help = {
    name: 'ydurum'
};
