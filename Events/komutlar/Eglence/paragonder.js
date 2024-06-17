const {
    EmbedBuilder
} = require("discord.js");
const Stat = require("../../models/stats");
let limit = new Map();
module.exports.run = async (client, message, args, durum, kanal) => {
    Discord.Message.prototype.sil = function (time) {
		if (time) {
			this.delete({ timeout: time * 1000 });
		} else {
			this.delete();
		}
	};
    if (!message.guild) return;
	let kanallar = ["coin-komut","coin-komut-2"]
    if (!kanallar.some((x) => message.channel.name.toLowerCase().includes(x))) return message.reply({content: `Bu komutları sadece coin kanallarında kullanabilirsiniz.`}).sil(15)
	let target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
	if (!target) return message.reply({ content: "Lütfen bir kullanıcı etiketleyiniz." });
	let data = await Stat.findOne({userID: message.author.id, guildID: message.guild.id});
    if (data.para >= Number(args[1]) && Number(args[1]) > 0) {
		await Stat.updateOne({userID: message.author.id, guildID: message.guild.id}, {$inc: {["para"]: -Number(args[1])}});
		await Stat.updateOne({userID: target.id, guildID: message.guild.id}, {$inc: {["para"]: Number(args[1])}});
        message.channel.send({ content: `:credit_card: | **${message.author.username}** adlı üye **${target.user.username}** adlı kişiye **${args[1]}** miktar para gönderdi ` })
    } else {
        message.channel.send({ content: `:no_entry: | **${message.author.username}**, Dostum paran yoktur ne yapıyon fakir misin eziQ AKSDGPOAKSDGOPADS!` })
    }

}
exports.conf = {aliases: ["paragonder","send","para-gönder","paragönder"]}
exports.help = {name: 'pgonder'}
