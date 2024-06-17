const { EmbedBuilder, ChannelType } = require('discord.js');
const moment = require('moment');
moment.locale('tr');
const sunucuayar = require('../models/sunucuayar');
const jailInterval = require('../models/jailInterval');
const muteInterval = require('../models/muteInterval');
const vmuteInterval = require('../models/vmuteInterval');
const reklamInterval = require('../models/reklamInterval');
const dcInterval = require('../models/dcInterval');
const vkInterval = require('../models/vkInterval');
const stInterval = require('../models/stInterval');
const otokayit = require('../models/otokayit');
const puansystem = require('../models/puansystem');
const client = global.client;
const conf = client.ayarlar;

module.exports = async (member) => {
    const data = await sunucuayar.findOne({});
    const kayitKanal = data.REGISTER;
    const rules = data.RULES;
    const kayitsizRol = data.UNREGISTER;
    const supheliRol = data.SUPHELI;
    const tag2 = data.TAG2;
    const tag = data.TAG;
    const kanalKontrol = client.channels.cache;
    const jailRol = data.JAIL;
    const reklamRol = data.REKLAM;
    const yasaklıTagRol = data.BANTAG;
    const bantag = data.BAN_TAG;

    if (!kanalKontrol.get(kayitKanal)) return;

    const guvenilirlik = Date.now() - member.user.createdTimestamp < 1000 * 60 * 60 * 24 * 7;
    const jailKontrol = await jailInterval.findOne({ userID: member.id }) || { jailed: false };
    const reklamKontrol = await reklamInterval.findOne({ userID: member.id }) || { reklam: false };

    const kayitsizRol2 = reklamKontrol.reklam ? [reklamRol] :
        jailKontrol.jailed ? [jailRol] :
        bantag.some(yasak => member.user.username.includes(yasak)) ? [yasaklıTagRol] : [kayitsizRol];

    if (guvenilirlik) {
        await member.roles.set([supheliRol]).catch(() => {});
        return kanalKontrol.get(kayitKanal).send(`\`${member.user.username}\` adlı kullanıcının hesabı 7 Gün'den önce açıldığı için karantinaya gönderildi`);
    } else {
        await member.roles.set(kayitsizRol2).then(async () => {
            await member.setNickname(`${tag2} İsim | Yaş`);
            kanalKontrol.get(kayitKanal).send(`
${client.emojis.cache.find(x => x.name === "stfu_reg")} **${member} Aramıza Hoş Geldin ${client.emojis.cache.find(x => x.name === "stfu_reg")}**
Seninle beraber sunucumuz ${member.guild.memberCount} üye sayısına ulaştı.

Hesabın ${member.user.createdAt.toTurkishFormatDate()} tarihinde (${client.tarihHesapla(member.user.createdAt)}) oluşturulmuş. ${client.emojis.cache.find(x => x.name === "stfu_tik")}

<#${rules}> kanalına göz atmayı unutmayınız.

Kayıt olduktan sonra kuralları okuduğunuzu kabul edeceğiz ve içeride yapılacak cezalandırma işlemlerini bunu göz önünede bulundurarak yapacağız.`).catch(console.error);
        });
    }
};

client.tarihHesapla = (date) => {
    const startedAt = Date.parse(date);
    let msecs = Math.abs(new Date() - startedAt);

    const years = Math.floor(msecs / (1000 * 60 * 60 * 24 * 365));
    msecs -= years * 1000 * 60 * 60 * 24 * 365;
    const months = Math.floor(msecs / (1000 * 60 * 60 * 24 * 30));
    msecs -= months * 1000 * 60 * 60 * 24 * 30;
    const weeks = Math.floor(msecs / (1000 * 60 * 60 * 24 * 7));
    msecs -= weeks * 1000 * 60 * 60 * 24 * 7;
    const days = Math.floor(msecs / (1000 * 60 * 60 * 24));
    msecs -= days * 1000 * 60 * 60 * 24;
    const hours = Math.floor(msecs / (1000 * 60 * 60));
    msecs -= hours * 1000 * 60 * 60;
    const mins = Math.floor((msecs / (1000 * 60)));
    msecs -= mins * 1000 * 60;
    const secs = Math.floor(msecs / 1000);
    msecs -= secs * 1000;

    let string = '';
    if (years > 0) string += `${years} yıl ${months} ay`;
    else if (months > 0) string += `${months} ay ${weeks > 0 ? weeks + ' hafta' : ''}`;
    else if (weeks > 0) string += `${weeks} hafta ${days > 0 ? days + ' gün' : ''}`;
    else if (days > 0) string += `${days} gün ${hours > 0 ? hours + ' saat' : ''}`;
    else if (hours > 0) string += `${hours} saat ${mins > 0 ? mins + ' dakika' : ''}`;
    else if (mins > 0) string += `${mins} dakika ${secs > 0 ? secs + ' saniye' : ''}`;
    else if (secs > 0) string += `${secs} saniye`;
    else string += `saniyeler`;

    string = string.trim();
    return `\`${string} önce\``;
};

Array.prototype.chunk = function (chunk_size) {
    const myArray = Array.from(this);
    const tempArray = [];
    for (let index = 0; index < myArray.length; index += chunk_size) {
        const chunk = myArray.slice(index, index + chunk_size);
        tempArray.push(chunk);
    }
    return tempArray;
};

Date.prototype.toTurkishFormatDate = function () {
    return moment.tz(this, 'Europe/Istanbul').locale('tr').format('LLL');
};

client.convertDuration = (date) => {
    return moment.duration(date).format('H [saat,] m [dakika]');
};
