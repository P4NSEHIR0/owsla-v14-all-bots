const { EmbedBuilder, Client, GatewayIntentBits, Partials } = require('discord.js');
const conf = client.ayarlar;
const teyit = require('../../models/teyit');
const sunucuayar = require('../../models/sunucuayar');
const otokayit = require('../../models/otokayit');
const puansystem = require('../../models/puansystem');
const limit = new Map();
const sure = new Map();
const ms = require('ms');

module.exports.run = async (client, message, args, durum, kanal) => {
    if (!message.guild) return;

    const data = await sunucuayar.findOne({ guildID: message.guild.id });
    const kntrl = limit.get(message.author.id);
    const sre = sure.get(message.author.id);

    if (kntrl >= 5 && sre > Date.now() && !message.member.permissions.has('ADMINISTRATOR') && !message.member.roles.cache.some(rol => data.MUTEAuthorized.includes(rol.id))) {
        client.channels.cache.get('846064756137656330').send(`${message.author} adlı kullanıcı 30 saniye içerisinde 5'den fazla kayıt yaptığı için yetkileri alındı!`);
        return message.member.roles.remove(message.member.roles.cache.filter(rol => message.guild.roles.cache.get(data.TEAM).position <= rol.position && !rol.managed));
    }

    if (!sre) {
        sure.set(message.author.id, Date.now() + ms('30s'));
    }

    limit.set(message.author.id, (limit.get(message.author.id) || 0) + 1);
    setTimeout(() => {
        limit.delete(message.author.id);
        sure.delete(message.author.id);
    }, ms('30s'));

    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!target) return message.reply('Lütfen bir üye belirtiniz');

    const erkekRol = data.MAN;
    const kadinRol = data.WOMAN;
    const unRegisterRol = data.UNREGISTER;
    const registerChannel = data.REGISTERChannel;
    const tag = data.TAG;
    const tag2 = data.TAG2;
    const kayitSorumlusu = data.REGISTERAuthorized;
    const ekipRol = data.TEAM;
    const supheliRol = data.SUPHELI;
    const chatKANAL = data.CHAT;

    if (
        !message.guild.roles.cache.get(erkekRol[0]) &&
        !message.guild.roles.cache.get(kadinRol[0]) &&
        !message.guild.roles.cache.get(unRegisterRol[0]) &&
        !message.guild.roles.cache.get(kayitSorumlusu[0]) &&
        !client.channels.cache.get(registerChannel) &&
        !tag && !tag2
    ) return message.reply(`Lütfen kurulum sistemini tamamen bitiriniz \`${conf.prefix[0]}setup help\``);

    if (message.member.permissions.has('ADMINISTRATOR') || message.member.roles.cache.some(e => kayitSorumlusu.includes(e.id))) {
        if (target.id === message.author.id) return message.react(client.emojis.cache.find(x => x.name === 'stfu_iptal'));
        if (message.member.roles.highest.position <= target.roles.highest.position) return message.reply('Belirttiğin kişi senden üstün veya onunla aynı yetkidesin!');

        const name = args[1] ? args[1][0].toUpperCase() + args[1].substring(1) : null;
        const age = Number(args[2]);
        if (!name) return message.reply('Lütfen bir isim belirtiniz');
        if (!age) return message.reply('Lütfen bir yaş belirtiniz');
        if (client.ayarlar.taglıAlım && !target.roles.cache.has(data.BOOST) && !target.user.username.includes(data.TAG)) return message.reply('Taglı alım modunda olunduğu için kayıt işlemi yapılamadı!');

        await message.react(client.emojis.cache.find(x => x.name === 'stfu_erkek'));
        await message.react(client.emojis.cache.find(x => x.name === 'stfu_kadin'));

        const filter = (reaction, user) => ['stfu_erkek', 'stfu_kadin'].includes(reaction.emoji.name) && user.id === message.author.id;
        const collector = message.createReactionCollector({ filter, max: 1, time: 30000 });

        collector.on('collect', async (reaction) => {
            await message.reactions.removeAll();
            await message.react(client.emojis.cache.find(x => x.name === 'stfu_tik'));

            if (reaction.emoji.name === 'stfu_erkek') {
                if ((limit.get(message.author.id) || 0) >= 3) return message.reply('1 Dakikada en fazla 3 kayıt yapabilirsin.');
                await kayıtSistem(message, target, tag, tag2, name, age, kadinRol, unRegisterRol, client, erkekRol, ekipRol, chatKANAL, true);
            } else if (reaction.emoji.name === 'stfu_kadin') {
                if ((limit.get(message.author.id) || 0) >= 3) return message.reply('1 Dakikada en fazla 3 kayıt yapabilirsin.');
                await kayıtSistem(message, target, tag, tag2, name, age, kadinRol, unRegisterRol, client, erkekRol, ekipRol, chatKANAL, false);
            }
        });
    }
};

