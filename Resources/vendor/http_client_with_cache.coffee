###
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
    

###

# This class requires a sqlite database table, so make sure it exists
db = Titanium.Database.open('http_client_cache')
db.execute('CREATE TABLE IF NOT EXISTS REQUESTS (URL_HASH STRING, RESPONSE TEXT, UPDATED_AT INTEGER)')
db.close()

class HTTPClientWithCache
  constructor: (opts) -> 
    @url_hash = ""
    @currentRetryCount = 0
    @options = {
      method: "GET",
      baseUrl: "",
      timeout: 10000, #miliseconds
      retryCount: 0,
      cacheSeconds: 30,
      pruneSeconds: 2520000,
      showActivityEvent: "show_activity_indicator",
      hideActivityEvent: "hide_activity_indicator"
    }

    @xhr = Titanium.Network.createHTTPClient()
    self = this
    @xhr.onload = () -> self.onload_hook(self, {responseText: this.responseText, cached:false, status: this.status})
    @xhr.onerror = () -> self.onerror_hook(self)

    @set_options(opts)
    @prune_cache()
            
  set_options: (opts) -> 
    for attrname of opts 
      @options[attrname] = opts[attrname]
    @_compute_url_hash()
  
  get: (opts) ->
    @set_options(opts)
    @options.method = "GET" 
    @send()

  post: (opts) ->
    @set_options(opts)
    @options.method = "POST" 
    @send()
    
  send: (opts) ->
    self = this
    @set_options(opts)
    return false if !@_validate()
    @prune_cache()
    if response = @_get_cached_response()
      Ti.API.info("HTTPClientWithCache: Using cached response")
      @onload_hook(this, response)
    else      
      @_reset_xhr()
      @xhr.setTimeout(@options.timeout)
      Ti.App.fireEvent(@options.showActivityEvent)
      @xhr.open(@options.method,@options.baseUrl + @options.url)
      @xhr.send(@options.data if @options.data?)

  onload_hook: (self, response) -> 
    if response.status >= 400
      @onerror_hook(self) 
      return

    Ti.App.fireEvent(@options.hideActivityEvent);
    @_save_to_cache(self,response)

    if @options.onload?
      @options.onload(response) 
    else
      Ti.API.error("HTTPClientWithCache: Please specify an onload callback!")

  onerror_hook: (self) -> 
    if (@currentRetryCount++) <= @options.retryCount
      Ti.API.info("HTTPClientWithCache: Retry Count #{@currentRetryCount} of #{@options.retryCount}")
      @xhr.abort()
      @xhr.open(@options.method,@options.baseUrl + @options.url)
      @xhr.send(@options.data if @options.data?)
      return

    Ti.App.fireEvent(@options.hideActivityEvent);
    if @options.onerror?
      response = @_get_cached_response(9999999) #return any data we have on an error
      @options.onerror(response)
    else
      Ti.API.info("You might want to specify an onerror callback.")
    
  prune_cache: (seconds) -> 
    seconds ?= @options.pruneSeconds
    db = Titanium.Database.open('http_client_cache')
    db.execute("DELETE FROM REQUESTS WHERE UPDATED_AT < DATETIME('now','-#{seconds} seconds')")
    db.close()

  # PRIVATE
  _validate: () ->
    if @options.url?
      true
    else
      Ti.API.error("HTTPClientWithCache: Invalid options #{JSON.stringify(@options)}")
      false
      
  _compute_url_hash: () -> 
    @url_hash = Ti.Utils.md5HexDigest(@options.method + @options.baseUrl + @options.url + @options.data)

  _save_to_cache: (self, response) ->
    return if response.status >= 400 || response.cached
    db = Titanium.Database.open('http_client_cache')
    urlHash = self._compute_url_hash()
    if self._exists_in_cache()
      db.execute("UPDATE REQUESTS SET RESPONSE=?, UPDATED_AT=CURRENT_TIMESTAMP WHERE URL_HASH=?", response.responseText, urlHash)
    else
      db.execute("INSERT INTO REQUESTS (RESPONSE, URL_HASH, UPDATED_AT) VALUES (?,?,CURRENT_TIMESTAMP)", response.responseText, urlHash)
    db.close()      

  
  _get_cached_response: (seconds) -> 
    db = Titanium.Database.open('http_client_cache')
    seconds ?= @options.cacheSeconds
    row = db.execute("SELECT RESPONSE, UPDATED_AT FROM REQUESTS WHERE URL_HASH=? AND UPDATED_AT > DATETIME('now','-#{seconds} seconds')", @url_hash)
    responseText = row.field(0)
    cachedAt     = row.field(1)
    row.close()
    db.close()
    {responseText: responseText, cached: true, cached_at: cachedAt, status: 200} if responseText? 

  _exists_in_cache: () -> 
    row = db.execute("SELECT COUNT(*) FROM REQUESTS WHERE URL_HASH=?", @url_hash)
    count = row.field(0)
    row.close()
    count > 0 ? true : false

  _reset_xhr: () ->
    @currentRetryCount = 0
    @xhr.abort()

root.HTTPClientWithCache = HTTPClientWithCache
