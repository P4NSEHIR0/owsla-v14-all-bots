const {
    EmbedBuilder,
    PermissionsBitField,
    Collection,
    ChannelType
} = require("discord.js");
const conf = client.ayarlar;
let moment = require("moment");
moment.locale("tr");
let ms = require("ms");
let mongoose = require("mongoose");
let sunucuayar = require("../../models/sunucuayar");
let ceza = require("../../models/ceza");
let profil = require("../../models/profil");
let muteInterval = require("../../models/muteInterval");
let jailInterval = require("../../models/jailInterval");
let vmuteInterval = require("../../models/vmuteInterval");
var limit = new Collection();

module.exports.run = async (client, message, args, durum, kanal) => {
    if (!message.guild) return;
    
    let sec = args[0];
    let data = await sunucuayar.findOne({});
    let cezaID = data.WARNID;

    if (sec === "mutesetup") {
        if (!args[1]) return message.reply("Lütfen `yetki-kanal-limit` belirleyiniz");
        if (conf.sahip.includes(message.author.id) || message.member.permissions.has(PermissionsBitField.Flags.Administrator) || message.author.id === message.guild.ownerId) {
            if (args[1] === "yetki") {
                let select;
                if (message.mentions.roles.size >= 1) {
                    select = message.mentions.roles.map(r => r.id);
                } else {
                    select = args.splice(1).map(id => message.guild.roles.cache.get(id)).filter(r => r != undefined);
                }
                if (!select) return message.react(client.emojis.cache.find(res => res.name === "stfu_iptal"));
                data.MUTEAuthorized = select;
                data.save().then(() => message.react(client.emojis.cache.find(res => res.name === "stfu_tik")));
            } else if (args[1] === "kanal") {
                let select = message.mentions.channels.first();
                if (!select) return message.react(client.emojis.cache.find(res => res.name === "stfu_iptal"));
                data.MUTEChannel = select.id;
                data.save().then(() => message.react(client.emojis.cache.find(res => res.name === "stfu_tik")));
            } else if (args[1] === "limit") {
                let select = Number(args[2]);
                if (!select) return message.react(client.emojis.cache.find(res => res.name === "stfu_iptal"));
                data.MUTELimit = select;
                data.save().then(() => message.react(client.emojis.cache.find(res => res.name === "stfu_tik")));
            }
        } else return message.reply("Bu komutu kullanabilmek için YÖNETİCİ - Sunucu Sahibi olmanız gerekiyor");
    } else if (sec === "vmutesetup") {
        if (!args[1]) return message.reply("Lütfen `yetki-kanal-limit` belirleyiniz");
        if (conf.sahip.includes(message.author.id) || message.member.permissions.has(PermissionsBitField.Flags.Administrator) || message.author.id === message.guild.ownerId) {
            if (args[1] === "yetki") {
                let select;
                if (message.mentions.roles.size >= 1) {
                    select = message.mentions.roles.map(r => r.id);
                } else {
                    select = args.splice(1).map(id => message.guild.roles.cache.get(id)).filter(r => r != undefined);
                }
                if (!select) return message.react(client.emojis.cache.find(res => res.name === "stfu_iptal"));
                data.VMUTEAuthorized = select;
                data.save().then(() => message.react(client.emojis.cache.find(res => res.name === "stfu_tik")));
            } else if (args[1] === "kanal") {
                let select = message.mentions.channels.first();
                if (!select) return message.react(client.emojis.cache.find(res => res.name === "stfu_iptal"));
                data.VMUTEChannel = select.id;
                data.save().then(() => message.react(client.emojis.cache.find(res => res.name === "stfu_tik")));
            } else if (args[1] === "limit") {
                let select = Number(args[2]);
                if (!select) return message.react(client.emojis.cache.find(res => res.name === "stfu_iptal"));
                data.VMuteLimit = select;
                data.save().then(() => message.react(client.emojis.cache.find(res => res.name === "stfu_tik")));
            }
        } else return message.reply("Bu komutu kullanabilmek için YÖNETİCİ - Sunucu Sahibi olmanız gerekiyor");
    } else {
        let target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        let reason = args.splice(2).join(" ") || "Sebep Yok";
        let time = args[1];
        if (!target) return client.Embed(message.channel.id, `Lütfen bir kişi belirtiniz`);
        if (!time) return client.Embed(message.channel.id, `Lütfen bir süre belirtiniz`);
        let cezalar = await ceza.find({ userID: target.id });
        if (cezalar.length === 0) {
            cezalar = [{ Puan: 0 }, { Puan: 0 }];
        }

        await message.react(client.emojis.cache.find(x => x.name === "stfu_mute"));
        await message.react(client.emojis.cache.find(x => x.name === "stfu_vmute"));

        const filter = (reaction, user) => {
            return ["stfu_mute", "stfu_vmute"].includes(reaction.emoji.name) && user.id === message.author.id;
        };

        const collector = message.createReactionCollector({ filter, max: 1, time: 30000, errors: ['time'] });

        collector.on("collect", async (reaction) => {
            message.reactions.removeAll();
            message.react(client.emojis.cache.find(x => x.name === "stfu_tik"));
            if (reaction.emoji.name === "stfu_mute") {
                if (await client.permAyar(message.author.id, message.guild.id, "mute") || durum) {
                    let muteSorumlusu = data.MUTEAuthorized;
                    let muteLogKanal = data.MUTEChannel;
                    let muteLimit = data.MUTELimit;
                    let muteROL = data.MUTED;
                    if (muteSorumlusu.length >= 1 && client.channels.cache.get(muteLogKanal) && muteLimit >= 1) {
                        if (target.roles.cache.has(muteROL)) return message.react(client.emojis.cache.find(res => res.name === "stfu_iptal"));
                        if (limit.get(message.author.id) >= muteLimit) return message.reply("`mute komutu için limite ulaştın!`");
                        if (message.member.roles.highest.position <= target.roles.highest.position) return client.Embed(message.channel.id, `Belirttiğin kişi senden üstün veya onunla aynı yetkidesin!`);
                        if (target.id === message.author.id) return client.Embed(message.channel.id, `Kendine mute atamazsın!`);

                        if (client.ayarlar.CEZA_PUAN_SYSTEM) {
                            if (cezalar.map(x => x.Puan).reduce((a, b) => a + b) >= 200) {
                                await jailInterval.findOne({ userID: target.id }, (err, data) => {
                                    if (!data) {
                                        let newData = new jailInterval({
                                            userID: target.id,
                                            jailed: true,
                                        });
                                        newData.save();
                                    } else {
                                        data.jailed = true;
                                        data.save();
                                    }
                                });
                                await target.roles.set(target.roles.cache.get(data.BOOST) ? [data.JAIL, data.BOOST] : [data.JAIL]);
                                return message.channel.send(`${target.id} adlı üye **200 Ceza Puan'ı** yaptığı için cezalı üyelerin arasına gönderildi!`);
                            }
                        }

                        let embedBuilderContent = `${target} Üyesi Sunucudan **${reason}** sebebiyle ${message.author} Tarafından **${args[1].replace("h", " saat").replace("m", " dakika").replace("s", " saniye")} mute** cezası yedi! **Ceza Numarası:** (\`#${cezaID+1}\`)`;
                        let messageLogEmbed = new EmbedBuilder()
                            .setColor("Random")
                            .setAuthor({ name: message.author.tag, iconURL: message.author.avatarURL({ dynamic: true }) })
                            .setFooter({ text: conf.footer })
                            .setTimestamp()
                            .setDescription(`
• Ceza ID: \`#${cezaID+1}\`
• Mutelenen Üye: ${target} (\`${target.id}\`)
• Muteleyen Yetkili: ${message.author} (\`${message.author.id}\`)
• Mute Tarihi: \`${moment(Date.now()).format('LLL')}\`
• Mute Bitiş Tarihi: \`${moment(Date.now() + ms(args[1])).format('LLL')}\`
• Mute Sebebi: [\`${reason}\`]
`);
                        await muteInterval.findOne({ userID: target.id }, async (err, data) => {
                            if (!data) {
                                let newData = muteInterval({
                                    userID: target.id,
                                    muted: true,
                                    endDate: Date.now() + ms(args[1]),
                                    muteReason: reason,
                                    yetkiliID: message.author.id
                                });
                                newData.save();
                            } else {
                                data.endDate = Date.now() + ms(args[1]);
                                data.muted = true;
                                data.muteReason = reason;
                                data.yetkiliID = message.author.id;
                                data.save();
                            }
                        });
                        await ceza.updateOne({ ID: cezaID + 1 }, { $inc: { ID: 1 } });

                        target.roles.add(muteROL);
                        client.channels.cache.get(muteLogKanal).send({ embeds: [messageLogEmbed] });
                        message.channel.send({ content: embedBuilderContent });
                        if (conf.seseatilan && target.voice.channel) {
                            target.voice.setMute(true).catch(() => {});
                        }
                    } else return message.reply("Lütfen mute komutunu doğru bir şekilde ayarlayınız: `yetkili, kanal, limit`");
                } else return message.reply("Bu komutu kullanmaya yetkin yok!");
            } else if (reaction.emoji.name === "stfu_vmute") {
                if (await client.permAyar(message.author.id, message.guild.id, "vmute") || durum) {
                    let vmuteSorumlusu = data.VMUTEAuthorized;
                    let vmuteLogKanal = data.VMUTEChannel;
                    let vmuteLimit = data.VMuteLimit;
                    let vmuteROL = data.VMUTED;
                    if (vmuteSorumlusu.length >= 1 && client.channels.cache.get(vmuteLogKanal) && vmuteLimit >= 1) {
                        if (target.roles.cache.has(vmuteROL)) return message.react(client.emojis.cache.find(res => res.name === "stfu_iptal"));
                        if (limit.get(message.author.id) >= vmuteLimit) return message.reply("`voice mute komutu için limite ulaştın!`");
                        if (message.member.roles.highest.position <= target.roles.highest.position) return client.Embed(message.channel.id, `Belirttiğin kişi senden üstün veya onunla aynı yetkidesin!`);
                        if (target.id === message.author.id) return client.Embed(message.channel.id, `Kendine voice mute atamazsın!`);

                        if (client.ayarlar.CEZA_PUAN_SYSTEM) {
                            if (cezalar.map(x => x.Puan).reduce((a, b) => a + b) >= 200) {
                                await jailInterval.findOne({ userID: target.id }, (err, data) => {
                                    if (!data) {
                                        let newData = new jailInterval({
                                            userID: target.id,
                                            jailed: true,
                                        });
                                        newData.save();
                                    } else {
                                        data.jailed = true;
                                        data.save();
                                    }
                                });
                                await target.roles.set(target.roles.cache.get(data.BOOST) ? [data.JAIL, data.BOOST] : [data.JAIL]);
                                return message.channel.send(`${target.id} adlı üye **200 Ceza Puan'ı** yaptığı için cezalı üyelerin arasına gönderildi!`);
                            }
                        }

                        let embedBuilderContent = `${target} Üyesi Sunucuda Sesli Kanallarda **${reason}** sebebiyle ${message.author} Tarafından **${args[1].replace("h", " saat").replace("m", " dakika").replace("s", " saniye")} voice mute** cezası yedi! **Ceza Numarası:** (\`#${cezaID+1}\`)`;
                        let messageLogEmbed = new EmbedBuilder()
                            .setColor("Random")
                            .setAuthor({ name: message.author.tag, iconURL: message.author.avatarURL({ dynamic: true }) })
                            .setFooter({ text: conf.footer })
                            .setTimestamp()
                            .setDescription(`
• Ceza ID: \`#${cezaID+1}\`
• Voice Mutelenen Üye: ${target} (\`${target.id}\`)
• Voice Muteleyen Yetkili: ${message.author} (\`${message.author.id}\`)
• Voice Mute Tarihi: \`${moment(Date.now()).format('LLL')}\`
• Voice Mute Bitiş Tarihi: \`${moment(Date.now() + ms(args[1])).format('LLL')}\`
• Voice Mute Sebebi: [\`${reason}\`]
`);
                        await vmuteInterval.findOne({ userID: target.id }, async (err, data) => {
                            if (!data) {
                                let newData = vmuteInterval({
                                    userID: target.id,
                                    muted: true,
                                    endDate: Date.now() + ms(args[1]),
                                    muteReason: reason,
                                    yetkiliID: message.author.id
                                });
                                newData.save();
                            } else {
                                data.endDate = Date.now() + ms(args[1]);
                                data.muted = true;
                                data.muteReason = reason;
                                data.yetkiliID = message.author.id;
                                data.save();
                            }
                        });
                        await ceza.updateOne({ ID: cezaID + 1 }, { $inc: { ID: 1 } });

                        target.roles.add(vmuteROL);
                        client.channels.cache.get(vmuteLogKanal).send({ embeds: [messageLogEmbed] });
                        message.channel.send({ content: embedBuilderContent });
                        if (conf.seseatilan && target.voice.channel) {
                            target.voice.setMute(true).catch(() => {});
                        }
                    } else return message.reply("Lütfen voice mute komutunu doğru bir şekilde ayarlayınız: `yetkili, kanal, limit`");
                } else return message.reply("Bu komutu kullanmaya yetkin yok!");
            }
        });

        collector.on("end", (collected, reason) => {
            if (reason === "time") {
                message.reactions.removeAll();
                message.react(client.emojis.cache.find(x => x.name === "stfu_iptal"));
            }
        });
    }
};

module.exports.conf = {
    aliases: ["mute"]
};

module.exports.help = {
    name: "mute"
};
