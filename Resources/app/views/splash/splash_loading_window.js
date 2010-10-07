(function() {
  var SplashLoadingWindow;
  var __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  };
  SplashLoadingWindow = function(controller, splash) {
    var rows;
    SplashLoadingWindow.__super__.constructor.apply(this, arguments);
    this.splash = splash;
    this.win = Ti.UI.createWindow({
      title: "Scan Results",
      backgroundColor: '#fff'
    });
    rows = this.getActionRows();
    rows.unshift(this.getInfoRow());
    this.table = Titanium.UI.createTableView({
      data: rows,
      editable: false
    });
    this.win.add(this.table);
    return this;
  };
  __extends(SplashLoadingWindow, Zeebra.GenericWindow);
  Zeebra.SplashLoadingWindow = SplashLoadingWindow;
}).call(this);
