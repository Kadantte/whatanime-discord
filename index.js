var base64 = require('node-base64-image');
var request = require('request');
const Eris = require("eris");
const config = require("./config.json");
var popura =  require('popura');

const mal = popura(config.mal_username, config.mal_password);

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

bot.on("ready", () => {
    console.log("Ready!");
});

bot.registerCommand("ping", "pong", {description: "Test command"});

bot.registerCommand("whatanime", (msg, args) => {
    if (msg.attachments.length == 0) { return; }
    var image = msg.attachments[0].url;

    return new Promise((resolve, reject) => {
        var options = {string: true};
        base64.encode(image, options, (err, image) => {
            if (err) reject(err);
            resolve(image);
        });
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
    
    .then(resp => {
        // get data from json and send embed
        return new Promise((resolve, reject) => {
            data = JSON.parse(resp)["docs"][0];
            var anime = new Anime(data["title_romaji"], data["title_english"], data["title"], data["episode"]);
            resolve(anime)
        })
    })

    .then(anime => {
        // get MAL link from API using popura
        return new Promise((resolve, reject) => {
            mal.searchAnimes(anime.title_english).then(res => {
                var mal_link = `https://myanimelist.net/anime/${res[0]['id']}`
                resolve(anime, mal_link)
            }).catch(err => {
                reject(err)
            })
        })
    })

    .then((anime, mal_link) => {
        bot.createMessage(msg.channel.id, {
            embed: {
                author: {
                    name: msg.author.username,
                    icon_url: msg.author.avatarURL
                },
                url: mal_link,
                title: anime.title_romaji,
                color: 0xFF0000,
                fields: [
                    { name: "Romaji title", value: anime.title_romaji, inline: true },
                    { name: "Japanese title", value: anime.title_japanese, inline: false },
                    { name: "Episode", value: anime.episode, inline: false },
                ],
                footer: { 
                    text: "Anime found with whatanime.ga",
                    icon_url: "https://whatanime.ga/favicon.png"
                },
                thumbnail: { url: image }
            }
        })
    })

    // crappy error handling
    .catch((err) => {
        console.log(err);
        bot.createMessage(msg.channel.id, "Something went wrong, try again later.")
        return
    })

}, {
    // command info
    description: "Find the anime of the provided picture (attachment).",
    usage: "attach an image.",
    fullDescription: "This command uses whatanime.ga to find which anime your picture is from. To use this correctly type !whatanime and add an image attachment."
});

bot.connect();