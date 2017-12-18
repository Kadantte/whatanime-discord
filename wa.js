const fetch = require('fetch-base64');
const rp = require('request-promise');
const popura = require('popura');

const config = require("./config.json");
const wa_url = `https://whatanime.ga/api/search?token=${config.wa_token}`
const mal = popura(config.mal_name, config.mal_password);

const Anime = (title_romaji, title_english, title_japanese, episode) => {
    return { title_romaji, title_english, title_japanese, episode }
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
    return Anime(data["title_romaji"], data["title_english"], data["title"], data["episode"]);
}

exports.getmallink = async function(anime) {
    res = await mal.searchAnimes(anime.title_english)
    return `https://myanimelist.net/anime/${res[0]['id']}`
}