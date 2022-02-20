


/**
Library for a custom data source for Memento DataBase
The data source for obtaining information from Jikan.moe.

@param {string} type - One of anime.

@example 
var jikan = new Jikan( "anime" );
var r = jikan.search(query);
result( r , function(id) { return discogs.extra(id);});
*/
function Jikan (type) {
    this.type = type;
}


/**
Issue a search query to Discogs database.
@param {string} query - Search query.
*/
var baseurl = "https://api.jikan.moe/v4/";

Jikan.prototype.search = function(query) {
  var result = http().get(baseurl + this.type + "?q=" + encodeURIComponent(query));
  var json = JSON.parse(result.body);
  return json.data;  
}


/**
@param {string} id - The resource identifier.
*/
Jikan.prototype.extra = function(id) {
    var resultJson = http().get(baseurl + this.type + "/" + id);
    var result = JSON.parse(resultJson.body); 
          
    return result;
}




