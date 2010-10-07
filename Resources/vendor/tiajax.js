(function() {
  var defaultAjaxSettings, jsre, r20, rquery, rts, rurl;
  var __hasProp = Object.prototype.hasOwnProperty;
  defaultAjaxSettings = {
    global: true,
    type: "GET",
    contentType: "application/x-www-form-urlencoded",
    processData: true,
    async: true,
    timeout: 5000,
    xhr: function() {
      return Ti.Network.createHTTPClient();
    },
    accepts: {
      xml: "application/xml, text/xml",
      html: "text/html",
      script: "text/javascript, application/javascript",
      json: "application/json, text/javascript",
      text: "text/plain",
      _default: "*/*"
    }
  };
  jsre = /=\?(&|$)/;
  rquery = /\?/;
  rts = /(\?|&)_=.*?(&|$)/;
  rurl = /^(\w+:)?\/\/([^\/?#]+)/;
  r20 = /%20/g;
  _.extend(Titanium.Network, {
    param: function(a) {
      var _ref, add, buildParams, obj, prefix, s, traditional;
      s = [];
      traditional = false;
      buildParams = function(prefix, obj) {
        if (_.isArray(obj)) {
          return _.each(obj, function(i, v) {
            var p, x;
            if (traditional || /\[\]$/.test(prefix)) {
              return add(prefix, v);
            } else {
              x = (_.isObject(v) || _.isArray(v)) ? i : "";
              p = prefix + "[" + x + "]";
              return buildParams(p, v);
            }
          });
        } else if (!traditional && !_.isNull(obj) && typeof obj === "object") {
          return _.each(obj, function(k, v) {
            return buildParams(prefix + "[" + k + "]", v);
          });
        } else {
          return add(prefix, obj);
        }
      };
      add = function(key, value) {
        value = _.isFunction(value) ? value() : value;
        return (s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value));
      };
      if (_.isArray(a)) {
        _.each(a, function() {
          return add(this.name, this.value);
        });
      } else {
        _ref = a;
        for (prefix in _ref) {
          if (!__hasProp.call(_ref, prefix)) continue;
          obj = _ref[prefix];
          buildParams(prefix, obj);
        }
      }
      return s.join("&").replace(r20, "+");
    },
    lastModified: {},
    etag: {},
    httpSuccess: function(xhr) {
      try {
        return ((xhr.status >= 200) && xhr.status < 300) || xhr.status === 304;
      } catch (e) {

      }
      return false;
    },
    httpNotModified: function(xhr, url) {
      var etag, lastModified;
      lastModified = xhr.getResponseHeader("Last-Modified");
      etag = xhr.getResponseHeader("Etag");
      if (lastModified) {
        Titanium.Network.lastModified[url] = lastModified;
      }
      if (etag) {
        Titanium.Network.etag[url] = etag;
      }
      return xhr.status === 304 || xhr.status === 0;
    },
    httpData: function(xhr, type, s) {
      var ct, data, xml;
      ct = xhr.getResponseHeader("content-type") || "";
      xml = type === "xml" || !type && (ct.indexOf("xml") >= 0);
      data = xml ? xhr.responseXML : xhr.responseText;
      if (xml && data.documentElement.nodeName === "parsererror") {
        Titanium.Network.error("parsererror");
      }
      if ((typeof s !== "undefined" && s !== null) && s.dataFilter) {
        data = s.dataFilter(data, type);
      }
      if (typeof data === "string") {
        if (type === "json" || !type && (ct.indexOf("json") >= 0)) {
          data = JSON.parse(data);
        }
      }
      return data;
    },
    error: function(msg) {
      throw msg;
    },
    handleError: function(s, xhr, status, e) {
      return s.error ? s.error.call(s.context || s, xhr, status, e) : null;
    },
    ajax: function(origSettings) {
      var _ref, callbackContext, complete, data, oldAbort, onreadystatechange, parts, remote, requestDone, ret, s, status, success, ts, type, xhr;
      s = _.extend({}, defaultAjaxSettings, origSettings);
      status = "";
      data = {};
      callbackContext = origSettings && origSettings.context || s;
      type = s.type.toUpperCase();
      if (s.data && s.processData && typeof s.data !== "string") {
        s.data = Titanium.Network.param(s.data, s.traditional);
      }
      if (s.cache === false && type === "GET") {
        ts = (new Date()).getTime();
        ret = s.url.replace(rts, "$1_=" + ts + "$2");
        s.url = ret + ((ret === s.url) ? (rquery.test(s.url) ? "&" : "?") + "_=" + ts : "");
      }
      if (s.data && type === "GET") {
        s.url += ((typeof (_ref = rquery.test(s.url)) !== "undefined" && _ref !== null) ? _ref : {
          "&": "?"
        }) + s.data;
      }
      parts = rurl.exec(s.url);
      remote = true;
      requestDone = false;
      xhr = s.xhr();
      if (!xhr) {
        return null;
      }
      Ti.API.debug("Sending " + type + " request to " + s.url);
      if (type === "POST") {
        Ti.API.debug("POSTing data:");
        Ti.API.debug(s.data);
      }
      if (typeof (_ref = s.username) !== "undefined" && _ref !== null) {
        xhr.open(type, s.url, s.async, s.username, s.password);
      } else {
        xhr.open(type, s.url, s.async);
      }
      if (s.data || origSettings && origSettings.contentType) {
        xhr.setRequestHeader("Content-Type", s.contentType);
      }
      if (s.ifModified) {
        if (Titanium.Network.lastModified[s.url]) {
          xhr.setRequestHeader("If-Modified-Since", Titanium.Network.lastModified[s.url]);
        }
        if (Titanium.Network.etag[s.url]) {
          xhr.setRequestHeader("If-None-Match", Titanium.Network.etag[s.url]);
        }
      }
      xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
      xhr.setRequestHeader("Accept", s.dataType && s.accepts[s.dataType] ? s.accepts[s.dataType] + ", */*" : s.accepts._default);
      if (s.beforeSend && s.beforeSend.call(callbackContext, xhr, s) === false) {
        xhr.abort();
        return false;
      }
      onreadystatechange = (xhr.onreadystatechange = function(isTimeout) {
        var errMsg;
        if (!xhr || xhr.readyState === 0 || isTimeout === "abort") {
          if (!requestDone) {
            complete();
          }
          requestDone = true;
          return xhr ? (xhr.onreadystatechange = function() {}) : null;
        } else if (!requestDone && xhr && (xhr.readyState === 4 || isTimeout === "timeout")) {
          requestDone = true;
          xhr.onreadystatechange = function() {};
          status = isTimeout === "timeout" ? "timeout" : (!Titanium.Network.httpSuccess(xhr) ? "error" : (s.ifModified && Titanium.Network.httpNotModified(xhr, s.url) ? "notmodified" : "success"));
          errMsg = "";
          if (status === "success") {
            try {
              data = Titanium.Network.httpData(xhr, s.dataType, s);
            } catch (err) {
              status = "parsererror";
              errMsg = err;
            }
          }
          if (status === "success" || status === "notmodified") {
            success();
          } else {
            Titanium.Network.handleError(s, xhr, status, errMsg);
          }
          complete();
          if (isTimeout === "timeout") {
            xhr.abort();
          }
          return s.async ? (xhr = null) : null;
        }
      });
      try {
        oldAbort = xhr.abort;
        xhr.abort = function() {
          if (xhr) {
            oldAbort.call(xhr);
          }
          return onreadystatechange("abort");
        };
      } catch (e) {

      }
      if (s.async && s.timeout > 0) {
        setTimeout(function() {
          return xhr && !requestDone ? onreadystatechange("timeout") : null;
        }, s.timeout);
      }
      try {
        xhr.send(type === "POST" || type === "PUT" || type === "DELETE" ? s.data : null);
      } catch (e) {
        Titanium.Network.handleError(s, xhr, null, e);
        complete();
      }
      success = function() {
        return s.success ? s.success.call(callbackContext, data, status, xhr) : null;
      };
      complete = function() {
        return s.complete ? s.complete.call(callbackContext, xhr, status) : null;
      };
      return xhr;
    }
  });
  Titanium.ajax = Titanium.Network.ajax;
}).call(this);
