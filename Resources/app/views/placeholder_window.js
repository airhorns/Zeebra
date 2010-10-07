(function() {
  var PlaceholderWindow;
  var __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  };
  PlaceholderWindow = function(controller, theTitle, theText) {
    var label;
    PlaceholderWindow.__super__.constructor.apply(this, arguments);
    this.win = Ti.UI.createWindow({
      title: theTitle,
      backgroundColor: '#fff'
    });
    label = Titanium.UI.createLabel({
      color: '#999',
      text: theText,
      font: {
        fontSize: 20,
        fontFamily: 'Helvetica Neue'
      },
      textAlign: 'center',
      width: 'auto'
    });
    this.win.add(label);
    return this;
  };
  __extends(PlaceholderWindow, Zeebra.GenericWindow);
  Zeebra.PlaceholderWindow = PlaceholderWindow;
}).call(this);
