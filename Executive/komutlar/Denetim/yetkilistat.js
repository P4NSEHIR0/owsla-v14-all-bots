const {
    EmbedBuilder,
    PermissionsBitField
} = require("discord.js");
require("moment-timezone");
let Stat = require("../../models/stats");
let sunucuayar = require("../../models/sunucuayar");
let xpData = require("../../models/stafxp");
let uyarıData = require("../../models/uyarı");
let puansystem = require("../../models/puansystem");
let taglıData = require("../../models/taglıUye");
const yetkiliDB = require("../../models/yetkili");
let ozelKomut = require("../../models/özelkomut");
let missionSystem = require("../../models/randomMission");

module.exports.run = async (client, message, args, durum, kanal) => {
    if (!message.guild) return;
    let sunucuData = await sunucuayar.findOne({
        guildID: message.guild.id
    });

    if (durum || message.member.permissions.has(PermissionsBitField.Flags.Administrator) || message.member.roles.cache.has(sunucuData.EnAltYetkiliRol)) {
        let target = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        let loading = await message.channel.send(`Veriler yükleniyor...`);

        let göster = await ozelKomut.find({
            guildID: message.guild.id,
            YetkiliROL: true
        });

        let arr = [];
        let veri = göster.map(x => x.YetkiliData);
        veri.forEach(v => v.forEach(x => arr.push(x)));

        let statemoji = client.emojis.cache.find(x => x.name === "stfu_stat");
        let data = await Stat.findOne({
            userID: target.id,
            guildID: message.guild.id
        }) || {
            yedi: {
                Chat: {},
                Voice: {},
                TagMember: 0,
                Invite: 0,
                Register: 0,
                Yetkili: 0
            }
        };
        let data2 = await taglıData.find({
            authorID: target.id,
            Durum: "puan"
        }) || [];
        let yetkiliData = await yetkiliDB.find({
            authorID: target.id,
            Durum: "puan"
        }) || [];
        let kanallar = await puansystem.findOne({
            guildID: message.guild.id
        });
        let puan = await xpData.findOne({
            userID: target.id
        }) || {
            currentXP: 0
        };

        let yetkiler = kanallar.PuanRolSystem;
        let ekPuan = puan.currentXP;

        let pubPuan = target.roles.cache.some(rol => [].includes(rol.id)) ? kanallar.PublicKanallar.Puan * 1.2 : kanallar.PublicKanallar.Puan;
        let oyunPuan = target.roles.cache.some(rol => kanallar.GameKanallar.Rol.includes(rol.id)) ? 8 : kanallar.GameKanallar.Puan;
        let kayitPuan = target.roles.cache.some(rol => kanallar.KayitKanallar.Rol.includes(rol.id)) ? 12 : kanallar.KayitKanallar.Puan;
        let streamPuan = target.roles.cache.some(rol => [].includes(rol.id)) ? kanallar.StreamKanallar.Puan * 1.2 : kanallar.StreamKanallar.Puan;
        let secretPuan = target.roles.cache.some(rol => kanallar.SecretKanallar.Rol.includes(rol.id)) ? 2 : kanallar.SecretKanallar.Puan;
        let mesajPuan = target.roles.cache.some(rol => [].includes(rol.id)) ? kanallar.MesajKanallar.Puan * 1.2 : kanallar.MesajKanallar.Puan;
        let sleepPuan = target.roles.cache.some(rol => kanallar.SleepingKanal.Rol.includes(rol.id)) ? 3 : kanallar.SleepingKanal.Puan;
        let alonePuan = target.roles.cache.some(rol => kanallar.AloneKanallar.Rol.includes(rol.id)) ? 2 : kanallar.AloneKanallar.Puan;
        let musicPuan = target.roles.cache.some(rol => kanallar.Müzik.Rol.includes(rol.id)) ? 2 : kanallar.Müzik.Puan;
        let taglıPuan = target.roles.cache.some(rol => kanallar.TagMember.Rol.includes(rol.id)) ? 30 : kanallar.TagMember.Puan;
        let invitePuan = target.roles.cache.some(rol => kanallar.Invite.Rol.includes(rol.id)) ? 12 : kanallar.Invite.Puan;
        let teyitPuan = target.roles.cache.some(rol => kanallar.Register.Rol.includes(rol.id)) ? 5 : kanallar.Register.Puan;
        let terapipuan = target.roles.cache.some(rol => kanallar.TerapiKanallar.Rol.includes(rol.id)) ? 10 : kanallar.TerapiKanallar.Puan;
        let sorunçözmepuan = target.roles.cache.some(rol => kanallar.SorunCozmeKanallar.Rol.includes(rol.id)) ? 10 : kanallar.SorunCozmeKanallar.Puan;
        let meetingPuan = target.roles.cache.some(rol => kanallar.Toplantı.Rol.includes(rol.id)) ? 10 : kanallar.Toplantı.Puan;
        let yetkiliPuan = target.roles.cache.some(rol => kanallar.Yetkili.Rol.includes(rol.id)) ? 25 : kanallar.Yetkili.Puan;

        let pubOda = yetkiliStat(data.yedi.Voice, kanallar.PublicKanallar.Id, kanallar.SleepingKanal.Id);
        let oyunodalar = yetkiliStat(data.yedi.Voice, kanallar.GameKanallar.Id, []);
        let kayıt = yetkiliStat(data.yedi.Voice, kanallar.KayitKanallar.Id, []);
        let stream = yetkiliStat(data.yedi.Voice, kanallar.StreamKanallar.Id, []);
        let secret = yetkiliStat(data.yedi.Voice, kanallar.SecretKanallar.Id, []);
        let mesaj = data.yedi.Chat ? yetkiliStat(data.yedi.Chat, kanallar.MesajKanallar.Id, []) : 0;
        let sleeping = data.yedi.Voice ? data.yedi.Voice[kanallar.SleepingKanal.Id] || 0 : 0;
        let alone = yetkiliStat(data.yedi.Voice, kanallar.AloneKanallar.Id, []);
        let music = yetkiliStat(data.yedi.Voice, kanallar.Müzik.Id, []);
        let terapi = yetkiliStat(data.yedi.Voice, kanallar.TerapiKanallar.Id, []);
        let sçözme = yetkiliStat(data.yedi.Voice, kanallar.SorunCozmeKanallar.Id, []);
        let meeting = yetkiliStat(data.yedi.Voice, kanallar.Toplantı.Id, []);
        let yetkili = yetkiliData.length;
        let taglı = data2.length;
        let invite = data.yedi.Invite;
        let teyit = data.yedi.Register;

        let totalpoints = parseInt((pubOda / (1000 * 60 * 60 * 1) * pubPuan)) +
            parseInt((oyunodalar / (1000 * 60 * 60 * 1) * oyunPuan)) +
            parseInt((kayıt / (1000 * 60 * 60 * 1) * kayitPuan)) +
            parseInt((stream / (1000 * 60 * 60 * 1) * streamPuan)) +
            parseInt((secret / (1000 * 60 * 60 * 1) * secretPuan)) +
            parseInt((mesaj * mesajPuan)) +
            parseInt((sleeping / (1000 * 60 * 60 * 1) * sleepPuan)) +
            parseInt((alone / (1000 * 60 * 60 * 1) * alonePuan)) +
            parseInt((music / (1000 * 60 * 60 * 1) * musicPuan)) +
            parseInt((terapi / (1000 * 60 * 60 * 1) * terapipuan)) +
            parseInt((sçözme / (1000 * 60 * 60 * 1) * sorunçözmepuan)) +
            parseInt((meeting / (1000 * 60 * 60 * 1) * meetingPuan)) +
            parseInt((yetkili * yetkiliPuan)) +
            parseInt((teyit * teyitPuan)) +
            parseInt((taglı * taglıPuan)) +
            parseInt((invite * invitePuan)) + Number(data.EtkinlikPuan);

        let mission = await missionSystem.findOne({
            userID: target.id
        });

        let embed = new EmbedBuilder().setColor("Random").setAuthor({
                name: target.displayName,
                iconURL: target.user.avatarURL({
                    dynamic: true
                })
            }).setFooter({
                text: client.ayarlar.footer
            })
            .setDescription(`
${target} kullanıcısının yetki yükseltim bilgileri aşağıda belirtilmiştir.
─────────────────────────────
**Toplam Yetki Puanı:** \`${totalpoints.toFixed(0)}\`
─────────────────────────────
**Mesaj Bilgisi:** \`${(mesaj).toFixed(0)} mesaj\`
**Public Odalar:** \`${(pubOda / (1000 * 60 * 60)).toFixed(1)} saat\` 
**Kayıt Odaları:** \`${(kayıt / (1000 * 60 * 60)).toFixed(1)} saat\`
**Oyun Odaları:** \`${(oyunodalar / (1000 * 60 * 60)).toFixed(1)} saat\`
**Streamer Odaları:** \`${(stream / (1000 * 60 * 60)).toFixed(1)} saat\`
**Secret Odalar:** \`${(secret / (1000 * 60 * 60)).toFixed(1)} saat\`
**Sleeping Odalar:** \`${(sleeping / (1000 * 60 * 60)).toFixed(1)} saat\`
**Alone Odalar:** \`${(alone / (1000 * 60 * 60)).toFixed(1)} saat\`
**Müzik Odaları:** \`${(music / (1000 * 60 * 60)).toFixed(1)} saat\`
**Terapist Odaları:** \`${(terapi / (1000 * 60 * 60)).toFixed(1)} saat\`
**Sorun Çözme Odaları:** \`${(sçözme / (1000 * 60 * 60)).toFixed(1)} saat\`
**Toplantı Odaları:** \`${(meeting / (1000 * 60 * 60)).toFixed(1)} saat\`
─────────────────────────────
**Taglı Üye:** \`${taglı} üye\`
**Davet Puanı:** \`${invite} davet\`
**Teyit Bilgisi:** \`${teyit} teyit\`
**Yetkili Bilgisi:** \`${yetkili} yetkili\`
─────────────────────────────
**Görev Puanı:** \`${mission ? mission.missionPuan.toFixed(0) : 0}\`
        `);
        loading.edit({
            content: null,
            embeds: [embed]
        });
    } else {
        return client.Embed(message.channel.id, `Bu komutu kullanabilmek için yeterli yetkin yok.`)
    }
}
exports.conf = {
    aliases: ["yetkipuan", "staff"]
}
exports.help = {
    name: 'yetkipuan'
};

function yetkiliStat(data, arr = [], arr2 = []) {
    let obje = 0;
    if (data) {
        for (var [key, value] of Object.entries(data)) {
            if (arr.some(x => key.includes(x))) {
                obje += value;
            }
            if (arr2.some(x => key.includes(x))) {
                obje -= value;
            }
        }
    }
    return obje;
}
