const { EmbedBuilder } = require("discord.js");
const moment = require("moment");
const ms = require("ms");
const sunucuayar = require("../../models/sunucuayar");
const ceza = require("../../models/ceza");
const profil = require("../../models/profil");
const jailInterval = require("../../models/jailInterval");
const vkInterval = require("../../models/vkInterval");

moment.locale("tr");
var limit = new Map();

module.exports.run = async (client, message, args, durum, kanal) => {
    if (!message.guild) return;
    
    let data = await sunucuayar.findOne({});
    let cezaID = data.WARNID;
    let JailROL = data.VKCEZALI;

    if (durum) {
        let target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        let reason = args.splice(2).join(" ") || "Sebep Yok";
        let time = args[1];
        if (!target) return message.channel.send(`Lütfen bir kişi belirtiniz`);
        if (!time) return message.channel.send(`Lütfen bir süre belirtiniz`);
        if (target.roles.cache.has(JailROL)) return message.react(client.emojis.cache.find(res => res.name === "stfu_iptal"));
        if (limit.get(`${message.author.id}`) >= 3) return message.reply(`\`VK-Cezalı komutu için limite ulaştın!\``);
        if (target.id === message.author.id) return message.channel.send(`Kendine VK-Cezalı atamazsın!`);
        let cezalar = await ceza.find({ userID: target.id });
        if (cezalar.length == 0) {
            cezalar = [{ Puan: 0 }, { Puan: 0 }];
        }
        if (client.ayarlar.CEZA_PUAN_SYSTEM == true) {
            if (cezalar.map(x => x.Puan).reduce((a, b) => a + b) >= 200) {
                let jailData = await jailInterval.findOne({ userID: target.id });
                if (!jailData) {
                    let newData = new jailInterval({
                        userID: target.id,
                        jailed: true,
                    });
                    await newData.save();
                } else {
                    jailData.endDate = null;
                    jailData.jailed = true;
                    await jailData.save();
                }
                await target.roles.set(target.roles.cache.has(data.BOOST) ? [data.JAIL, data.BOOST] : [data.JAIL]);
                return message.channel.send(`${target.id} adlı üye **200 Ceza Puan'ı** yaptığı için cezalı üyelerin arasına gönderildi!`);
            }
        }

        let embedDescription = `${target} Üyesi Sunucudan **${reason}** sebebiyle ${message.author} Tarafından **${args[1].replace("h", " saat").replace("m", " dakika").replace("s", " saniye")} vk-cezalı** cezası yedi! **Ceza Numarası:** (\`#${cezaID + 1}\`)`;
        let messageLogEmbed = new EmbedBuilder()
            .setColor("RANDOM")
            .setAuthor({ name: message.author.tag, iconURL: message.author.avatarURL({ dynamic: true }) })
            .setFooter({ text: client.ayarlar.footer })
            .setTimestamp()
            .setDescription(`
• Ceza ID: \`#${cezaID + 1}\`
• Cezalanan Üye: ${target} (\`${target.id}\`)
• Cezalayan Yetkili: ${message.author} (\`${message.author.id}\`)
• Ceza Tarihi: \`${moment(Date.now()).format('LLL')}\`
• Ceza Sebebi: [\`${reason}\`]
`);

        let vkData = await vkInterval.findOne({ userID: target.id });
        if (!vkData) {
            let newData = new vkInterval({
                userID: target.id,
                vktype: true,
                endDate: Date.now() + ms(time)
            });
            await newData.save();
            limit.set(`${message.author.id}`, (Number(limit.get(`${message.author.id}`) || 0)) + 1);
            setTimeout(() => {
                limit.set(`${message.author.id}`, (Number(limit.get(`${message.author.id}`) || 0)) - 1);
            }, 1000 * 60 * 3);
            await banSistemi(message, embedDescription, client, messageLogEmbed, target, cezaID, reason, args, ms, JailROL, data);
            await client.toplama(cezalar, client.ayarlar.CEZA_PUAN_KANAL, target.id, cezaID, 5);
        } else {
            limit.set(`${message.author.id}`, (Number(limit.get(`${message.author.id}`) || 0)) + 1);
            setTimeout(() => {
                limit.set(`${message.author.id}`, (Number(limit.get(`${message.author.id}`) || 0)) - 1);
            }, 1000 * 60 * 3);
            vkData.vktype = true;
            vkData.endDate = Date.now() + ms(time);
            await vkData.save();
            await banSistemi(message, embedDescription, client, messageLogEmbed, target, cezaID, reason, args, ms, JailROL, data);
            await client.toplama(cezalar, client.ayarlar.CEZA_PUAN_KANAL, target.id, cezaID, 5);
        }
    } else {
        return message.channel.send(`Bu komutu kullanabilmek için Yönetici - Mute Sorumlusu olmalısın!`);
    }
};

exports.conf = {
    aliases: ["vk-cezalı", "Vk-cezalı", "VK-Cezalı"]
};
exports.help = {
    name: 'vkcezalı'
};

async function banSistemi(message, embedDescription, client, messageLogEmbed, target, cezaID, reason, args, ms, JailROL, booster) {
    await target.roles.add(target.roles.cache.has(booster) ? [JailROL, booster] : [JailROL]).then(async () => {
        await message.channel.send(embedDescription);
        let logChannel = client.channels.cache.find(x => x.name == "vk-cezali-log");
        if (logChannel) {
            logChannel.send({ embeds: [messageLogEmbed] });
        }
        let newData = new ceza({
            ID: cezaID + 1,
            userID: target.id,
            Yetkili: message.author.id,
            Ceza: "VK-CEZA",
            Sebep: reason,
            Puan: 5,
            Atilma: Date.now(),
            Bitis: Date.now() + ms(args[1]),
        });
        await client.savePunishment();
        await newData.save();
    });
}
