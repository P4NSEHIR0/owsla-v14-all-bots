const { EmbedBuilder, PermissionsBitField } = require("discord.js");

exports.run = async (client, message, args, durum, kanal) => {
    if (!message.guild) return;
    if (message.author.id !== "731432916491567145") return;
    if (!args[0]) return message.channel.send(`Kod belirtilmedi`);

    let code = args.join(' ');

    function clean(text) {
        if (typeof text !== 'string') {
            text = require('util').inspect(text, { depth: 0 });
        }
        text = text.replace(/`/g, '`' + String.fromCharCode(8203))
                   .replace(/@/g, '@' + String.fromCharCode(8203));
        return text;
    };

    try {
        var evaled = clean(await eval(code));
        if (evaled.match(new RegExp(`${client.token}`, 'g'))) {
            evaled = evaled.replace(new RegExp(client.token, 'g'), "Yasaklı komut");
        }
        message.channel.send({
            content: `\`\`\`js\n${evaled}\n\`\`\``,
            split: true
        });
    } catch (err) {
        message.channel.send({
            content: `\`\`\`js\n${err}\n\`\`\``,
            split: true
        });
    }
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ['eval'],
    permLevel: 4
};

exports.help = {
    name: 'eval',
    description: "Sunucuda komut denemeye yarar",
    usage: 'eval <kod>',
    kategori: "Bot Yapımcısı"
};
