const fetch = require('fetch-base64');
const rp = require('request-promise');
const popura = require('popura');

const config = require("./config.json");
const wa_url = `https://trace.moe/api/search?token=${config.wa_token}`
const mal = popura(config.mal_name, config.mal_password);

const Anime = (title_romaji, title_english, title_japanese, episode, at) => {
    return { title_romaji, title_english, title_japanese, episode, at }
}

exports.imgtob64 = async function(image_url) {
    const res = await fetch.remote(image_url)
    return res[0];
}

exports.callapi = async function(b64) {
    var options = {
        method: 'POST',
        uri: wa_url,
        form: { image: b64 },
    };
    return await rp(options)
}

exports.parsejson = function(json) {
    data = JSON.parse(json)["docs"][0];
    at = (data["at"] / 60)
    at = Math.round(at) + ':' + Math.round(((at % 1) * 60))
    return Anime(data["title_romaji"], data["title_english"], data["title"], data["episode"], at);
}