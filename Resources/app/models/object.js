(function() {
  var Object;
  var __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  };
  Ti.include("/app/models/observable.js");
  Object = function() {
    this.tid = hex_sha1(String(Math.random() * 10));
    return this;
  };
  __extends(Object, Zeebra.Observable);
  Zeebra.Object = Object;
}).call(this);
