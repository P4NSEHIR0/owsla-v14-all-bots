const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const Discord = require('discord.js');

exports.run = async (client, message, args, durum, kanal) => {
    if (!message.guild) return;
    let guild = message.guild;
    if (!client.ayarlar.sahip.includes(message.author.id)) return;
    if (args[0] === "kur" || args[0] === "kurulum") {

        let emojiUrls = {
            stfu_vmute: "https://cdn.discordapp.com/attachments/811975658963992647/812894209706950656/sesmuteat.png",
            stfu_mute: "https://cdn.discordapp.com/attachments/811975658963992647/812894244632788992/muteat.png",
            stfu_vunmute: "https://cdn.discordapp.com/attachments/811975658963992647/812894192530751518/sesmuteac.png",
            stfu_unmute: "https://cdn.discordapp.com/attachments/811975658963992647/812894234242973716/muteac.png",
            stfu_deynek: "https://cdn.discordapp.com/emojis/794553871405285386.gif?v=1",
            stfu_stat: "https://cdn.discordapp.com/emojis/813380585338699806.png?v=1",
            stfu_erkek: "https://cdn.discordapp.com/emojis/782554741896773633.gif?v=1",
            stfu_kadin: "https://cdn.discordapp.com/emojis/782554741669888000.gif?v=1",
            stfu_tik: "https://cdn.discordapp.com/emojis/802098678369091594.gif?v=1",
            stfu_tik2: "https://cdn.discordapp.com/emojis/673576252241608714.gif?v=1",
            stfu_iptal: "https://cdn.discordapp.com/emojis/673576480487506011.gif?v=1",
            stfu_away: "https://cdn.discordapp.com/emojis/673576453140512788.png?v=1",
            stfu_dnd: "https://cdn.discordapp.com/emojis/673576231433797664.png?v=1",
            stfu_offline: "https://cdn.discordapp.com/emojis/673576417224556611.png?v=1",
            stfu_online: "https://cdn.discordapp.com/emojis/673576292205068314.png?v=1",
            stfu_baslangicbar: "https://cdn.discordapp.com/emojis/813380552924594216.png?v=1",
            stfu_bitisbar: "https://cdn.discordapp.com/emojis/812591747393650728.gif?v=1",
            stfu_solbar: "https://cdn.discordapp.com/emojis/812591747401646100.gif?v=1",
            stfu_ortabar: "https://cdn.discordapp.com/emojis/813380548768563250.gif?v=1",
            stfu_gribitisbar: "https://cdn.discordapp.com/emojis/813825131674730528.png?v=1",
            stfu_griortabar: "https://cdn.discordapp.com/emojis/813441171489292348.png?v=1",
            yildiz: "https://cdn.discordapp.com/emojis/805454400139165737.gif?v=1"
        };

        for (let [name, url] of Object.entries(emojiUrls)) {
            guild.emojis.create({ attachment: url, name: name })
                .then(emoji => message.channel.send(`Başarıyla ${emoji.name} adında emoji oluşturuldu. (${emoji})`))
                .catch(console.error);
        }

        return;
    }
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ['emojis'],
    permLevel: 4
};

exports.help = {
    name: 'emoji',
    description: "Sunucuda komut denemeye yarar",
    usage: 'eval <kod>',
    kategori: "Bot Yapımcısı"
};
