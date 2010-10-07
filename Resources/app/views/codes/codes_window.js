(function() {
  var CodesWindow;
  var __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  };
  CodesWindow = function() {
    return Zeebra.PlaceholderWindow.apply(this, arguments);
  };
  __extends(CodesWindow, Zeebra.PlaceholderWindow);
  Zeebra.CodesWindow = CodesWindow;
}).call(this);
