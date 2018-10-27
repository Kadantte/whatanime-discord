const Eris = require("eris");
const config = require("./config.json");

// whatanime functionality
const wa = require('./wa.js')

var bot = new Eris.CommandClient(config.d_token, {}, {
    description: "A bot to find out what anime an image is from",
    owner: "StandB",
    prefix: "!"
});

bot.on("ready", () => {
    console.log("Ready!");
});

bot.registerCommand("ping", "pong", {description: "Test command"});

bot.registerCommand("whatanime", async (msg, args) => {
    if (msg.attachments.length == 0) { return; }
    var image = msg.attachments[0].url;

    const b64 = await wa.imgtob64(image)
    const json = await wa.callapi(b64)
    const anime = await wa.parsejson(json)

    bot.createMessage(msg.channel.id, {
        embed: {
            author: {
                name: msg.author.username,
                icon_url: msg.author.avatarURL
            },
            url: anime.link,
            title: anime.title_romaji,
            color: 0xFF0000,
            fields: [
                { name: "Romaji title", value: anime.title_romaji, inline: true },
                { name: "Japanese title", value: anime.title_japanese, inline: false },
                { name: "Episode", value: anime.episode, inline: false },
                { name: "At", value: anime.at, inline: true } 
            ],
            footer: { 
                text: "Anime found with trace.moe",
                icon_url: "https://trace.moe/favicon.png"
            },
            thumbnail: { url: image }
        }
    })
}, {
    // command info
    description: "Find the anime of the provided picture (attachment).",
    usage: "attach an image.",
    fullDescription: "This command uses trace.moe to find which anime your picture is from. To use this correctly type !whatanime and add an image attachment."
});

bot.connect();
