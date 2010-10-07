(function() {
  var Splash;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  };
  Ti.include("/app/models/actions/action.js");
  Splash = function(attributes) {
    var _ref, k, v;
    Splash.__super__.constructor.call(this);
    this.actions = [];
    _ref = attributes;
    for (k in _ref) {
      if (!__hasProp.call(_ref, k)) continue;
      v = _ref[k];
      if (_.isFunction(this[k])) {
        this[k].call(v);
      } else if (k === "actions") {
        this.setActions(v);
      } else {
        this[k] = v;
      }
    }
    return this;
  };
  __extends(Splash, Zeebra.Object);
  Splash.shortcodeRE = /\/s\/([a-zA-Z0-9]+)/m;
  Splash.backendURL = "http://localhost:3000/s/";
  Splash.newFromDecodedData = function(data, success, error) {
    var matches, shortcode;
    matches = this.shortcodeRE.exec(data);
    if ((typeof matches !== "undefined" && matches !== null) && matches.length > 1) {
      shortcode = matches[1];
      data.replace(/\.(html|xml|json)/, ".json");
      if (!(data.match(".json"))) {
        data += ".json";
      }
      return Titanium.ajax({
        url: data,
        dataType: "json",
        success: function(attributes, status, xhr) {
          var splash;
          Ti.API.debug("Success fetching splash!");
          splash = new Zeebra.Splash(attributes);
          if (_.isFunction(success)) {
            return success(splash);
          }
        },
        error: function(xhr, status, e) {
          Ti.API.error("Error retrieving splash data. Status:" + status + ", code:" + xhr.status);
          return error(xhr, status, e);
        }
      });
    } else {
      return false;
    }
  };
  Splash.prototype.name = "";
  Splash.prototype.description = "";
  Splash.prototype.photo = "";
  Splash.prototype.text = "";
  Splash.prototype.setActions = function(passed_actions) {
    var _i, _len, _ref, _result, action, attrs;
    _result = []; _ref = passed_actions;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      attrs = _ref[_i];
      _result.push((function() {
        action = Zeebra.Actions.newFromJSON(attrs);
        if (action !== false) {
          return this.actions.push(action);
        } else {
          Ti.API.error("Invalid/Unknown action! Attributes were:");
          return Ti.API.debug(attrs);
        }
      }).call(this));
    }
    return _result;
  };
  Zeebra.Splash = Splash;
}).call(this);
