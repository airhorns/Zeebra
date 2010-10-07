(function() {
  var AuthorizationWebViewWindow;
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
  AuthorizationWebViewWindow = function(controller) {
    var animation, transform;
    AuthorizationWebViewWindow.__super__.constructor.apply(this, arguments);
    this.win = Ti.UI.createWindow({
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
    this.closeLabel = Ti.UI.createLabel({
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
    this.win.open();
    this.authorizationWebView = Ti.UI.createWebView({
      autoDetect: [Ti.UI.AUTODETECT_NONE]
    });
    this.authorizationWebView.addEventListener('load', __bind(function(e) {
      return this.fireEvent("load", e);
    }, this));
    this.authorizationView.add(this.authorizationWebView);
    this.win.add(this.authorizationView);
    this.loadCallback = __bind(function() {
      return this.destroyAuthorizeUI();
    }, this);
    this.closeLabel.addEventListener('click', this.loadCallback);
    this.authorizationView.add(this.closeLabel);
    animation = Ti.UI.createAnimation();
    animation.transform = Ti.UI.create2DMatrix();
    animation.duration = 500;
    this.authorizationView.animate(animation);
    return this;
  };
  __extends(AuthorizationWebViewWindow, Zeebra.GenericWindow);
  AuthorizationWebViewWindow.prototype.loadURL = function(url) {
    this.authorizationWebView.url = url;
    return this.authorizationWebView.reload();
  };
  AuthorizationWebViewWindow.prototype.destroyAuthorizeUI = function() {
    var _ref;
    Ti.API.debug('Destroying Authorize UI');
    if (!(typeof (_ref = this.win) !== "undefined" && _ref !== null)) {
      return true;
    }
    try {
      this.authorizationWebView.removeEventListener('load', this.loadCallback);
      return this.win.close();
    } catch (ex) {
      Ti.API.debug('Cannot destroy the authorize UI. Ignoring. Error:');
      return Ti.API.error(ex);
    }
  };
  Zeebra.AuthorizationWebViewWindow = AuthorizationWebViewWindow;
}).call(this);
