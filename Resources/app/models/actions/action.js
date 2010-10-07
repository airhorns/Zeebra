(function() {
  var Action;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  };
  Action = function(attributes) {
    var _ref, decs, k, v;
    decs = this.constructor.declares;
    if (_.keys(attributes).length === decs.length) {
      this.valid = true;
      _ref = attributes;
      for (k in _ref) {
        if (!__hasProp.call(_ref, k)) continue;
        v = _ref[k];
        if (_.isFunction(this[k])) {
          this.valid = (this.valid && this[k].call(v));
        } else {
          this[k] = v;
        }
      }
    } else {
      Ti.API.debug("Wrong amount of arguments passed to action constructor!");
      this.valid = false;
    }
    return this;
  };
  __extends(Action, Zeebra.Object);
  Action.declares = [];
  Action.prototype.valid = false;
  Action.prototype.icon = "images/account_icons/GenericAccount_16.png";
  Action.prototype.readyToRun = function(account) {
    return true;
  };
  Action.prototype.run = function(account, success, failure) {
    return this.readyToRun(account) ? this.action(account, success, failure) : this.failure(null, "Not ready to run!");
  };
  Action.prototype.action = function(account, success, failure) {
    return success();
  };
  Action.prototype.actionName = function() {
    return "An action";
  };
  Action.prototype.button = function() {
    return true;
  };
  Zeebra.Action = Action;
  Zeebra.Actions = {
    Twitter: {},
    Facebook: {},
    LinkedIn: {},
    Foursquare: {}
  };
  _.extend(Zeebra.Actions, {
    newFromJSON: function(passed_attributes) {
      var _i, _len, _ref, action, attributes, namespace, scope, type, types;
      attributes = _.clone(passed_attributes || {});
      type = attributes['_type'];
      delete attributes['id'];
      if (type) {
        delete attributes['_type'];
        types = type.split("::");
        scope = Zeebra;
        _ref = types;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          namespace = _ref[_i];
          if (!(_.isUndefined(scope[namespace]))) {
            scope = scope[namespace];
          } else {
            Ti.API.error("Unrecognized action namespace/type " + type + ". Looked at Zeebra." + types.join("."));
            return false;
          }
        }
        if (_.isFunction(scope)) {
          action = new scope(attributes);
          if (action.valid) {
            return action;
          } else {
            Ti.API.error("Invalid action generated from attributes.");
            return false;
          }
        } else {
          Ti.API.error("Unrecognized action scope found at Zeebra." + types.join(".") + ", it wasn't a function!");
          return false;
        }
      } else {
        Ti.API.error("Couldn't build action because no type attribute was provided.");
        return false;
      }
    }
  });
  Ti.include("/app/models/actions/twitter/twitter_action.js");
}).call(this);
