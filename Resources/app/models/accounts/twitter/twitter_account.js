(function() {
  var TwitterAccount;
  var __bind = function(func, context) {
    return function(){ return func.apply(context, arguments); };
  }, __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  };
  Ti.include('/app/controllers/oauthorization_controller.js');
  Ti.include('/vendor/spazcore/libs/spaztwit.js');
  TwitterAccount = function(params) {
    TwitterAccount.__super__.constructor.call(this, params);
    this.consumer = new SpazOAuth({
      'service': 'twitter'
    });
    this.api = new SpazTwit();
    this.consumer.accessToken = this.accessToken;
    this.consumer.accessTokenSecret = this.accessTokenSecret;
    if (this.consumer.isAuthorized()) {
      this.api.setCredentials(this.consumer);
    }
    return this;
  };
  __extends(TwitterAccount, Zeebra.Account);
  TwitterAccount.prototype.type = "TwitterAccount";
  TwitterAccount.prototype.persistableAttributes = ["screenName", "name", "accessToken", "accessTokenSecret"];
  TwitterAccount.prototype.synch = function() {
    this.fireEvent("state:updating");
    if (!this.isAuthorized()) {
      Ti.API.debug("Trying to synch Twitter Account but account is not authorized!");
      this.fireEvent("state:error");
      return false;
    }
    return this.api.verifyCredentials(__bind(function(e) {
      this.name = this.api.me.name;
      this.screenName = this.api.me.screen_name;
      this.fireEvent("state:ready");
      return this.markAsSynched();
    }, this), __bind(function(e, status, error) {
      Ti.API.error("Couldn't retrive account information! Status: " + status);
      Ti.API.error("Status: " + e.status);
      Ti.API.error("Message: " + error.message);
      Ti.API.error("Response: " + e.responseText);
      return this.fireEvent("state:error");
    }, this));
  };
  TwitterAccount.prototype.isAuthorized = function() {
    return this.consumer.isAuthorized();
  };
  TwitterAccount.prototype.authorize = function(callback) {
    var controller, errorFindingPin, findPin;
    TwitterAccount.__super__.authorize.apply(this, arguments);
    controller = {};
    this.addEventListener("authorization:error", __bind(function(e) {
      return controller.destroy();
    }, this));
    errorFindingPin = __bind(function(e) {
      Ti.API.error("Error finding pin in authorize UI. Canceling process.");
      this.fireEvent("authorization:error", e);
      return this.fireEvent("authorization:complete");
    }, this);
    findPin = __bind(function(e) {
      var i, id, node, nodeList, xmlDocument;
      try {
        xmlDocument = Ti.XML.parseString(e.source.html);
        nodeList = xmlDocument.getElementsByTagName('div');
        i = 0;
        while (i < nodeList.length) {
          node = nodeList.item(i);
          id = node.attributes.getNamedItem('id');
          if (id && id.nodeValue === 'oauth_pin') {
            this.pin = node.text;
            setTimeout(__bind(function() {
              return this._getAccessToken(this.pin);
            }, this), 100);
            id = null;
            node = null;
            controller.destroy();
            break;
          }
          i++;
        }
        nodeList = null;
        xmlDocument = null;
      } catch (e) {
        Ti.API.error("Error parsing Authorize UI XML and finding PIN.");
        errorFindingPin(e);
      }
      return Ti.API.debug("Pin not found in loaded XML");
    }, this);
    controller = new Zeebra.OAuthorizationController(findPin, errorFindingPin);
    return this.consumer.getRequestTokenAsync(__bind(function(token) {
      var url;
      url = OAuth.addToURL(this.consumer.getService().userAuthorizationUrl, {
        oauth_token: this.consumer.requestToken
      });
      Ti.API.debug("Sending user to url to authorize: " + url);
      return controller.loadURL(url);
    }, this), __bind(function(xhr) {
      Ti.API.error("Couldn't get request token!");
      return this.fireEvent("authorization:error");
    }, this));
  };
  TwitterAccount.prototype._getAccessToken = function(accessPin) {
    var _ref, msg;
    Ti.API.debug("Trying to complete authorization with pin: " + accessPin);
    if (typeof (_ref = this.consumer.requestToken) !== "undefined" && _ref !== null) {
      if (typeof accessPin !== "undefined" && accessPin !== null) {
        if (this.consumer.getAuthorization(accessPin)) {
          this.completeAuthorization();
          return true;
        } else {
          msg = "Unable to get authorization from consumer with the provided access PIN.";
        }
      } else {
        msg = "Invalid access PIN";
      }
    } else {
      msg = "Consumer has no request token!";
    }
    this.fireEvent("authorization:error", {
      msg: msg,
      source: this
    });
    return this.fireEvent("authorization:complete");
  };
  TwitterAccount.prototype.completeAuthorization = function() {
    this.accessToken = this.consumer.accessToken;
    this.accessTokenSecret = this.consumer.accessTokenSecret;
    this.api.setCredentials(this.consumer);
    return TwitterAccount.__super__.completeAuthorization.call(this);
  };
  Zeebra.registerAccount(TwitterAccount);
}).call(this);
