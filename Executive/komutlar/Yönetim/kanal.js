const { PermissionsBitField } = require("discord.js");
let hak = new Map();

module.exports.run = async (client, message, args, durum, kanal) => {
    if (!message.guild) return;

    if (durum) {
        let sec = args[0];
        if (sec === "limit") {
            if (message.member.voice.channel) {
                const miktar = Number(args[1]);
                if (!miktar || miktar > 99 || miktar < 0) return;
                await message.member.voice.channel.setUserLimit(miktar);
                message.channel.send(`Başarılı bir şekilde bulunduğun kanalın limitini \`${miktar}\` olarak değiştirdin.`);
            }
        }

        if (sec === "isim") {
            if (message.member.voice.channel) {
                let kanalhak = hak.get(message.member.voice.channel.id) || 0;
                const miktar = args.slice(1).join(" ");
                if (!miktar) return;

                hak.set(message.member.voice.channel.id, (kanalhak + 1));
                setTimeout(() => {
                    hak.delete(message.member.voice.channel.id);
                }, 1000 * 60 * 2);

                if (kanalhak >= 2) {
                    return message.reply(`**Başarısız** Kanal ismi zaman aşımına uğradı, lütfen daha sonra tekrar deneyin.`);
                }

                await message.member.voice.channel.setName(miktar);
                message.channel.send(`Başarılı bir şekilde bulunduğun kanalın adını \`${miktar}\` olarak değiştirdin. (Kalan Hak: ${kanalhak + 1}/2)`);
            }
        }
    }
};

exports.conf = {
    aliases: [],
};

exports.help = {
    name: "kanal",
};
