const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports.run = async (client, message, args, durum, kanal) => {
    if (!message.guild) return;
    if (kanal) return;
    if (!message.member.voice.channel) return message.channel.send(`Bir ses kanalında olman gerek`);
    
    const specialMembers = {
        "731432916491567145": "795071123758907432",
        "795071123758907432": "731432916491567145"
    };

    if (args[0] === "aşkım" && specialMembers[message.member.id]) {
        return message.guild.members.cache.get(specialMembers[message.member.id]).voice.setChannel(message.member.voice.channel.id);
    }

    let target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!target) return message.reply("Lütfen bir kullanıcı etiketleyiniz veya ID'si giriniz.");
    if (!target.voice.channel) return message.channel.send("Bu Kullanıcı Bir Ses Kanalında Değil");
    if (message.member.voice.channel.id === target.voice.channel.id) return message.channel.send("Zaten Aynı Kanaldasınız.");

    let embed = new EmbedBuilder()
        .setColor("RANDOM")
        .setTimestamp()
        .setFooter(client.ayarlar.footer);

    if (message.member.permissions.has(PermissionsBitField.Flags.Administrator) || durum) {
        await target.voice.setChannel(message.member.voice.channel.id);
        message.react("✅").catch();
    } else {
        const reactionFilter = (reaction, user) => ['✅'].includes(reaction.emoji.name) && user.id === target.id;
        let msg = await message.channel.send({
            content: `${target}`,
            embeds: [embed.setAuthor({ name: target.displayName, iconURL: target.user.avatarURL({ dynamic: true, size: 2048 }) })
                .setDescription(`${message.author} seni ses kanalına çekmek için izin istiyor! Onaylıyor musun?`)]
        });
        await msg.react('✅');
        msg.awaitReactions({ filter: reactionFilter, max: 1, time: 1000 * 15, errors: ['time'] })
            .then(collected => {
                let reaction = collected.first();
                if (reaction) {
                    target.voice.setChannel(message.member.voice.channel.id);
                    msg.delete();
                    message.react("✅").catch();
                }
            });
    }
}

exports.conf = { aliases: ["cek", "Çek", "Cek"] };
exports.help = { name: 'çek' };
