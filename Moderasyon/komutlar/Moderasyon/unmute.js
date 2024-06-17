const sunucuayar = require("../../models/sunucuayar");
const vmuteInterval = require("../../models/vmuteInterval");
const muteInterval = require("../../models/muteInterval");
const ceza = require("../../models/ceza");

module.exports.run = async (client, message, args, durum, kanal) => {
    if (!message.guild) return;

    let data = await sunucuayar.findOne({});
    await message.react(client.emojis.cache.find(x => x.name === "stfu_unmute"));
    await message.react(client.emojis.cache.find(x => x.name === "stfu_vunmute"));

    const filter = (reaction, user) => ["stfu_unmute", "stfu_vunmute"].includes(reaction.emoji.name) && user.id === message.author.id;
    const collector = message.createReactionCollector({ filter, max: 1, time: 30000, errors: ['time'] });

    let target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!target) return message.reply("Lütfen bir kullanıcı belirleyiniz");

    let cezalar = await ceza.find({ userID: target.id });
    if (cezalar.length === 0) cezalar = [{ Puan: 0 }, { Puan: 0 }];

    collector.on("collect", async (reaction) => {
        message.reactions.removeAll();
        message.react(client.emojis.cache.find(x => x.name === "stfu_tik"));

        if (reaction.emoji.name === "stfu_unmute") {
            let muteRol = data.MUTED;
            if (await client.permAyar(message.author.id, message.guild.id, "mute") || durum) {
                if (!target.roles.cache.has(muteRol)) return message.reply("Etiketlediğiniz kullanıcı zaten mutesiz?");
                await muteInterval.deleteOne({ userID: target.id }).exec();
                await target.roles.remove(muteRol).then(async (user) => {
                    message.channel.send(`Başarılı bir şekilde <@${user.id}> adlı kullanıcının mutesini kaldırdınız.`);
                });
            } else return;

        } else if (reaction.emoji.name === "stfu_vunmute") {
            let muteRol = data.VMUTED;
            if (await client.permAyar(message.author.id, message.guild.id, "vmute") || durum) {
                await message.channel.send(`Başarılı bir şekilde <@${target.id}> adlı kullanıcının ses mutesini kaldırdınız.`);
                await target.roles.remove(muteRol).catch(() => {});
                await vmuteInterval.deleteOne({ userID: target.id }).exec();
                await target.voice.setMute(false).catch(() => {});
            } else return;
        }
    });
};

exports.conf = { aliases: ["unmute", "unsesmute", "sesmute-kaldır", "unvoicemute", "voicemutekaldır", "unsmute"] };
exports.help = { name: 'unvmute' };
