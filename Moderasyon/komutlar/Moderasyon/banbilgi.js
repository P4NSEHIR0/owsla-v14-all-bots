const { EmbedBuilder, Client, GatewayIntentBits, Partials } = require('discord.js');
const moment = require('moment');
moment.locale('tr');

module.exports.run = async (client, message, args, durum, kanal) => {
    if (!message.guild) return;

    if (await client.permAyar(message.author.id, message.guild.id, 'ban') || durum) {
        let embed = new EmbedBuilder()
            .setColor('Random')
            .setAuthor({ name: message.author.tag, iconURL: message.author.avatarURL({ dynamic: true }) });

        if (!args[0]) return message.channel.send({ embeds: [embed.setDescription('Geçerli bir kullanıcı ID si giriniz.')] });

        await client.users.fetch(args[0]).then(res => {
            if (!res) {
                embed.setDescription('Geçerli bir kullanıcı ID si giriniz.');
                return message.channel.send({ embeds: [embed] });
            } else {
                message.guild.bans.fetch().then(async bans => {
                    let ban = bans.find(a => a.user.id === res.id);
                    if (!ban) {
                        embed.setDescription(`\`${res.tag}\` bu sunucuda yasaklı değil!`);
                        return message.channel.send({ embeds: [embed] });
                    } else {
                        let text = `:no_entry_sign:  ${res.tag} (\`${res.id}\`) adlı kullanıcı sunucumuzdan şu sebepten dolayı yasaklanmış:\n\n"${ban.reason || 'Sebep Belirtilmemiş.'}"`;
                        message.guild.fetchAuditLogs({ type: 'MEMBER_BAN_ADD', limit: 100 }).then(audit => {
                            let user = audit.entries.find(a => a.target.id === res.id);
                            if (user) {
                                embed.setDescription(text + `\n─────────────────────────────\nKullanıcı, ${user.executor.tag} (\`${user.executor.id}\`) tarafından ${moment(user.createdAt).format('lll')} tarihinde yasaklanmış.`);
                                return message.channel.send({ embeds: [embed] });
                            } else {
                                embed.setDescription(text + '\n\nBu yasaklama, son 100 yasaklama içinde olmadığından dolayı ban bilgisini yazamıyorum.');
                                return message.channel.send({ embeds: [embed] });
                            }
                        });
                    }
                });
            }
        }).catch(err => {
            embed.setDescription('Geçerli bir kullanıcı ID si giriniz.');
            return message.channel.send({ embeds: [embed] });
        });
    } else return;
};

exports.conf = { aliases: ['banbilgi', 'bansorgu'] };
exports.help = { name: 'ban-bilgi' };
