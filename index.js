const Eris = require("eris");
const config = require("./config.json");

// trace.moe functionality
const trace = require('./trace.js')

var bot = new Eris.CommandClient(config.d_token, {}, {
    description: "A bot to find out what anime an image is from",
    owner: "StandB",
    prefix: "!"
});

bot.on("ready", () => {
    console.log("Ready!");
});

bot.registerCommand("whatanime", async (msg, args) => {
    if (msg.attachments.length == 0) { return; }
    var image = msg.attachments[0].url;

    var json = {};
    try {
        json = await trace.callapi(image)
    } catch (e) {
        bot.createMessage(msg.channel.id, {
            embed: {
                author: {
                    name: msg.author.username,
                    icon_url: msg.author.avatarURL
                },
                title: "Uh oh",
                color: 0xFF0000,
                fields: [
                    { name: "Error", value: "Couldn't reach trace.moe or we have hit rate limits. Try again later!", inline: true },
                ],
                footer: { 
                    text: "Anime found with trace.moe",
                    icon_url: "https://trace.moe/favicon.png"
                },
                thumbnail: { url: image }
            }
        })

        return;
    }

    const anime = await trace.parsejson(json)
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
