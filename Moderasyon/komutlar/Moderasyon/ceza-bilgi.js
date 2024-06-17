const { EmbedBuilder, Client, GatewayIntentBits, Partials } = require("discord.js");
const mongoose = require("mongoose");
const sunucuayar = require("../../models/sunucuayar");
const ceza = require("../../models/ceza");
const moment = require("moment");
moment.locale("tr");

module.exports.run = async (client, message, args, durum, kanal) => {
    if (!message.guild) return;
    
    if (await client.permAyar(message.author.id, message.guild.id, "jail") || durum) {
        
        let target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return client.Embed(message.channel.id, `Lütfen cezalarına bakmak istediğiniz kullanıcıyı etiketleyiniz!`);
        
        let data = await ceza.find({ userID: target.id });
        
        let jailBilgi = data.filter(x => x.Ceza == "JAIL").map(data => `
        ${data.Sebep == "AFFEDILDI" ? "Veri tabanında cezalı bilgisi bulunmamakta" : `Cezalandıran Yetkili: <@${data.Yetkili}> (\`${data.Yetkili}\`)
        Cezalandırma Tarihi: \`${moment(Number(data.Atilma)).format("LLL")}\`
        Bitiş Tarihi: \`${data.Bitis == "KALICI" ? "KALICI" : moment(Number(data.Bitis)).format("LLL")}\`
        Ceza Sebebi: \`${data.Sebep}\``}
        `).reverse()[0];
        
        let chatMuteBilgi = data.filter(x => Date.now() < Number(x.Bitis) && x.Ceza == "MUTE").map(data => `
        Cezalandıran Yetkili: <@${data.Yetkili}> (\`${data.Yetkili}\`)
        Cezalandırma Tarihi: \`${moment(Number(data.Atilma)).format("LLL")}\`
        Bitiş Tarihi: \`${moment(Number(data.Bitis)).format("LLL")}\`
        Ceza Sebebi: \`${data.Sebep}\`
        `).reverse()[0];
        
        let sesMuteBilgi = data.filter(x => Date.now() < Number(x.Bitis) && x.Ceza == "SES MUTE").map(data => `
        Cezalandıran Yetkili: <@${data.Yetkili}> (\`${data.Yetkili}\`)
        Cezalandırma Tarihi: \`${moment(Number(data.Atilma)).format("LLL")}\`
        Bitiş Tarihi: \`${moment(Number(data.Bitis)).format("LLL")}\`
        Ceza Sebebi: \`${data.Sebep}\`
        `).reverse()[0];
        
        let embed = new EmbedBuilder()
            .setColor("Random")
            .setTimestamp()
            .setFooter({ text: client.ayarlar.footer })
            .setAuthor({ name: target.user.tag, iconURL: target.user.displayAvatarURL({ dynamic: true }) })
            .addFields(
                { name: `Cezalı Bilgisi:`, value: `${jailBilgi ? jailBilgi : "Veri tabanında cezalı bilgisi bulunmamakta"}` },
                { name: `Chat Mute Bilgisi:`, value: `${chatMuteBilgi ? chatMuteBilgi : "Veri tabanında cezalı bilgisi bulunmamakta"}` },
                { name: `Ses Mute Bilgisi`, value: `${sesMuteBilgi ? sesMuteBilgi : "Veri tabanında cezalı bilgisi bulunmamakta"}` }
            );
        
        await message.channel.send({ embeds: [embed] });
    } else {
        return client.Embed(message.channel.id, `Bu komutu kullanabilmek için Jail Sorumlusu veya Yönetici olmalısınız!`);
    }
};

exports.conf = { aliases: ["cezabilgi", "CezaBilgi", "Cezabilgi"] };
exports.help = { name: 'ceza-bilgi' };
