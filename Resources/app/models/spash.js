(function() {
  var Code;
  var __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  };
  Ti.include("/app/models/actions/action.js");
  Code = function(shortcode) {
    this.shortcode = shortcode;
    return this;
  };
  __extends(Code, Zeebra.Object);
  Code.shortcodeRE = /\/s\/([a-zA-Z0-9]+)/m;
  Code.backendURL = "http://localhost:3000/s/";
  Code.newFromDecodedData = function(data) {
    var matches, shortcode;
    matches = this.shortcodeRE.exec(data);
    if (matches.length > 1) {
      shortcode = matches[1];
      return new Code(shortcode);
    } else {
      return false;
    }
  };
  Code.prototype.fetchData = function(options) {
    return (options = _.extend(options, {
      url: Code.backendURL + this.shortcode
    }));
  };
  Zeebra.Code = Code;
}).call(this);
