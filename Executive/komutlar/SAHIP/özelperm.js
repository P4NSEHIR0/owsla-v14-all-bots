const { EmbedBuilder, PermissionsBitField, ChannelType } = require("discord.js");
const conf = client.ayarlar;

module.exports.run = async (client, message, args, durum, kanal) => {
    if (!message.guild) return;

    if (durum) {
        let sec = args[0];
        if (!sec) return message.reply("Lütfen bir komut giriniz");

        if (sec === "bak") {
            let db = await client.db.find({ guildID: message.guild.id });
            if (db.length === 0) return message.channel.send("Hiçbir özel perm bilgisi bulunamadı.");

            const embed = new EmbedBuilder()
                .setTitle("Özel Perm Bilgileri")
                .setColor("BLUE")
                .setDescription(db.map((x, index) => `
                    (${index + 1}) Komut Adı => ${x.komutAd} (${x.kisiler.length} adet kişi var) - (${x.roller.length} adet rol var)
                    Kişiler: ${x.kisiler.length !== 0 ? x.kisiler.map(id => message.guild.members.cache.get(id)?.displayName || "Bilinmeyen Kişi").join(", ") : "Kişi yoktur"}
                    Roller: ${x.roller.length !== 0 ? x.roller.map(id => message.guild.roles.cache.get(id)?.name || "Bilinmeyen Rol").join(", ") : "Rol yoktur"}\n`
                ).join("\n"))
                .setTimestamp();

            return message.channel.send({ embeds: [embed] });
        }

        let rol = message.mentions.roles.map(r => r.id);
        let user = message.mentions.members.map(m => m.id);

        client.db.findOne({ komutAd: sec, guildID: message.guild.id }, (err, res) => {
            if (err) {
                console.error(err);
                return message.reply("Veritabanı hatası oluştu.");
            }

            if (!res) {
                let newData = new client.db({
                    guildID: message.guild.id,
                    komutAd: sec,
                    roller: rol,
                    kisiler: user,
                });

                message.reply(`Başarılı bir şekilde ${user.length > 0 && rol.length > 0 ? `${user.map(x => `<@${x}>`).join(", ")} üyelerini ve ${rol.map(x => `<@&${x}>`).join(", ")} rollerini ekledin` : rol.length > 0 ? rol.map(x => `<@&${x}>`).join(", ") + " rollerini ekledin" : user.length > 0 ? user.map(x => `<@${x}>`).join(", ") + " kişilerini ekledin" : ``}`);
                newData.save();
            } else {
                if (rol.length > 0) {
                    res.roller = rol;
                }
                if (user.length > 0) {
                    res.kisiler = user;
                }
                res.save();
                message.reply(`Başarılı bir şekilde ${user.length > 0 && rol.length > 0 ? `${user.map(x => `<@${x}>`).join(", ")} üyelerini ve ${rol.map(x => `<@&${x}>`).join(", ")} rollerini ekledin` : rol.length > 0 ? rol.map(x => `<@&${x}>`).join(", ") + " rollerini ekledin" : user.length > 0 ? user.map(x => `<@${x}>`).join(", ") + " kişilerini ekledin" : ``}`);
            }
        });
    }
};

exports.conf = {
    aliases: ["ÖzelPerm"]
};

exports.help = {
    name: 'özelperm'
};
