const Discord = require("discord.js");
const stat = require("../../models/stats");
let limit = new Map();

module.exports.run = async (client, message, args, durum, kanal) => {
    if (!message.guild) return;
    Promise.prototype.sil = function (time) {
        if (this) this.then(s => {
        if (s.deletable) {
        setTimeout(async () => {
        s.delete().catch(e => { });
        }, time * 1000)
        }
        });
        };
    
    let kanallar = ["coin-komut", "coin-komut-2"];
    if (!kanallar.includes(message.channel.name)) {
        return message.reply({ content: `${kanallar.map(x => `${client.channels.cache.find(chan => chan.name == x)}`)} kanallarında kullanabilirsiniz.` })
            .then(x => setTimeout(() => { x.delete() }, 10000));
    }

    if (limit.get(message.author.id) == "Aktif") {
        return message.reply({ content: "10 saniye'de 1 kullanabilirsiniz." });
    }

    limit.set(message.author.id, "Aktif");
    setTimeout(() => {
        limit.delete(message.author.id);
    }, 1000 * 10);

    const data = await stat.findOne({
        userID: message.author.id,
        guildID: message.guild.id
    });

    let durums = ["Tebrikler Kazandın", "Üzgünüm Kaybettin"];
    durums = durums[Math.floor(Math.random() * durums.length)];

    let sec = args[0];

    if (!sec) {
        return message.channel.send({ content: `:no_entry: | **${message.author.username},** Lütfen bir bahis değeri giriniz!!` });
    }

    if (sec == "all") {
        let betAmount = data.para <= 50000 ? data.para : 50000;
        await stat.updateOne({
            userID: message.author.id,
            guildID: message.guild.id
        }, {
            $inc: {
                ["para"]: -betAmount
            }
        }, {
            upsert: true
        });

        return message.channel.send({ 
            content: `**${message.author.username}**, **${betAmount}** ${client.emojis.cache.find(x => x.name === "reward")} para harcadı.\nMadeni para dönüyor... ${client.emojis.cache.find(x => x.name === "coinflip")}`
        }).then(async mesaj => {
            setTimeout(async () => {
                if (durums === "Tebrikler Kazandın") {
                    await stat.updateOne({
                        userID: message.author.id,
                        guildID: message.guild.id
                    }, {
                        $inc: {
                            ["para"]: betAmount * 2
                        }
                    }, {
                        upsert: true
                    });
                    mesaj.edit({ content: `**${message.author.username}**, **${betAmount}** ${client.emojis.cache.find(x => x.name === "reward")} para harcadı.\nMadeni para dönüyor... ${client.emojis.cache.find(x => x.name === "coin")} ve 2 katını kazandın!**` });
                } else {
                    mesaj.edit({ content: `**${message.author.username}**, **${betAmount}** ${client.emojis.cache.find(x => x.name === "reward")} para harcadı.\nMadeni para dönüyor... ${client.emojis.cache.find(x => x.name === "coin")} tüm paranı kaybettin... :c` });
                }
            }, 5000); 
        });
    }

    let betAmount = Number(sec);
    if (data.para >= betAmount && betAmount <= 50000 && betAmount > 0) {
        await stat.updateOne({
            userID: message.author.id,
            guildID: message.guild.id
        }, {
            $inc: {
                ["para"]: -betAmount
            }
        }, {
            upsert: true
        });

        message.channel.send({ 
            content: `**${message.author.username}**, **${betAmount}** ${client.emojis.cache.find(x => x.name === "reward")} para harcadı.\nMadeni para dönüyor... ${client.emojis.cache.find(x => x.name === "coinflip")}` 
        }).then(async mesaj => {
            setTimeout(async () => {
                if (durums === "Tebrikler Kazandın") {
                    await stat.updateOne({
                        userID: message.author.id,
                        guildID: message.guild.id
                    }, {
                        $inc: {
                            ["para"]: betAmount * 2
                        }
                    }, {
                        upsert: true
                    });
                    mesaj.edit({ 
                        content: `**${message.author.username}**, **${betAmount}** ${client.emojis.cache.find(x => x.name === "reward")} para harcadı.\nMadeni para dönüyor... ${client.emojis.cache.find(x => x.name === "coin")} ve 2 katını kazandın!**` 
                    });
                } else {
                    mesaj.edit({ 
                        content: `**${message.author.username}**, **${betAmount}** ${client.emojis.cache.find(x => x.name === "reward")} para harcadı.\nMadeni para dönüyor... ${client.emojis.cache.find(x => x.name === "coin")} tüm paranı kaybettin... :c` 
                    });
                }
            }, 5000); 
        });
    } else {
        message.channel.send({ 
            content: `:no_entry: | **${message.author.username}**, Yeterli miktarda paran yoktur! (Max: 50.000 Tutarında Oynayabilirsin)` 
        });
    }
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ["coinflip"],
    permLevel: 0
};

exports.help = {
    name: 'cf',
    description: 'Coin flip oyunu oynar.',
    usage: 'cf <miktar|all>',
    kategori: 'Oyun'
};
