const { PermissionsBitField } = require("discord.js");

module.exports.run = async (client, message, args, durum, kanal) => {
    if (!message.guild) return;

    if (message.member.permissions.has(PermissionsBitField.Flags.Administrator) || durum) {
        let kanal_1 = message.guild.channels.cache.get(args[0]);
        let kanal_2 = message.guild.channels.cache.get(args[1]);
        if (kanal_1 && kanal_2) {
            let members = Array.from(kanal_1.members.values());
            members.forEach((member, index) => {
                setTimeout(async () => {
                    try {
                        await member.voice.setChannel(kanal_2);
                    } catch (error) {
                        console.error(`Üye ${member.user.tag} taşınırken bir hata oluştu:`, error);
                    }
                }, index * 1500);
            });
            message.channel.send(`**${kanal_1.members.size}** adet üyeyi başarılı bir şekilde ${kanal_2} kanalına taşıdınız!`).catch(console.error);
        } else {
            return message.reply(`Lütfen geçerli bir kanal ID'si belirtiniz!`).catch(console.error);
        }
    } else {
        return message.reply("Bu komutu kullanabilmek için Ozel Rol Sorumlusu ya da Yönetici olmalısınız.").catch(console.error);
    }
};

exports.conf = { aliases: ["ttasi", "ttaşı"] };
exports.help = { name: 'toplu-tasi' };
