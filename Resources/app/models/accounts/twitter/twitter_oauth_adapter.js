(function() {
  var TwitterOAuthAdapter, ZEEBRA_CONSUMER_SECRET;
  var __bind = function(func, context) {
    return function(){ return func.apply(context, arguments); };
  }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  };
  Ti.include('vendor/sha1.js');
  Ti.include('vendor/oauth.js');
  ZEEBRA_CONSUMER_SECRET = '1NrCi94u62mwaAvZyDjdznOVUN0vQdfsyLpiy2O4';
  TwitterOAuthAdapter = function() {
    return Zeebra.Account.apply(this, arguments);
  };
  __extends(TwitterOAuthAdapter, Zeebra.Account);
  TwitterOAuthAdapter.prototype.consumerSecret = ZEEBRA_CONSUMER_SECRET;
  TwitterOAuthAdapter.prototype.consumerKey = 'at0rryC4zHWNcIRhbIW0Fw';
  TwitterOAuthAdapter.prototype.signatureMethod = 'HMAC-SHA1';
  TwitterOAuthAdapter.prototype.pin = null;
  TwitterOAuthAdapter.prototype.requestToken = null;
  TwitterOAuthAdapter.prototype.requestTokenSecret = null;
  TwitterOAuthAdapter.prototype.accessToken = null;
  TwitterOAuthAdapter.prototype.accessTokenSecret = null;
  TwitterOAuthAdapter.prototype.accessor = {
    consumerSecret: ZEEBRA_CONSUMER_SECRET,
    tokenSecret: ''
  };
  TwitterOAuthAdapter.prototype.authorizationWindow = null;
  TwitterOAuthAdapter.prototype.authorizationView = null;
  TwitterOAuthAdapter.prototype.authorizationWebView = null;
  TwitterOAuthAdapter.prototype.isAuthorized = function() {
    var _ref;
    return (typeof (_ref = this.accessToken) !== "undefined" && _ref !== null) && (typeof (_ref = this.accessTokenSecret) !== "undefined" && _ref !== null);
  };
  TwitterOAuthAdapter.prototype.createMessage = function(url) {
    var message;
    message = {
      action: url,
      method: 'POST',
      parameters: []
    };
    message.parameters.push(['oauth_consumer_key', this.consumerKey]);
    message.parameters.push(['oauth_signature_method', this.signatureMethod]);
    return message;
  };
  TwitterOAuthAdapter.prototype.getRequestToken = function(url) {
    var message, parameterMap, responseParams, xhr;
    this.accessor.tokenSecret = '';
    message = this.createMessage(url);
    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, this.accessor);
    parameterMap = OAuth.getParameterMap(message.parameters);
    xhr = Titanium.ajax({
      url: url,
      type: "POST",
      data: parameterMap,
      async: false
    });
    responseParams = OAuth.getParameterMap(xhr.responseText);
    this.requestToken = responseParams['oauth_token'];
    this.requestTokenSecret = responseParams['oauth_token_secret'];
    Ti.API.debug(xhr.responseText);
    return xhr.responseText;
  };
  TwitterOAuthAdapter.prototype.destroyAuthorizeUI = function() {
    Ti.API.debug('destroyAuthorizeUI');
    try {
      Ti.API.debug('destroyAuthorizeUI:webView.removeEventListener');
      this.authorizationWebView.removeEventListener('load', this.authorizeUICallback);
      Ti.API.debug('destroyAuthorizeUI:window.close()');
      return this.authorizationWindow.close();
    } catch (ex) {
      Ti.API.debug(ex);
      return Ti.API.debug('Cannot destroy the authorize UI. Ignoring.');
    }
  };
  TwitterOAuthAdapter.prototype.authorizeUICallback = function(e) {
    var _ref, i, id, node, nodeList, xmlDocument;
    xmlDocument = Ti.XML.parseString(e.source.html);
    nodeList = xmlDocument.getElementsByTagName('div');
    i = 0;
    while (i < nodeList.length) {
      node = nodeList.item(i);
      id = node.attributes.getNamedItem('id');
      if (id && id.nodeValue === 'oauth_pin') {
        this.pin = node.text;
        if (typeof (_ref = this.receivePinCallback) !== "undefined" && _ref !== null) {
          setTimeout(__bind(function() {
            return this.receivePinCallback();
          }, this), 100);
        }
        id = null;
        node = null;
        this.destroyAuthorizeUI();
        break;
      }
      i++;
    }
    nodeList = null;
    return (xmlDocument = null);
  };
  TwitterOAuthAdapter.prototype.receivePin = function() {
    var _ref;
    this.getAccessToken('https://api.twitter.com/oauth/access_token');
    Ti.API.debug(this.accessToken);
    Ti.API.debug(this.accessTokenSecret);
    if (typeof (_ref = this.connected) !== "undefined" && _ref !== null) {
      return this.connected();
    }
  };
  TwitterOAuthAdapter.prototype.showAuthorizeUI = function(url) {
    var animation, closeLabel, transform;
    this.receivePinCallback = this.receivePin;
    this.authorizationWindow = Ti.UI.createWindow({
      modal: true,
      navBarHidden: true
    });
    transform = Ti.UI.create2DMatrix().scale(0);
    this.authorizationView = Ti.UI.createView({
      top: 5,
      width: 310,
      height: 450,
      border: 10,
      backgroundColor: 'white',
      borderColor: '#aaa',
      borderRadius: 20,
      borderWidth: 5,
      zIndex: -1,
      transform: transform
    });
    closeLabel = Ti.UI.createLabel({
      textAlign: 'right',
      font: {
        fontWeight: 'bold',
        fontSize: '15pt'
      },
      text: '[X]',
      top: 0,
      right: 12,
      width: 20
    });
    this.authorizationWindow.open();
    this.authorizationWebView = Ti.UI.createWebView({
      autoDetect: [Ti.UI.AUTODETECT_NONE]
    });
    this.authorizationWebView.addEventListener('load', __bind(function(e) {
      return this.authorizeUICallback(e);
    }, this));
    this.authorizationView.add(this.authorizationWebView);
    this.authorizationWindow.add(this.authorizationView);
    closeLabel.addEventListener('click', __bind(function() {
      return this.destroyAuthorizeUI();
    }, this));
    this.authorizationView.add(closeLabel);
    animation = Ti.UI.createAnimation();
    animation.transform = Ti.UI.create2DMatrix();
    animation.duration = 500;
    return this.authorizationView.animate(animation);
  };
  TwitterOAuthAdapter.prototype.requestAccessWithUI = function(url) {
    this.authorizationWebView.url = url;
    return this.authorizationWebView.reload();
  };
  TwitterOAuthAdapter.prototype.getAccessToken = function(url) {
    var _i, _len, _ref, message, p, parameterMap, responseParams, xhr;
    this.accessor.tokenSecret = this.requestTokenSecret;
    message = this.createMessage(url);
    message.parameters.push(['oauth_token', this.requestToken]);
    message.parameters.push(['oauth_verifier', this.pin]);
    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, this.accessor);
    parameterMap = OAuth.getParameterMap(message.parameters);
    _ref = parameterMap;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      p = _ref[_i];
      Ti.API.debug(p + ': ' + parameterMap[p]);
    }
    xhr = Titanium.ajax({
      url: url,
      type: "POST",
      data: parameterMap,
      async: false
    });
    responseParams = OAuth.getParameterMap(client.responseText);
    this.accessToken = responseParams['oauth_token'];
    this.accessTokenSecret = responseParams['oauth_token_secret'];
    Ti.API.debug('*** get access token, Response: ' + client.responseText);
    return client.responseText;
  };
  TwitterOAuthAdapter.prototype.send = function(url, parameters, method, successCallback, errorCallback) {
    var _ref, k, message, parameterMap, v, xhr;
    method = (typeof method !== "undefined" && method !== null) ? method : 'GET';
    successCallback = (typeof successCallback !== "undefined" && successCallback !== null) ? successCallback : function(e) {};
    errorCallback = (typeof errorCallback !== "undefined" && errorCallback !== null) ? errorCallback : function(e) {};
    Ti.API.debug('Sending a ' + method + ' message to the service at [' + url + '] with the following params: ' + JSON.stringify(parameters));
    if (!(typeof (_ref = this.accessToken) !== "undefined" && _ref !== null) || !(typeof (_ref = this.accessTokenSecret) !== "undefined" && _ref !== null)) {
      Ti.API.debug('The send cannot be processed as the client doesn\'t have an access token.');
      return false;
    }
    this.accessor.tokenSecret = this.accessTokenSecret;
    message = this.createMessage(url);
    message.parameters.push(['oauth_token', this.accessToken]);
    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, this.accessor);
    _ref = parameters;
    for (k in _ref) {
      if (!__hasProp.call(_ref, k)) continue;
      v = _ref[k];
      message.parameters.push([k, v]);
    }
    message.method = method;
    Ti.API.debug("Sending message: " + JSON.stringify(message));
    parameterMap = OAuth.getParameterMap(message.parameters);
    xhr = Titanium.ajax({
      url: url,
      type: method,
      data: parameterMap,
      error: errorCallback,
      success: successCallback
    });
    return client;
  };
  TwitterOAuthAdapter.prototype.authorizeWithTwitter = function() {
    var token;
    this.showAuthorizeUI();
    Ti.API.debug("Getting Request token");
    token = this.getRequestToken('https://api.twitter.com/oauth/request_token');
    Ti.API.debug(token);
    if (!(typeof token !== "undefined" && token !== null)) {
      Ti.API.debug("Token is null!");
      this.destroyAuthorizeUI();
      alert("There was an error getting authorization started with Twitter! Please try again.");
      return false;
    }
    return this.requestAccessWithUI('https://api.twitter.com/oauth/authorize?' + token);
  };
  Zeebra.TwitterOAuthAdapter = TwitterOAuthAdapter;
}).call(this);
