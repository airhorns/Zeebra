(function() {
  var HTTPClientWithCache, db;
  var __hasProp = Object.prototype.hasOwnProperty;
  /*
  ------> HTTPClientWithCache <------

  This class is a wrapper around the standard Titanium.Network.HTTPClient(), but it adds a
  few nice features:

    * A cache backed by a SQLite database. All HTTPClientWithCache instances use the same database table, with
      the primary cache key being a hash of the full URL (and any data parameters in a POST)
    * The cache is automatically pruned before each query
    * A retry mechanism, so that you can retry a particular query a number of times before failing.
    * Automatically fires a Titanium event ("show_activity_indicator") when a query is started, and another one
      when the query finishes ("hide_activity_indicator"), you can capture these events to show/hide an activity indicator

  (These code examples are written in CoffeeScript, which compiles down into plain Javascript.)

  First, we create a new instance of the class to connect to the CNN RSS feeds:

    cnn = new HTTPClientWithCache({
      baseURL: "http://rss.cnn.com/rss",
      retryCount: 2,
      cacheSeconds: 60,
      onload: (response) ->
        Ti.API.debug("Response Data: #{response.responseText}")
        Ti.API.debug("Is this cached data?: #{response.cached}")
    })

    cnn.get({url: "/cnn_topstories.rss"})

  Subsequent calls will return (via the onload callback) the cached data until the cacheSeconds time expires.
  You can use the same object to make calls to other URLs as well, like so:

    cnn.get({url: "/cnn_us.rss"})

  If you need to pass parameters (like for pagination) you can say:

    cnn.get({url: "/cnn_us.rss?page=1"})

  To POST data to a URL, do this:

    cnn.post({url: "/story/19912/edit", data: {param1: "value1", param2: "value2"}})

  To manually prune the cache, you can call the prune_cache method, and anything older than seconds will be
  deleted from the cache. For example, to remove anything older than 1 day (86,400 seconds) you would say this:

    cnn.prune_cache(86400)

  To completely clear the cache of every single entry, you can do this:

    cnn.prune_cache(0)


  */
  db = Titanium.Database.open('http_client_cache');
  db.execute('CREATE TABLE IF NOT EXISTS REQUESTS (URL_HASH STRING, RESPONSE TEXT, UPDATED_AT INTEGER)');
  db.close();
  HTTPClientWithCache = function(opts) {
    var self;
    this.url_hash = "";
    this.currentRetryCount = 0;
    this.options = {
      method: "GET",
      baseUrl: "",
      timeout: 10000,
      retryCount: 0,
      cacheSeconds: 30,
      pruneSeconds: 2520000,
      showActivityEvent: "show_activity_indicator",
      hideActivityEvent: "hide_activity_indicator"
    };
    this.xhr = Titanium.Network.createHTTPClient();
    self = this;
    this.xhr.onload = function() {
      return self.onload_hook(self, {
        responseText: this.responseText,
        cached: false,
        status: this.status
      });
    };
    this.xhr.onerror = function() {
      return self.onerror_hook(self);
    };
    this.set_options(opts);
    this.prune_cache();
    return this;
  };
  HTTPClientWithCache.prototype.set_options = function(opts) {
    var _i, _ref, attrname;
    _ref = opts;
    for (attrname in _ref) {
      if (!__hasProp.call(_ref, attrname)) continue;
      _i = _ref[attrname];
      this.options[attrname] = opts[attrname];
    }
    return this._compute_url_hash();
  };
  HTTPClientWithCache.prototype.get = function(opts) {
    this.set_options(opts);
    this.options.method = "GET";
    return this.send();
  };
  HTTPClientWithCache.prototype.post = function(opts) {
    this.set_options(opts);
    this.options.method = "POST";
    return this.send();
  };
  HTTPClientWithCache.prototype.send = function(opts) {
    var _ref, response, self;
    self = this;
    this.set_options(opts);
    if (!this._validate()) {
      return false;
    }
    this.prune_cache();
    if (response = this._get_cached_response()) {
      Ti.API.info("HTTPClientWithCache: Using cached response");
      return this.onload_hook(this, response);
    } else {
      this._reset_xhr();
      this.xhr.setTimeout(this.options.timeout);
      Ti.App.fireEvent(this.options.showActivityEvent);
      this.xhr.open(this.options.method, this.options.baseUrl + this.options.url);
      return this.xhr.send((function() {
        if (typeof (_ref = this.options.data) !== "undefined" && _ref !== null) {
          return this.options.data;
        }
      }).call(this));
    }
  };
  HTTPClientWithCache.prototype.onload_hook = function(self, response) {
    var _ref;
    if (response.status >= 400) {
      this.onerror_hook(self);
      return null;
    }
    Ti.App.fireEvent(this.options.hideActivityEvent);
    this._save_to_cache(self, response);
    return (typeof (_ref = this.options.onload) !== "undefined" && _ref !== null) ? this.options.onload(response) : Ti.API.error("HTTPClientWithCache: Please specify an onload callback!");
  };
  HTTPClientWithCache.prototype.onerror_hook = function(self) {
    var _ref, response;
    if ((this.currentRetryCount++) <= this.options.retryCount) {
      Ti.API.info("HTTPClientWithCache: Retry Count " + (this.currentRetryCount) + " of " + (this.options.retryCount));
      this.xhr.abort();
      this.xhr.open(this.options.method, this.options.baseUrl + this.options.url);
      this.xhr.send((function() {
        if (typeof (_ref = this.options.data) !== "undefined" && _ref !== null) {
          return this.options.data;
        }
      }).call(this));
      return null;
    }
    Ti.App.fireEvent(this.options.hideActivityEvent);
    if (typeof (_ref = this.options.onerror) !== "undefined" && _ref !== null) {
      response = this._get_cached_response(9999999);
      return this.options.onerror(response);
    } else {
      return Ti.API.info("You might want to specify an onerror callback.");
    }
  };
  HTTPClientWithCache.prototype.prune_cache = function(seconds) {
    seconds = (typeof seconds !== "undefined" && seconds !== null) ? seconds : this.options.pruneSeconds;
    db = Titanium.Database.open('http_client_cache');
    db.execute("DELETE FROM REQUESTS WHERE UPDATED_AT < DATETIME('now','-" + (seconds) + " seconds')");
    return db.close();
  };
  HTTPClientWithCache.prototype._validate = function() {
    var _ref;
    if (typeof (_ref = this.options.url) !== "undefined" && _ref !== null) {
      return true;
    } else {
      Ti.API.error("HTTPClientWithCache: Invalid options " + (JSON.stringify(this.options)));
      return false;
    }
  };
  HTTPClientWithCache.prototype._compute_url_hash = function() {
    return (this.url_hash = Ti.Utils.md5HexDigest(this.options.method + this.options.baseUrl + this.options.url + this.options.data));
  };
  HTTPClientWithCache.prototype._save_to_cache = function(self, response) {
    var urlHash;
    if ((response.status >= 400) || response.cached) {
      return null;
    }
    db = Titanium.Database.open('http_client_cache');
    urlHash = self._compute_url_hash();
    if (self._exists_in_cache()) {
      db.execute("UPDATE REQUESTS SET RESPONSE=?, UPDATED_AT=CURRENT_TIMESTAMP WHERE URL_HASH=?", response.responseText, urlHash);
    } else {
      db.execute("INSERT INTO REQUESTS (RESPONSE, URL_HASH, UPDATED_AT) VALUES (?,?,CURRENT_TIMESTAMP)", response.responseText, urlHash);
    }
    return db.close();
  };
  HTTPClientWithCache.prototype._get_cached_response = function(seconds) {
    var cachedAt, responseText, row;
    db = Titanium.Database.open('http_client_cache');
    seconds = (typeof seconds !== "undefined" && seconds !== null) ? seconds : this.options.cacheSeconds;
    row = db.execute("SELECT RESPONSE, UPDATED_AT FROM REQUESTS WHERE URL_HASH=? AND UPDATED_AT > DATETIME('now','-" + (seconds) + " seconds')", this.url_hash);
    responseText = row.field(0);
    cachedAt = row.field(1);
    row.close();
    db.close();
    if (typeof responseText !== "undefined" && responseText !== null) {
      return {
        responseText: responseText,
        cached: true,
        cached_at: cachedAt,
        status: 200
      };
    }
  };
  HTTPClientWithCache.prototype._exists_in_cache = function() {
    var count, row;
    row = db.execute("SELECT COUNT(*) FROM REQUESTS WHERE URL_HASH=?", this.url_hash);
    count = row.field(0);
    row.close();
    return count > (typeof 0 !== "undefined" && 0 !== null) ? 0 : {
      "true": false
    };
  };
  HTTPClientWithCache.prototype._reset_xhr = function() {
    this.currentRetryCount = 0;
    return this.xhr.abort();
  };
  root.HTTPClientWithCache = HTTPClientWithCache;
}).call(this);
