

/**
Library for a custom data source for Memento DataBase
The data source for obtaining information from Jikan.moe.

@param {string} type - One of anime.

@example 
var jikan = new Jikan( "anime" );
var r = jikan.search(query);
result( r , function(id) { return Jikan.extra(id);});
*/
function Jikan (type) {
    this.type = type;
}

  /**
  var json = JSON.parse(result.body);
  return json.data;
  */

/**
Issue a search query to Jikan database.
@param {string} query - Search query.
*/
var baseurl = "https://api.jikan.moe/v4/";

Jikan.prototype.search = function(query) {
  var response = http().get(baseurl + this.type + "?q=" + encodeURIComponent(query));
  var responseJson = JSON.parse(response.body);
  var result = responseJson.data;
  return result;
}

/**
@param {string} id - The resource identifier.
*/
Jikan.prototype.extra = function(id) {
    var response = http().get(baseurl + this.type + "/" + id);
    var responseJson = JSON.parse(response.body);
    var res = responseJson;
    var result = {};
    if (res.data.mal_id !== undefined) {
        result["mal_id"] = res.data.mal_id;
    };
    if (res.data.url !== undefined) {
        result["url"] = res.data.url;
    };
    if (res.data.images.jpg.image_url !== undefined) {
        result["image"] = res.data.images.jpg.image_url;
    };
    if (res.data.title !== undefined) {
        result["title"] = res.data.title;
    };
    if (res.data.title_english !== undefined) {
        result["title_english"] = res.data.title_english;
    };
    if (res.data.title_japanese !== undefined) {
        result["title_japanese"] = res.data.title_japanese;
    };
    if (res.data.type !== undefined) {
        result["type"] = res.data.type;
    };
    if (res.data.source !== undefined) {
        result["source"] = res.data.source;
    };
    if (res.data.episodes !== undefined) {
        result["episodes"] = res.data.episodes;
    };
    if (res.data.status !== undefined) {
        result["status"] = res.data.status;
    };
    if (res.data.aired.string !== undefined) {
        result["aired"] = res.data.aired.string;
    };
    if (res.data.duration !== undefined) {
        result["duration"] = res.data.duration;
    };
    if (res.data.rating !== undefined) {
        result["rating"] = res.data.rating;
    };
    if (res.data.score !== undefined) {
        result["score"] = res.data.score;
    };
    if (res.data.scored_by !== undefined) {
        result["scored_by"] = res.data.scored_by;
    };
    if (res.data.popularity !== undefined) {
        result["popularity"] = res.data.popularity;
    };
    if (res.data.members !== undefined) {
        result["members"] = res.data.members;
    };
    if (res.data.favorites !== undefined) {
        result["favorites"] = res.data.favorites;
    };
    if (res.data.synopsis !== undefined) {
        result["synopsis"] = res.data.synopsis;
    };
    if (res.data !== undefined) {
        result["resbody"] = res.data;
    };
    return res;
}


