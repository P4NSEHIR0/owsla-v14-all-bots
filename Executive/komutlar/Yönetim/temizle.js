const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const conf = client.ayarlar;
let mongoose = require("mongoose");

module.exports.run = async (client, message, args, durum, kanal) => {
    if (!message.guild) return;

    if (message.member.permissions.has(PermissionsBitField.Flags.Administrator) || durum) {
        const sayi = parseInt(args[0], 10);
        if (!sayi || sayi < 1 || sayi > 100) {
            return message.reply("En Az `1 - 100` Arasında Bir Tam Sayı Değeri Girmelisiniz.").catch(console.error);
        }

        try {
            const messages = await message.channel.messages.fetch({ limit: sayi });
            const deletedMessages = await message.channel.bulkDelete(messages, true);

            if (!deletedMessages.size) {
                return message.reply("Silinecek mesaj bulunamadı.").then(x => x.delete({ timeout: 5000 })).catch(console.error);
            }

            message.reply(`${deletedMessages.size} Adet Mesaj Başarılı Bir Şekilde Silindi`).then(x => x.delete({ timeout: 5000 })).catch(console.error);
        } catch (error) {
            console.error(error);
            message.reply("Mesajlar silinirken bir hata oluştu.").catch(console.error);
        }
    } else {
        return message.reply("Bu komutu kullanabilmek için Ozel Rol Sorumlusu ya da Yönetici olmalısın.").catch(console.error);
    }
};

exports.conf = { aliases: ["sil", "clear", "clean", "oglumsohbettemizlendi", "hahaha", "pepe"] };
exports.help = { name: 'temizle' };
