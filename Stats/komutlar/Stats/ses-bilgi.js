module.exports.run = async (client, message, args, durum, kanal) => {
    if (!message.guild) return;
    if (kanal) return;

    let user = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
    if (!user) return client.yolla("Ses bilgisine bakmak istediğin kullanıcıyı düzgünce belirt ve tekrar dene!", message.author, message.channel);

    if (!user.voice.channel) return client.yolla(`<@${user.id}> bir ses kanalına bağlı değil.`, message.author, message.channel);

    let mic = user.voice.selfMute ? "Kapalı" : "Açık";
    let hop = user.voice.selfDeaf ? "Kapalı" : "Açık";
    let süresi = client.channelTime.get(user.id);

    let response = `${user} kişisi <#${user.voice.channel.id}> kanalında. **Mikrofonu: ${mic}, Kulaklığı: ${hop}**`;
    if (süresi) {
        response += `\n\`\`\`Aktif Bilgiler:\`\`\`\n<#${user.voice.channel.id}> kanalına \`${await client.turkishDate(Date.now() - süresi.time)}\` önce giriş yapmış.`;
    }

    await client.yolla(response, message.author, message.channel);
};

exports.conf = {
    aliases: ["sesbilgi", "nerede", "n", "nerde"]
};

exports.help = {
    name: 'ses-bilgi'
};
