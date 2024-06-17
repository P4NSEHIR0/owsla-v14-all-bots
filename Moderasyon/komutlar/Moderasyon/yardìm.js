const { EmbedBuilder } = require("discord.js");
const ozelKomut = require("../../models/özelkomut");

module.exports.run = async (client, message, args, durum, kanal) => {
    if (!message.guild) return;
    
    if (await client.permAyar(message.author.id, message.guild.id, "global") || durum) {
        let data = await ozelKomut.find({ guildID: message.guild.id }) || [];
        let embed = new EmbedBuilder()
            .setColor("RANDOM")
            .setTimestamp()
            .setFooter({ text: client.ayarlar.footer })
            .setAuthor({ name: message.author.tag, iconURL: message.author.avatarURL({ dynamic: true }) })
            .setDescription(`
\`${client.ayarlar.prefix[0]}denetim @rol\`
\`${client.ayarlar.prefix[0]}puanekle @kişi [miktar]\`
\`${client.ayarlar.prefix[0]}stats-sıfırla @rol\`
\`${client.ayarlar.prefix[0]}ystat\`
\`${client.ayarlar.prefix[0]}davet\`
\`${client.ayarlar.prefix[0]}davet kanal [#kanal]\`
\`${client.ayarlar.prefix[0]}topdavet\`
\`${client.ayarlar.prefix[0]}isim @etiket [isim] [yaş]\`
\`${client.ayarlar.prefix[0]}isimler @etiket\`
\`${client.ayarlar.prefix[0]}kayıt @etiket [isim] [yaş]\`
\`${client.ayarlar.prefix[0]}teyitbilgi\`
\`${client.ayarlar.prefix[0]}topteyit\`
\`${client.ayarlar.prefix[0]}dağıt\`
\`${client.ayarlar.prefix[0]}kanal [aç]/[kapat]\`
\`${client.ayarlar.prefix[0]}not al [baslik] - [icerik] - [link (isteğe bağlı)]\`
\`${client.ayarlar.prefix[0]}özelkomut [oluştur] / [güncelle] / [bak] / [sil] [komutAdı] [Tür] [komut]\`
\`${client.ayarlar.prefix[0]}oylama\`
\`${client.ayarlar.prefix[0]}etkinlik [@rol]\`
\`${client.ayarlar.prefix[0]}çekiliş [kanal] [kazanansayısı] [süre] [ödül] (örnek kullanım: ${client.ayarlar.prefix[0]}çekiliş kanal 1 1m deneme) \`
${data.length > 0 ? `\n__Özel Komutlar:__\n${data.map(x => `\`${x.komutAd}\``).join("\n")}` : ""}
`);
        message.channel.send({ embeds: [embed] });
    }
};

exports.conf = {
    aliases: ["help", "Help"]
};
exports.help = {
    name: 'yardım'
};
