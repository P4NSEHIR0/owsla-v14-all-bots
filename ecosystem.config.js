
const BabamizinAdi = "Stfu";
module.exports = {
    apps: [
        {
            name: `${BabamizinAdi}-Executive`,
            script: "./Executive/vatanhalki.js",
            watch: false
        },
        {
            name: `${BabamizinAdi}-Guard`,
            script: "./Guards/bot.js",
            watch: false
        },
        {
            name: `${BabamizinAdi}-Logger`,
            script: "./Log/vatanhalki.js",
            watch: false
        },
        {
            name: `${BabamizinAdi}-Moderation`,
            script: "./Moderasyon/vatanhalki.js",
            watch: false
        },
        {
            name: `${BabamizinAdi}-Statistics`,
            script: "./Stats/vatanhalki.js",
            watch: false
        }
    ]  
};
