(function() {
  var CodeReaderWindow;
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
  CodeReaderWindow = function(controller, theTitle, theText) {
    CodeReaderWindow.__super__.constructor.apply(this, arguments);
    this.win.addEventListener("focus", __bind(function(e) {
      return this.controller.focused(e);
    }, this));
    return this;
  };
  __extends(CodeReaderWindow, Zeebra.PlaceholderWindow);
  Zeebra.CodeReaderWindow = CodeReaderWindow;
}).call(this);
