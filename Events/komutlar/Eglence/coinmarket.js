const {
    EmbedBuilder
} = require("discord.js");
const Stat = require("../../models/stats");
const market = require("../../models/market");
let limit = new Map();
module.exports.run = async (client, message, args, durum, kanal) => {
    Promise.prototype.sil = function (time) {
        if (this) this.then(s => {
            if (s.deletable) {
                setTimeout(async () => {
                    s.delete().catch(e => {});
                }, time * 1000)
            }
        });
    };

    if (!message.guild) return;
    let kanallar = ["coin-komut", "coin-komut-2"]
    if (!kanallar.some((x) => message.channel.name.toLowerCase().includes(x))) return message.reply({
        content: `Bu komutları sadece coin kanallarında kullanabilirsiniz.`
    }).sil(15);
    const statt = await Stat.findOne({
        userID: message.author.id,
        guildID: message.guild.id
    });
    const data = await market.findOne({}) || {
        Spotify: [],
        Netflix: [],
        Exxen: [],
        BluTV: []
    };
    let sec = args[0];
    if (!sec) {
        let kodumunkodu = [`
Dilediğin ürüne sahip ol!
Unutma ürünleri stok durumuna göre alıyorsun stokları kontrol etmek için ürünü almayı deneyiniz.
- **\`.cm al {id}\`** yazarak ürün alabilirsinz.
════════════════════════════════
\`\`\`ID  ÜRÜN                         FİYAT\`\`\`
\`1\` ${client.emojis.cache.find(x => x.name === "spotify")} **\`Spotify Hesap\`**\`------------------ 3.000\` ${client.emojis.cache.find(x => x.name === "coin")}
\`2\` ${client.emojis.cache.find(x => x.name === "exxen")} **\`Exxen Hesap\`**\`-------------------- 3.200\` ${client.emojis.cache.find(x => x.name === "coin")}
\`3\` ${client.emojis.cache.find(x => x.name === "netflix")} **\`Netflix Hesap\`**\`------------------ 4.500\` ${client.emojis.cache.find(x => x.name === "coin")}
\`4\` ${client.emojis.cache.find(x => x.name === "blutv")} **\`BluTV Hesap\`**\`-------------------- 6.500\` ${client.emojis.cache.find(x => x.name === "coin")}
\`5\` ${client.emojis.cache.find(x => x.name === "message")} **\`1.000 Mesaj\`**\`-------------------- 7.000\` ${client.emojis.cache.find(x => x.name === "coin")}
\`6\` ${client.emojis.cache.find(x => x.name === "voice")} **\`10 saat Public Ses\`**\`------------ 20.000\` ${client.emojis.cache.find(x => x.name === "coin")}
\`7\` ${client.emojis.cache.find(x => x.name === "Nitro")} **\`Classic Nitro\`**\`----------------- 38.000\` ${client.emojis.cache.find(x => x.name === "coin")}
\`8\` ${client.emojis.cache.find(x => x.name === "boost")} **\`Boost Nitro\`**\`------------------- 66.000\` ${client.emojis.cache.find(x => x.name === "coin")}
`];

        const ileriEmoji = '➡️';
        const geriEmoji = '⬅️';
        const silEmoji = '🗑️';
        let sayfa = 1;
        let embed = new EmbedBuilder()
            .setColor("RANDOM")
            .setFooter({
                text: `Sayfa ${sayfa}/${kodumunkodu.length}`
            })
            .setDescription(kodumunkodu[sayfa - 1]);

        message.channel.send({
            embeds: [embed]
        }).then(msg => {
            msg.react(geriEmoji).then(r => {
                msg.react(silEmoji).then(r => {
                    msg.react(ileriEmoji);

                    const geriSayfa = (reaction, user) => reaction.emoji.name === geriEmoji && user.id === message.author.id;
                    const temizleSayfa = (reaction, user) => reaction.emoji.name === silEmoji && user.id === message.author.id;
                    const ileriSayfa = (reaction, user) => reaction.emoji.name === ileriEmoji && user.id === message.author.id;

                    const temizle = msg.createReactionCollector({
                        filter: temizleSayfa,
                        time: 60000
                    });
                    const geri = msg.createReactionCollector({
                        filter: geriSayfa,
                        time: 60000
                    });
                    const ileri = msg.createReactionCollector({
                        filter: ileriSayfa,
                        time: 60000
                    });

                    geri.on("collect", r => {
                        r.users.remove(message.author.id);
                        if (sayfa === 1) return;
                        sayfa--;
                        embed.setDescription(kodumunkodu[sayfa - 1]);
                        embed.setFooter({
                            text: `Sayfa ${sayfa}/${kodumunkodu.length}`
                        });
                        msg.edit({
                            embeds: [embed]
                        });
                    });

                    ileri.on("collect", r => {
                        r.users.remove(message.author.id);
                        if (sayfa === kodumunkodu.length) return;
                        sayfa++;
                        embed.setDescription(kodumunkodu[sayfa - 1]);
                        embed.setFooter({
                            text: `Sayfa ${sayfa}/${kodumunkodu.length}`
                        });
                        msg.edit({
                            embeds: [embed]
                        });
                    });

                    temizle.on("collect", r => {
                        r.users.remove(message.author.id);
                        setTimeout(() => {
                            msg.delete(), 10
                        });
                    });
                });
            });
        });
    }

    if (["ürünekle"].includes(sec.toLowerCase())) {
        if (!message.member.permissions.has("ADMINISTRATOR")) return;
        if (!args[1]) return message.channel.send({
            content: "Spotify - Exxen - Netflix - BluTV"
        });
        if (args[1].toLowerCase() == "spotify") {
            if (!args[2]) return message.reply({
                content: "Lütfen bir ürün giriniz."
            });
            if (data.Spotify.includes(args[2])) return message.reply({
                content: "Aynı Ürün Zaten Ekli"
            });
            await market.updateOne({}, {
                $push: {
                    Spotify: args.slice(2).join(" ")
                }
            }, {
                upsert: true
            });
            return message.channel.send({
                content: `Başarılı bir şekilde **Spotify** ürününü ekledim.`
            });
        };
        if (args[1].toLowerCase() == "exxen") {
            if (!args[2]) return message.reply({
                content: "Lütfen bir ürün giriniz."
            });
            if (data.Exxen.includes(args[2])) return message.reply({
                content: "Aynı Ürün Zaten Ekli"
            });
            await market.updateOne({}, {
                $push: {
                    Exxen: args.slice(2).join(" ")
                }
            }, {
                upsert: true
            });
            return message.channel.send({
                content: "Başarılı bir şekilde **Exxen** ürününü ekledim."
            });
        };
        if (args[1].toLowerCase() == "netflix") {
            if (!args[2]) return message.reply({
                content: "Lütfen bir ürün giriniz."
            });
            if (data.Netflix.includes(args[2])) return message.reply({
                content: "Aynı Ürün Zaten Ekli"
            });
            await market.updateOne({}, {
                $push: {
                    Netflix: args.slice(2).join(" ")
                }
            }, {
                upsert: true
            });
            return message.channel.send({
                content: "Başarılı bir şekilde **Netflix** ürününü ekledim."
            });
        };
        if (args[1].toLowerCase() == "blutv") {
            if (!args[2]) return message.reply({
                content: "Lütfen bir ürün giriniz."
            });
            if (data.BluTV.includes(args[2])) return message.reply({
                content: "Aynı Ürün Zaten Ekli"
            });
            await market.updateOne({}, {
                $push: {
                    BluTV: args.slice(2).join(" ")
                }
            }, {
                upsert: true
            });
            return message.channel.send({
                content: "Başarılı bir şekilde **BluTV** ürününü ekledim."
            });
        };
    };

    if (sec == "al") {
        let ürünler = {
            "1": {
                Ürünler: data.Spotify
            },
            "2": {
                Ürünler: data.Exxen
            },
            "3": {
                Ürünler: data.Netflix
            },
            "4": {
                Ürünler: data.BluTV
            }
        };
        let sorumlular = ["419886209213661186", "754450537604317366", "140161769717309441"];
        if (!args[1]) return message.reply({
            content: `Bir ürün belirtmelisin!\n**Örnek:** \`.cm al 1\``
        }).sil(20);
        let id = args[1];
        if (id != 1 && id != 2 && id != 3 && id != 4) return message.reply({
            content: `Geçerli bir ürün belirtmelisin!`
        }).sil(20);
        if (id == 1) {
            if (statt.coin < 3000) return message.reply({
                content: `Yeterli coine sahip değilsin!`
            }).sil(20);
            if (data.Spotify.length <= 0) return message.reply({
                content: `Bu ürün şu anda stokta yok!`
            }).sil(20);
            await Stat.updateOne({
                userID: message.author.id,
                guildID: message.guild.id
            }, {
                $inc: {
                    coin: -3000
                }
            }, {
                upsert: true
            }).exec();
            await market.updateOne({}, {
                $pull: {
                    Spotify: data.Spotify[0]
                }
            }, {
                upsert: true
            });
            let kanal = client.channels.cache.find(x => x.name == "spotify-log");
            kanal.send({
                content: `${message.author}, adlı üye bir Spotify hesabı satın aldı. **${data.Spotify[0]}**`
            });
            message.channel.send({
                content: `Başarıyla bir Spotify hesabı satın aldın! Bilgilerini DM yoluyla gönderiyorum.`
            });
            message.react(client.emojis.cache.find(x => x.name === "tik")).catch(e => {});
            return await message.author.send({
                content: `İşte Spotify hesabınız: **${data.Spotify[0]}**`
            });
        };
        if (id == 2) {
            if (statt.coin < 3200) return message.reply({
                content: `Yeterli coine sahip değilsin!`
            }).sil(20);
            if (data.Exxen.length <= 0) return message.reply({
                content: `Bu ürün şu anda stokta yok!`
            }).sil(20);
            await Stat.updateOne({
                userID: message.author.id,
                guildID: message.guild.id
            }, {
                $inc: {
                    coin: -3200
                }
            }, {
                upsert: true
            }).exec();
            await market.updateOne({}, {
                $pull: {
                    Exxen: data.Exxen[0]
                }
            }, {
                upsert: true
            });
            let kanal = client.channels.cache.find(x => x.name == "exxen-log");
            kanal.send({
                content: `${message.author}, adlı üye bir Exxen hesabı satın aldı. **${data.Exxen[0]}**`
            });
            message.channel.send({
                content: `Başarıyla bir Exxen hesabı satın aldın! Bilgilerini DM yoluyla gönderiyorum.`
            });
            message.react(client.emojis.cache.find(x => x.name === "tik")).catch(e => {});
            return await message.author.send({
                content: `İşte Exxen hesabınız: **${data.Exxen[0]}**`
            });
        };
        if (id == 3) {
            if (statt.coin < 4500) return message.reply({
                content: `Yeterli coine sahip değilsin!`
            }).sil(20);
            if (data.Netflix.length <= 0) return message.reply({
                content: `Bu ürün şu anda stokta yok!`
            }).sil(20);
            await Stat.updateOne({
                userID: message.author.id,
                guildID: message.guild.id
            }, {
                $inc: {
                    coin: -4500
                }
            }, {
                upsert: true
            }).exec();
            await market.updateOne({}, {
                $pull: {
                    Netflix: data.Netflix[0]
                }
            }, {
                upsert: true
            });
            let kanal = client.channels.cache.find(x => x.name == "netflix-log");
            kanal.send({
                content: `${message.author}, adlı üye bir Netflix hesabı satın aldı. **${data.Netflix[0]}**`
            });
            message.channel.send({
                content: `Başarıyla bir Netflix hesabı satın aldın! Bilgilerini DM yoluyla gönderiyorum.`
            });
            message.react(client.emojis.cache.find(x => x.name === "tik")).catch(e => {});
            return await message.author.send({
                content: `İşte Netflix hesabınız: **${data.Netflix[0]}**`
            });
        };
        if (id == 4) {
            if (statt.coin < 6500) return message.reply({
                content: `Yeterli coine sahip değilsin!`
            }).sil(20);
            if (data.BluTV.length <= 0) return message.reply({
                content: `Bu ürün şu anda stokta yok!`
            }).sil(20);
            await Stat.updateOne({
                userID: message.author.id,
                guildID: message.guild.id
            }, {
                $inc: {
                    coin: -6500
                }
            }, {
                upsert: true
            }).exec();
            await market.updateOne({}, {
                $pull: {
                    BluTV: data.BluTV[0]
                }
            }, {
                upsert: true
            });
            let kanal = client.channels.cache.find(x => x.name == "blutv-log");
            kanal.send({
                content: `${message.author}, adlı üye bir BluTV hesabı satın aldı. **${data.BluTV[0]}**`
            });
            message.channel.send({
                content: `Başarıyla bir BluTV hesabı satın aldın! Bilgilerini DM yoluyla gönderiyorum.`
            });
            message.react(client.emojis.cache.find(x => x.name === "tik")).catch(e => {});
            return await message.author.send({
                content: `İşte BluTV hesabınız: **${data.BluTV[0]}**`
            });
        };
    };
};

module.exports.conf = {
    aliases: ["shop"]
};
module.exports.help = {
    name: 'market'
};
