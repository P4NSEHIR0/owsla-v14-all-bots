const { EmbedBuilder, PermissionsBitField, ChannelType } = require("discord.js");
const mongoose = require("mongoose");
const sunucuayar = require("../../models/sunucuayar");
const stsc = require("../../models/soruncozme");
const moment = require("moment");
const stringtable = require("string-table");

module.exports.run = async (client, message, args, durum, kanal) => {
    if (!message.guild) return;

    if (durum) {
        let sec = args[0];
        let data = await sunucuayar.findOne({ guildID: message.guild.id });
        let embed = new EmbedBuilder()
            .setAuthor({ name: message.member.displayName, iconURL: message.author.avatarURL({ dynamic: true }) })
            .setColor("ORANGE");

        if (["Başlat", "başlat"].includes(sec)) {
            let target = message.mentions.members.map(x => x.id);
            if (target.length < 2) return message.reply("Lütfen en az 2 kişi etiketleyiniz.");
            if (target.includes(message.author.id)) return;
            if (!message.member.voice.channel || !target.some(id => message.guild.members.cache.get(id).voice.channel)) return message.reply("Bir ses kanalında değilsiniz veya etiketlediğiniz kişi bir ses kanalında değil.");

            let soruncozmeData = await stsc.findOne({ userID: message.author.id, guildID: message.guild.id }) || { Type: false };
            if (soruncozmeData.Type) return message.channel.send({ embeds: [embed.setDescription(`Zaten devam etmekte olan bir sorun çözümünüz var. Devam eden sorun çözümünüzü bitirmek için .sorunçözme bitir komutunu kullanabilirsiniz.`)] });

            await stsc.updateOne({ userID: message.author.id, guildID: message.guild.id }, {
                $set: { Type: true, userID: message.author.id, guildID: message.guild.id, Time: Date.now(), Kisi: target }
            }, { upsert: true });

            let startTime = moment(data.Time).locale("tr").format("LLL");
            let endTime = moment(Date.now()).locale("tr").format("LLL");
            let description = `Sorun Çözücü: ${message.author} (\`${message.author.id}\`)\nSorunu Olan Üyeler: ${target.map(x => `<@${x}>`).join(', ')}\nBaşlangıç: ${startTime}\nBitiş: ${endTime}`;
            
            message.channel.send({ embeds: [embed.setTitle("Sorun Çözme Başlatıldı").setDescription(description)] });
            let logChannel = message.guild.channels.cache.find(c => c.name === "sorumluluk_log");
            if (logChannel) {
                logChannel.send({ embeds: [embed.setTitle("Sorun Çözme Başlatıldı").setDescription(description)] });
            }
        }

        if (["durdur", "bitir", "kapat"].includes(sec)) {
            let soruncozmeData = await stsc.findOne({ userID: message.author.id, guildID: message.guild.id }) || { Type: true };
            if (!soruncozmeData.Type) return message.reply({ embeds: [embed.setDescription("Devam eden bir sorun çözümünüz yok. Önce bir sorun çözümü başlatın.")] });

            let endTime = moment(Date.now()).locale("tr").format("LLL");
            let description = `Sorun Çözücü: ${message.author} (\`${message.author.id}\`)\nSorunu Çözülen Üyeler: ${soruncozmeData.Kisi.map(x => `<@${x}>`).join(', ')}\nBaşlangıç: ${moment(soruncozmeData.Time).locale("tr").format("LLL")}\nBitiş: ${endTime}\n\nVerilen sorun çözme hizmetini değerlendirmek için bu mesajın altında bulunan emojilerden birine tıklayabilirsiniz.\n1. Emoji: Çok çok iyi bir sorun çözmeydi.\n2. Emoji: Çok iyiydi.\n3. Emoji: İyiydi`;

            let sentMessage = await message.channel.send({ embeds: [embed.setTitle("Sorun Çözüldü").setDescription(description)] });

            let emojis = ["1️⃣", "2️⃣", "3️⃣"];
            for (let emoji of emojis) {
                await sentMessage.react(emoji);
            }

            let collectors = emojis.map((emoji, index) => {
                return sentMessage.createReactionCollector({
                    filter: (reaction, user) => reaction.emoji.name === emoji && soruncozmeData.Kisi.includes(user.id),
                    max: 1,
                    time: 30000
                });
            });

            collectors.forEach((collector, index) => {
                collector.on("collect", async () => {
                    await sentMessage.reactions.removeAll();
                    await update(message, soruncozmeData, index + 1);
                    await message.channel.send("Oylama yaptığın için teşekkürler, iyi eğlenceler!");
                });
            });

            setTimeout(async () => {
                await sentMessage.delete();
                await update(message, soruncozmeData, 0);
            }, 30000);

            await stsc.updateOne({ userID: message.author.id, guildID: message.guild.id }, { $set: { Type: false } });
            let logChannel = message.guild.channels.cache.find(c => c.name === "sorumluluk_log");
            if (logChannel) {
                logChannel.send({ embeds: [embed.setTitle("Sorun Çözüldü").setDescription(description)] });
            }
        }

        if (sec === "top") {
            let data = await stsc.find({});
            let topList = data.map((user) => {
                return {
                    Id: user.userID,
                    Total: user.Katılanlar.length
                }
            }).sort((a, b) => b.Total - a.Total).map((data, index) => `${index + 1}. Sorun Çözme: ${message.guild.members.cache.get(data.Id).displayName} - Kişi: ${data.Total}`).join("\n");

            message.channel.send({ embeds: [embed.setTitle("Sorun Çözme Listesi").setDescription(`\`\`\`${topList}\`\`\``)] });
        }

        if (sec === "bilgi") {
            let emoji = client.emojis.cache.find(x => x.name === "stfuterapi");
            let target = message.mentions.members.first() || message.guild.members.cache.get(sec);
            if (!target) return;
            let data = await stsc.findOne({ userID: target.id, guildID: message.guild.id });

            if (!data) return message.channel.send("Bu kullanıcıya ait sorun çözme bilgisi bulunamadı.");

            embed.setDescription(`
${target} adlı üyenin sorun çözme bilgileri aşağıda yer almaktadır.

**Son Çözülen Sorun**
\`\`\`
Sorun Çözücü => ${message.member.displayName}
Sorunu Olanlar => ${data.Katılanlar.reverse()[0].Id.map(data => message.guild.members.cache.get(data).displayName).join(', ')}
Başlangıç => ${data.Katılanlar.reverse()[0].Baslangic}
Bitiş => ${data.Katılanlar.reverse()[0].Bitis}
Memnuniyet => ${data.Katılanlar.reverse()[0].Memnuniyet == 1 ? "Çok İyi" : data.Katılanlar.reverse()[0].Memnuniyet == 2 ? "İyi" : data.Katılanlar.reverse()[0].Memnuniyet == 3 ? "Kötü" : "Oy Verilmedi"}
\`\`\`

**Daha fazlası için ${emoji} tepkisine tıklayınız**
`);

            let msg = await message.channel.send({ embeds: [embed] });
            msg.react(emoji);

            const filter = (reaction, user) => reaction.emoji.name === emoji.name && user.id === message.author.id;
            const collector = msg.createReactionCollector({ filter, time: 60000 });

            collector.on("collect", async () => {
                await msg.reactions.removeAll();
                let table = stringtable.create(data.Katılanlar.map(x => ({
                    "Sorun Çözücü": message.member.displayName,
                    "Sorunu Olanlar": x.Id.map(x => message.guild.members.cache.get(x).user.username).join(', '),
                    "Başlangıç": x.Baslangic,
                    "Bitiş": x.Bitis,
                    "Memnuniyet": x.Memnuniyet == 1 ? "Çok İyi" : x.Memnuniyet == 2 ? "İyi" : x.Memnuniyet == 3 ? "Kötü" : "Oy Verilmedi"
                })));
                await message.channel.send(`\`\`\`md\n${table}\n\`\`\``, { split: true });
            });
        }

        if (sec === "yardım" || !sec) {
            embed
                .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) })
                .setFooter({ text: client.ayarlar.footer })
                .setTimestamp()
                .setColor("RANDOM")
                .setTitle("Sorun Çözme Sistemi Nasıl Çalışır?")
                .setDescription(`
Bu sistemin çalışma mantığı çok anlaşılır ve basit bir şekilde kodlanmıştır.
Öncelikle sorun çözme yapmak istediğiniz kişi ile aynı odaya giriyorsunuz ve ardından aşağıdaki adımları takip ediniz.

**Komutlar:**
\`\`\`
${client.ayarlar.prefix[0]}sorunçözme başlat @etiket
${client.ayarlar.prefix[0]}sorunçözme bitir
${client.ayarlar.prefix[0]}sorunçözme bilgi @etiket
${client.ayarlar.prefix[0]}sorunçözme top
\`\`\`

şeklinde kullanım sağlayarak sorun çözme komutunu sorunsuz bir şekilde çalıştırabilirsiniz.
`);

            message.channel.send({ embeds: [embed] });
        }
    }
};

exports.conf = {
    aliases: []
};

exports.help = {
    name: 'soruncozme'
};

async function update(message, data, miktar) {
    await stsc.updateOne({ userID: message.author.id, guildID: message.guild.id }, {
        $set: { Type: false },
        $push: {
            Katılanlar: {
                "Id": data.Kisi,
                "Memnuniyet": miktar,
                "Baslangic": moment(data.Time).locale("tr").format("LLL"),
                "Bitis": moment(Date.now()).locale("tr").format("LLL")
            }
        }
    }, { upsert: true });
}
