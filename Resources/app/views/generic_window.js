(function() {
  var GenericWindow;
  var __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  };
  GenericWindow = function(controller) {
    this.controller = controller;
    return this;
  };
  __extends(GenericWindow, Zeebra.Observable);
  Zeebra.GenericWindow = GenericWindow;
}).call(this);
