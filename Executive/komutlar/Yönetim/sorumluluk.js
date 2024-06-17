const {
    EmbedBuilder
} = require("discord.js");
const conf = client.ayarlar;
const sorumluluk = require("../../models/sorumluluk");
const sunucuayar = require("../../models/sunucuayar");

module.exports.run = async (client, message, args, durum, kanal) => {
    if (!message.guild) return;

    let sunucuData = await sunucuayar.findOne({ guildID: message.guild.id });
    if (durum || sunucuData.GKV.includes(message.author.id) || message.author.id == message.guild.ownerId || client.ayarlar.sahip.includes(message.author.id)) {
        let sec = args[0];
        if (["oluştur", "aç", "create"].includes(sec)) {
            let isim = args.slice(1).join("_");
            if (!isim) {
                return message.reply("Lütfen bir isim belirleyiniz");
            }
            let newData = sorumluluk({
                guildID: message.guild.id,
                Ad: isim,
                Komut: [],
                Kişiler: []
            });
            newData.save();
            message.reply(`Başarılı bir şekilde **${isim}** adında sorumluluk rolü oluşturdunuz.`);
        }

        if (["kişiler"].includes(sec)) {
            let data = await sorumluluk.find({
                guildID: message.guild.id
            });
            if (data.length == 0) return message.reply("Lütfen en az 1 sorumluluk rolü açınız.");
            if (!args[1]) return message.reply(`Lütfen bir sorumluluk adı giriniz. (İsimler: \`${data.map(x => x.Ad).join(", ")}\`)`);
            let kişiler = message.mentions.members.first() || message.guild.members.cache.get(args[2]);
            if (!kişiler) return message.reply(`Lütfen ${args[1]} sorumluluğunu üstlenecek kişi / kişileri etiketleyiniz`);
            if (data.find(x => x.Ad == args[1]).Kişiler.includes(kişiler.id)) {
                await sorumluluk.updateOne({
                    guildID: message.guild.id,
                    Ad: args[1]
                }, {
                    $pull: {
                        Kişiler: kişiler.id
                    }
                });
            }
            message.channel.send("Başarılı");
            await sorumluluk.updateOne({
                guildID: message.guild.id,
                Ad: args[1]
            }, {
                $push: {
                    Kişiler: kişiler.id
                }
            });
        }

        if (["bak"].includes(sec)) {
            let data = await sorumluluk.find({});
            let data2 = await sorumluluk.findOne({ guildID: message.guild.id, Ad: args[1] });
            if (!data2 && !args[1]) return message.reply(`Lütfen bir sorumluluk adı giriniz. (İsimler: \`${data.map(x => x.Ad).join(", ")}\`)`);
            let mesaj = new EmbedBuilder()
                .setColor("Random")
                .setTimestamp()
                .setFooter({ text: client.ayarlar.footer })
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setDescription(`**${args[1].replace("_", " ").toUpperCase()}** adlı sorumluluğun üyeleri:\n\n${data2.Kişiler.length > 0 ? data2.Kişiler.map(x => `<@${x}>`).join(", ") : "Kişi verileri yoktur."}`);
            message.channel.send({ embeds: [mesaj] });
        }

        if (!sec) {
            let data = await sorumluluk.find({});
            let göster = data.length > 0 ? data.map((veri) => `**Ad:** \`${veri.Ad.replace("_", " ").toUpperCase()}\`\n **Kişiler:** \`${veri.Kişiler.length} kişi\`\n─────────────────────`).join("\n") : "Veri yoktur.";
            message.channel.send({
                embeds: [new EmbedBuilder()
                    .setColor("Random")
                    .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                    .setTimestamp()
                    .setFooter({ text: client.ayarlar.footer })
                    .setDescription(`Aşağıdaki sorumlulukları daha detaylı bir şekilde görmek için aşağıdaki komutu yazınız.\n\`.sorumluluk bak <sorumlulukAd>\`\n─────────────────────\n${göster}`)
                ]
            });
        }
    } else return;
};

exports.conf = {
    aliases: ["Sorumluluk"]
};

exports.help = {
    name: 'sorumluluk'
};
