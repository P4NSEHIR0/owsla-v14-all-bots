const {
    EmbedBuilder
} = require("discord.js");
const Stat = require("../../models/stats");
const market = require("../../models/market");
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
		if (limit.get(message.author.id) == "Aktif") return message.reply({ content: "10 saniye'de 1 kullanabilirin." });
	limit.set(message.author.id, "Aktif")
	setTimeout(() => {
		limit.delete(message.author.id)
	}, 1000*10)
    const data = await Stat.findOne({userID: message.author.id, guildID: message.guild.id});
    
    if (data.para > 0) {
        await Stat.updateOne({userID: message.author.id, guildID: message.guild.id}, {$inc: {["coin"]: data.para*0.1/100}, $set: {["para"]: 0}})
        message.channel.send({ content: `Başarılı bir şekilde ${data.para} miktar paranızı ${data.para*0.1/100} Coin'e çevirdiniz` });
    }


}
exports.conf = {aliases: ["Bozdur"]}
exports.help = {name: 'bozdur'}