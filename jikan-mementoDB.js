// To parse this data:
//
//   const Convert = require("./file");
//
//   const jsonreader = Convert.toJsonreader(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
function toJsonreader(json) {
    return cast(JSON.parse(json), r("Jsonreader"));
}

function jsonreaderToJson(value) {
    return JSON.stringify(uncast(value, r("Jsonreader")), null, 2);
}

function invalidValue(typ, val, key = '') {
    if (key) {
        throw Error(`Invalid value for key "${key}". Expected type ${JSON.stringify(typ)} but got ${JSON.stringify(val)}`);
    }
    throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`, );
}

function jsonToJSProps(typ) {
    if (typ.jsonToJS === undefined) {
        const map = {};
        typ.props.forEach((p) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ) {
    if (typ.jsToJSON === undefined) {
        const map = {};
        typ.props.forEach((p) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val, typ, getProps, key = '') {
    function transformPrimitive(typ, val) {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key);
    }

    function transformUnion(typs, val) {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {}
        }
        return invalidValue(typs, val);
    }

    function transformEnum(cases, val) {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases, val);
    }

    function transformArray(typ, val) {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue("array", val);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val) {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue("Date", val);
        }
        return d;
    }

    function transformObject(props, additional, val) {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue("object", val);
        }
        const result = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, prop.key);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val);
    }
    if (typ === false) return invalidValue(typ, val);
    while (typeof typ === "object" && typ.ref !== undefined) {
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast(val, typ) {
    return transform(val, typ, jsonToJSProps);
}

function uncast(val, typ) {
    return transform(val, typ, jsToJSONProps);
}

function a(typ) {
    return { arrayItems: typ };
}

function u(...typs) {
    return { unionMembers: typs };
}

function o(props, additional) {
    return { props, additional };
}

function m(additional) {
    return { props: [], additional };
}

function r(name) {
    return { ref: name };
}

const typeMap = {
    "Jsonreader": o([
        { json: "data", js: "data", typ: u(undefined, r("Data")) },
    ], false),
    "Data": o([
        { json: "mal_id", js: "mal_id", typ: u(undefined, 0) },
        { json: "url", js: "url", typ: u(undefined, "") },
        { json: "images", js: "images", typ: u(undefined, m(r("Image"))) },
        { json: "trailer", js: "trailer", typ: u(undefined, r("Trailer")) },
        { json: "title", js: "title", typ: u(undefined, "") },
        { json: "title_english", js: "title_english", typ: u(undefined, null) },
        { json: "title_japanese", js: "title_japanese", typ: u(undefined, "") },
        { json: "title_synonyms", js: "title_synonyms", typ: u(undefined, a("")) },
        { json: "type", js: "type", typ: u(undefined, "") },
        { json: "source", js: "source", typ: u(undefined, "") },
        { json: "episodes", js: "episodes", typ: u(undefined, 0) },
        { json: "status", js: "status", typ: u(undefined, "") },
        { json: "airing", js: "airing", typ: u(undefined, true) },
        { json: "aired", js: "aired", typ: u(undefined, r("Aired")) },
        { json: "duration", js: "duration", typ: u(undefined, "") },
        { json: "rating", js: "rating", typ: u(undefined, "") },
        { json: "score", js: "score", typ: u(undefined, 3.14) },
        { json: "scored_by", js: "scored_by", typ: u(undefined, 0) },
        { json: "rank", js: "rank", typ: u(undefined, null) },
        { json: "popularity", js: "popularity", typ: u(undefined, 0) },
        { json: "members", js: "members", typ: u(undefined, 0) },
        { json: "favorites", js: "favorites", typ: u(undefined, 0) },
        { json: "synopsis", js: "synopsis", typ: u(undefined, "") },
        { json: "background", js: "background", typ: u(undefined, null) },
        { json: "season", js: "season", typ: u(undefined, null) },
        { json: "year", js: "year", typ: u(undefined, null) },
        { json: "broadcast", js: "broadcast", typ: u(undefined, r("Broadcast")) },
        { json: "producers", js: "producers", typ: u(undefined, a(r("Genre"))) },
        { json: "licensors", js: "licensors", typ: u(undefined, a("any")) },
        { json: "studios", js: "studios", typ: u(undefined, a(r("Genre"))) },
        { json: "genres", js: "genres", typ: u(undefined, a(r("Genre"))) },
        { json: "explicit_genres", js: "explicit_genres", typ: u(undefined, a("any")) },
        { json: "themes", js: "themes", typ: u(undefined, a("any")) },
        { json: "demographics", js: "demographics", typ: u(undefined, a("any")) },
    ], false),
    "Aired": o([
        { json: "from", js: "from", typ: u(undefined, Date) },
        { json: "to", js: "to", typ: u(undefined, Date) },
        { json: "prop", js: "prop", typ: u(undefined, r("Prop")) },
        { json: "string", js: "string", typ: u(undefined, "") },
    ], false),
    "Prop": o([
        { json: "from", js: "from", typ: u(undefined, r("From")) },
        { json: "to", js: "to", typ: u(undefined, r("From")) },
    ], false),
    "From": o([
        { json: "day", js: "day", typ: u(undefined, 0) },
        { json: "month", js: "month", typ: u(undefined, 0) },
        { json: "year", js: "year", typ: u(undefined, 0) },
    ], false),
    "Broadcast": o([
        { json: "day", js: "day", typ: u(undefined, null) },
        { json: "time", js: "time", typ: u(undefined, null) },
        { json: "timezone", js: "timezone", typ: u(undefined, null) },
        { json: "string", js: "string", typ: u(undefined, null) },
    ], false),
    "Genre": o([
        { json: "mal_id", js: "mal_id", typ: u(undefined, 0) },
        { json: "type", js: "type", typ: u(undefined, "") },
        { json: "name", js: "name", typ: u(undefined, "") },
        { json: "url", js: "url", typ: u(undefined, "") },
    ], false),
    "Image": o([
        { json: "image_url", js: "image_url", typ: u(undefined, "") },
        { json: "small_image_url", js: "small_image_url", typ: u(undefined, "") },
        { json: "large_image_url", js: "large_image_url", typ: u(undefined, "") },
    ], false),
    "Trailer": o([
        { json: "youtube_id", js: "youtube_id", typ: u(undefined, null) },
        { json: "url", js: "url", typ: u(undefined, null) },
        { json: "embed_url", js: "embed_url", typ: u(undefined, null) },
        { json: "images", js: "images", typ: u(undefined, r("Images")) },
    ], false),
    "Images": o([
        { json: "image_url", js: "image_url", typ: u(undefined, null) },
        { json: "small_image_url", js: "small_image_url", typ: u(undefined, null) },
        { json: "medium_image_url", js: "medium_image_url", typ: u(undefined, null) },
        { json: "large_image_url", js: "large_image_url", typ: u(undefined, null) },
        { json: "maximum_image_url", js: "maximum_image_url", typ: u(undefined, null) },
    ], false),
};

module.exports = {
    "jsonreaderToJson": jsonreaderToJson,
    "toJsonreader": toJsonreader,
};


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
var baseurl = "https://api.jikan.moe/v4/"

Jikan.prototype.search = function(query) {
  var result = http().get(baseurl + this.type + "?q="+ encodeURIComponent(query));
  var json = JSON.parse(result.body);
  return json.results;  
}

const jsonreader = toJsonreader(json);
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




