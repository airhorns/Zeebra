(function() {
  var OAuthorizedAccount;
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
  OAuthorizedAccount = function() {
    return Zeebra.Account.apply(this, arguments);
  };
  __extends(OAuthorizedAccount, Zeebra.Account);
  OAuthorizedAccount.prototype.consumerSecret = ZEEBRA_CONSUMER_SECRET;
  OAuthorizedAccount.prototype.consumerKey = 'at0rryC4zHWNcIRhbIW0Fw';
  OAuthorizedAccount.prototype.signatureMethod = 'HMAC-SHA1';
  OAuthorizedAccount.prototype.pin = null;
  OAuthorizedAccount.prototype.requestToken = null;
  OAuthorizedAccount.prototype.requestTokenSecret = null;
  OAuthorizedAccount.prototype.accessToken = null;
  OAuthorizedAccount.prototype.accessTokenSecret = null;
  OAuthorizedAccount.prototype.accessor = {
    consumerSecret: ZEEBRA_CONSUMER_SECRET,
    tokenSecret: ''
  };
  OAuthorizedAccount.prototype.authorizationWindow = null;
  OAuthorizedAccount.prototype.authorizationView = null;
  OAuthorizedAccount.prototype.authorizationWebView = null;
  OAuthorizedAccount.prototype.isAuthorized = function() {
    var _ref;
    return (typeof (_ref = this.accessToken) !== "undefined" && _ref !== null) && (typeof (_ref = this.accessTokenSecret) !== "undefined" && _ref !== null);
  };
  OAuthorizedAccount.prototype.createMessage = function(url) {
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
  OAuthorizedAccount.prototype.getRequestToken = function(url) {
    var client, message, parameterMap, responseParams;
    this.accessor.tokenSecret = '';
    message = this.createMessage(url);
    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, this.accessor);
    client = Ti.Network.createHTTPClient();
    parameterMap = OAuth.getParameterMap(message.parameters);
    client.open('POST', url, false);
    client.send(parameterMap);
    responseParams = OAuth.getParameterMap(client.responseText);
    this.requestToken = responseParams['oauth_token'];
    this.requestTokenSecret = responseParams['oauth_token_secret'];
    return client.responseText;
  };
  OAuthorizedAccount.prototype.destroyAuthorizeUI = function() {
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
  OAuthorizedAccount.prototype.authorizeUICallback = function(e) {
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
  OAuthorizedAccount.prototype.receivePin = function() {
    var _ref;
    this.getAccessToken('https://api.twitter.com/oauth/access_token');
    Ti.API.debug(this.accessToken);
    Ti.API.debug(this.accessTokenSecret);
    if (typeof (_ref = this.connected) !== "undefined" && _ref !== null) {
      return this.connected();
    }
  };
  OAuthorizedAccount.prototype.showAuthorizeUI = function(url) {
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
  OAuthorizedAccount.prototype.requestAccessWithUI = function(url) {
    this.authorizationWebView.url = url;
    return this.authorizationWebView.reload();
  };
  OAuthorizedAccount.prototype.getAccessToken = function(url) {
    var _i, _len, _ref, client, message, p, parameterMap, responseParams;
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
    client = Ti.Network.createHTTPClient();
    client.open('POST', url, false);
    client.send(parameterMap);
    responseParams = OAuth.getParameterMap(client.responseText);
    this.accessToken = responseParams['oauth_token'];
    this.accessTokenSecret = responseParams['oauth_token_secret'];
    Ti.API.debug('*** get access token, Response: ' + client.responseText);
    return client.responseText;
  };
  OAuthorizedAccount.prototype.send = function(url, parameters, method, successCallback, errorCallback) {
    var _ref, client, k, message, parameterMap, v;
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
    client = Ti.Network.createHTTPClient();
    client.onerror = errorCallback;
    client.onload = successCallback;
    client.open(method, url);
    client.send(parameterMap);
    return client;
  };
  OAuthorizedAccount.prototype.authorizeWithTwitter = function() {
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
