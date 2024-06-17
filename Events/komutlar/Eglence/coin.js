const {
    EmbedBuilder
} = require("discord.js");
const Stat = require("../../models/stats");
let limit = new Map();
module.exports.run = async (client, message, args, durum, kanal) => {
	Promise.prototype.sil = function (time) {
		if (this) this.then(s => {
		if (s.deletable) {
		setTimeout(async () => {
		s.delete().catch(e => { });
		}, time * 1000)
		}
		});
		};
    if (!message.guild) return;
		let kanallar = ["coin-komut","coin-komut-2"]
		if (!kanallar.some((x) => message.channel.name.toLowerCase().includes(x))) return message.reply({content: `Bu komutları sadece coin kanallarında kullanabilirsiniz.`}).sil(15)
	if (limit.get(message.author.id) == "Aktif") return message.reply({ content: "10 saniye'de 1 kullanabilirsin." });
	limit.set(message.author.id, "Aktif")
	setTimeout(() => {
	limit.delete(message.author.id)
	}, 1000*10)
    let data = await Stat.findOne({userID: message.author.id,guildID: message.guild.id});
    return message.channel.send({ content: `${message.author}, ${client.emojis.cache.find(x => x.name === "coin")} **${data.coin.toFixed(0)}**  coinin var harcamak için \`.coinmarket\` yazabilirsin` });
}
exports.conf = {aliases: []}
exports.help = {name: 'coin'}
