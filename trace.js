const axios = require('axios')
const trace_url = 'https://api.trace.moe/search'

const Anime = (title_romaji, title_english, title_japanese, episode, at, link) => {
    return { title_romaji, title_english, title_japanese, episode, at, link }
}

exports.callapi = async function(image) {
    return await axios.get(
        `${trace_url}?anilistInfo&url=${encodeURIComponent(image)}`
    ).then(resp => resp.data);
}

function fmtTime(s) { return(s-(s%=60))/60+(9<s?':':':0')+Math.round(s)} 

exports.parsejson = async function(json) {
    data = json["result"][0]
    at = await fmtTime(data["from"])
    anilist_id = data["anilist"]["id"]
    link = `https://anilist.co/anime/${anilist_id}`
    title_romaji = data["anilist"]["title"]["romaji"]
    title_english = data["anilist"]["title"]["english"]
    title = data["anilist"]["title"]["native"]
    return Anime(title_romaji, title_english, title, data["episode"], at, link)
}