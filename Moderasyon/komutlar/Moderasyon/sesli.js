const { EmbedBuilder } = require('discord.js');
const sunucuayar = require("../../models/sunucuayar");

module.exports.run = async (client, message, args, durum, kanal) => {
    if (kanal) return;
    if (message.member.permissions.has(PermissionsBitField.Flags.Administrator) || durum) {
        let data = await sunucuayar.findOne({ guildID: message.guild.id });
        let members = message.guild.members.cache.filter(m => m.voice.channel);
        let tag = data.TAG;
        let enAltYetkiliRolu = message.guild.roles.cache.get(data.EnAltYetkiliRol).position;
        let aktif3Kategori = message.guild.channels.cache
            .filter(c => c.type === ChannelType.GuildCategory)
            .sort((a, b) => {
                let aChannel = message.guild.channels.cache
                    .filter(c => c.type === ChannelType.GuildVoice && c.parentId === a.id)
                    .map(c => c.members.size)
                    .reduce((q, w) => q + w, 0);
                let bChannel = message.guild.channels.cache
                    .filter(c => c.type === ChannelType.GuildVoice && c.parentId === b.id)
                    .map(c => c.members.size)
                    .reduce((q, w) => q + w, 0);
                return bChannel - aChannel;
            })
            .slice(0, 3);

        let desc = `Sesli kanallarda toplamda **${members.size}** üye bulunuyor!
        Public ses kategorisinde toplamda **${members.filter(m => data.PUBCategory.includes(m.voice.channel.parentId)).size}** üye bulunuyor!
        Sesli kanallarda **${members.filter(m => !m.user.username.includes(tag)).size}** normal üye bulunuyor!
        Sesli kanallarda **${members.filter(m => m.user.username.includes(tag)).size}** taglı üye bulunuyor!
        Sesli kanallarda **${members.filter(m => m.roles.highest.position >= enAltYetkiliRolu).size}** yetkili bulunuyor!
        Sesli kanallarda **${members.filter(m => m.voice.streaming).size}** üye yayın yapıyor!
        Mikrofonu kapalı üyeler: **${members.filter(m => m.voice.selfMute).size}**
        Kulaklığı kapalı üyeler: **${members.filter(m => m.voice.selfDeaf).size}**
        Botlar: **${members.filter(m => m.user.bot).size}**

        Top **3** ses kategorisi:
        ${aktif3Kategori.map((c, index) => `\`${index + 1}.\` ${c.toString()}: ${message.guild.channels.cache.filter(d => d.type === ChannelType.GuildVoice && d.parentId === c.id).map(d => d.members.size).reduce((q, w) => q + w, 0)}`).join("\n")}`;

        let embed = new EmbedBuilder()
            .setDescription(desc)
            .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) })
            .setColor("BLACK")
            .setTimestamp()
            .setFooter({ text: `${message.author.tag} tarafından istendi!`, iconURL: message.author.avatarURL({ dynamic: true }) });

        message.channel.send({ embeds: [embed] }).then(x => setTimeout(() => x.delete(), 50000));
    }
};

exports.conf = {
    aliases: []
};

exports.help = {
    name: 'sesli'
};