exports.conf = {
    aliases: ['kayit', 'kayıt', 'kadın', 'Kadın', 'k', 'kadin', 'Kadin', 'Woman', 'kız', 'Kız', 'erkek', 'Erkek', 'e', 'ERKEK', 'Man', 'man']
};

exports.help = {
    name: 'woman'
};

async function kayıtSistem(message, target, tag, tag2, name, age, kadinRol, unreg, client, erkekRol, ekipRol, chatKANAL, Type) {
    const autoLogin = await puansystem.findOne({ guildID: message.guild.id });

    if (Type === true) {
        target.user.username.includes(tag) ? erkekRol.push(ekipRol) : erkekRol;
        if (target.roles.cache.some(rol => unreg.includes(rol.id))) {
            await target.roles.remove(unreg);
            await target.roles.set(erkekRol);
            await target.roles.add(['814570663532036138', '841802128673472573']);
            await target.setNickname(`${target.user.username.includes(tag) ? tag : tag2 ? tag2 : tag} ${name} | ${age}`);

            if (target.roles.cache.some(rol => kadinRol.includes(rol.id))) {
                for (const rol of kadinRol) {
                    await target.roles.remove(rol);
                }
            }

            await teyit.updateOne(
                { userID: target.id },
                { $push: { userName: `\`${target.user.username.includes(tag) ? tag : tag2 ? tag2 : tag} ${name} | ${age}\` (${erkekRol.map(x => `<@&${x}>`).join(', ')})` } },
                { upsert: true }
            );

            const isimler = await teyit.findOne({ userID: target.id });
            const embed = new EmbedBuilder()
                .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) })
                .setTimestamp()
                .setFooter({ text: conf.footer })
                .setDescription(`${target} adlı üye başarılı bir şekilde Erkek olarak kaydedildi\n\nBu kullanıcının ${isimler.userName.length} adet isim geçmişi görüntülendi\n${isimler.userName.reverse().join('\n')}`);

            await message.channel.send({ embeds: [embed] }).then(x => setTimeout(() => x.delete(), 15000));

            if (autoLogin.AutoLogin.Type === true) {
                await otokayit.updateOne(
                    { userID: target.id },
                    { $set: { userID: target.id, roleID: erkekRol, name, age } },
                    { upsert: true }
                );
            }

            client.dailyMission(message.author.id, 'teyit', 1, 3);
            client.easyMission(message.author.id, 'teyit', 1);
            client.addAudit(message.author.id, 1, 'Erkek');
        }
    } else {
        target.user.username.includes(tag) ? kadinRol.push(ekipRol) : kadinRol;
        if (target.roles.cache.some(rol => unreg.includes(rol.id))) {
            await target.roles.remove(unreg);
            await target.roles.set(kadinRol);
            await target.roles.add(['814570663532036138', '841802128673472573']);
            await target.setNickname(`${target.user.username.includes(tag) ? tag : tag2 ? tag2 : tag} ${name} | ${age}`);

            if (target.roles.cache.some(rol => erkekRol.includes(rol.id))) {
                for (const rol of erkekRol) {
                    await target.roles.remove(rol);
                }
            }

            await teyit.updateOne(
                { userID: target.id },
                { $push: { userName: `\`${target.user.username.includes(tag) ? tag : tag2 ? tag2 : tag} ${name} | ${age}\` (${kadinRol.map(x => `<@&${x}>`).join(', ')})` } },
                { upsert: true }
            );

            const isimler = await teyit.findOne({ userID: target.id });
            const embed = new EmbedBuilder()
                .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) })
                .setTimestamp()
                .setFooter({ text: conf.footer })
                .setDescription(`${target} adlı üye başarılı bir şekilde Kadın olarak kaydedildi\n\nBu kullanıcının ${isimler.userName.length} adet isim geçmişi görüntülendi\n${isimler.userName.reverse().slice(0, 10).join('\n')}`);

            await message.channel.send({ embeds: [embed] }).then(x => setTimeout(() => x.delete(), 15000));

            if (autoLogin.AutoLogin.Type === true) {
                await otokayit.updateOne(
                    { userID: target.id },
                    { $set: { userID: target.id, roleID: kadinRol, name, age } },
                    { upsert: true }
                );
            }

            client.channels.cache.get(chatKANAL).send(client.ayarlar.chatMesajı.replace('-member-', target)).then(msg => setTimeout(() => msg.delete(), 15000));
            client.dailyMission(message.author.id, 'teyit', 1, 3);
            client.easyMission(message.author.id, 'teyit', 1);
            client.addAudit(message.author.id, 1, 'Kadin');
        }
    }
}
