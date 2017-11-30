var base64 = require('node-base64-image');
var request = require('request');
const Eris = require("eris");
const config = require("./config.json");

const wa_url = `https://whatanime.ga/api/search?token=${config.wa_token}`

// TODO: make catch less ugly and make github ready

class Anime {
    constructor(title_romaji, title_english, title_japanese, episode) {
        this.title_romaji = title_romaji;
        this.title_english = title_english;
        this.title_japanese = title_japanese;
        this.episode = episode;
    }
}

var bot = new Eris.CommandClient(config.d_token, {}, {
    description: "A bot to find out what anime an image is from",
    owner: "Nopply / StandB",
    prefix: "!"
});

bot.on("ready", () => { // When the bot is ready
    console.log("Ready!"); // Log "Ready!"
});

bot.registerCommand("ping", "pong");

bot.registerCommand("whatanime", (msg, args) => {
    var image = msg.attachments[0].url;

    return new Promise((resolve, reject) => {
        var options = {string: true};
        base64.encode(image, options, function (err, image) {
            if (err) reject(err);
            resolve(image);
        });
    })

    .catch((err) => {
        console.log(err);
        bot.createMessage(msg.channel.id, "Something went wrong..")
        return
    })
    
    .then(b64 => {
        // get json from whatanime.ga api using base 64 string of image
        return new Promise((resolve, reject) => {
            request.post({url: wa_url, form: {image: b64}}, function(err,httpResponse,body) {
                if (err) reject(err)
                resolve(body)
            });
        })
    })

    .catch((err) => {
        console.log(err);
        bot.createMessage(msg.channel.id, "Something went wrong..")
        return
    })
    
    .then(resp => {
        // get data from json and send embed
        data = JSON.parse(resp)["docs"][0];
        var anime = new Anime(data["title_romaji"], data["title_english"], data["title"], data["episode"]);
        bot.createMessage(msg.channel.id, {
            embed: {
                author: { name: anime.title_romaji },
                color: 0xFF0000,
                fields: [
                    { name: "English title", value: anime.title_english, inline: true },
                    { name: "Japanese title", value: anime.title_japanese, inline: false },
                    { name: "Episode", value: anime.episode, inline: false },
                ],
                footer: { text: "Anime found with whatanime.ga" },
                thumbnail: { url: image }
            }
        })
    })
});

bot.connect();