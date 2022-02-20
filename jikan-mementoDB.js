


/**
Library for a custom data source for Memento DataBase
The data source for obtaining information from Jikan.moe.

@param {string} type - One of release, master, artist.

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
  var result = http().get(baseurl + this.type + "?q="+ encodeURIComponent(query));
  var json = JSON.parse(result.body).data;
  return json.results;  
}

/**
@param {string} id - The resource identifier.
*/
Jikan.prototype.extra = function(id) {
    var resultJson = http().get(baseurl + this.type + "/" + id);
    var result = JSON.parse(resultJson.body).data; 
    if (result.images !== undefined) 
        result['images'] = result.images.map(function(e) { return e.uri; }).join(); 
    if (result.videos !== undefined) 
        result['videos'] = result.videos.map(function(e) { return e.uri; }).join();     
    if (result.artists !== undefined)
        result['artists'] = result.artists.map(function(e) { return e.name; }).join();   
    if (result.tracklist !== undefined)  
        result['tracklist'] = result.tracklist.map(function(e) { return e.position + ". " + e.title + " " + e.duration; }).join("\n");     
    if (result.styles !== undefined)  
        result['styles'] = result.styles.join();     
    if (result.genres !== undefined)
        result['genres'] = result.genres.join();        
    return result;
}




