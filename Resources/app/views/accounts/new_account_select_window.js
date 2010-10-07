(function() {
  var NewAccountSelectWindow;
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
  NewAccountSelectWindow = function(controller, callback) {
    var _i, _len, _ref, _result, data, item, klass, name;
    Ti.API.debug("Creating select window");
    NewAccountSelectWindow.__super__.constructor.apply(this, arguments);
    this.win = Ti.UI.createWindow({
      title: "Add Account",
      backgroundColor: "#000000"
    });
    data = (function() {
      _result = []; _ref = Zeebra.AccountTypes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        klass = _ref[_i];
        _result.push((function() {
          name = klass.prototype.type;
          item = Titanium.UI.createDashboardItem({
            image: "images/account_icons/" + name + '_64.png',
            type: name,
            label: name.replace("Account", "")
          });
          return item;
        })());
      }
      return _result;
    })();
    this.dashboard = Titanium.UI.createDashboardView({
      data: data
    });
    this.dashboard.addEventListener('edit', __bind(function(e) {
      return this.dashboard.stopEditing();
    }, this));
    this.dashboard.addEventListener('click', __bind(function(e) {
      var type;
      if (e.item) {
        type = e.item.type;
        return callback.call(controller, type);
      }
    }, this));
    this.win.add(this.dashboard);
    Ti.API.debug("Done creating select window");
    return this;
  };
  __extends(NewAccountSelectWindow, Zeebra.GenericWindow);
  Zeebra.NewAccountSelectWindow = NewAccountSelectWindow;
}).call(this);
