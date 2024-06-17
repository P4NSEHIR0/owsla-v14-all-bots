const { EmbedBuilder } = require("discord.js");
const jailInterval = require("../../models/jailInterval");
const sunucuayar = require("../../models/sunucuayar");
const ceza = require("../../models/ceza");
const otologin = require("../../models/otokayit");

module.exports.run = async (client, message, args, durum, kanal) => {
    if (!message.guild) return;

    let data = await sunucuayar.findOne({ guildID: message.guild.id });
    let jailRol = data.JAIL;
    let booster = data.BOOST;
    let kayitsizUyeRol = data.UNREGISTER;
    let tag = data.TAG;
    let tag2 = data.TAG2;

    if (await client.permAyar(message.author.id, message.guild.id, "jail") || durum) {
        let target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply("Lütfen bir kullanıcı belirleyiniz");
        if (!target.roles.cache.has(jailRol)) return message.reply("Etiketlediğiniz kullanıcı zaten jailsiz");

        try {
            await target.roles.set([kayitsizUyeRol]);
            message.channel.send(`Başarılı bir şekilde <@${target.id}> adlı kullanıcının jailini kaldırdınız.`);
            await ceza.updateMany({ userID: target.id, Ceza: "JAIL" }, { $set: { Sebep: "AFFEDILDI", Bitis: Date.now() } });
            await jailInterval.deleteOne({ userID: target.id });
        } catch (error) {
            console.error("Bir hata oluştu:", error);
            message.reply("Jail kaldırma işlemi sırasında bir hata oluştu.");
        }
    } else {
        return;
    }
};

exports.conf = {
    aliases: ["Unjail", "cezalıkaldır", "kaldırcezalı", "UNJAİL", "UNJAIL", "af"]
};

exports.help = {
    name: 'unjail'
};
