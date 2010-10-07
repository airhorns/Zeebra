(function() {
  var SplashInfoTableViewRow;
  var __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  };
  SplashInfoTableViewRow = function(splash) {
    var _ref, description, photo, text_offset, title;
    this.row = Titanium.UI.createTableViewRow({
      height: 80,
      className: "codeInfoRow"
    });
    this.splash = splash;
    this.row.object = this;
    if (typeof (_ref = splash.photo) !== "undefined" && _ref !== null) {
      text_offset = 70;
      photo = Ti.UI.createImageView({
        image: splash.photo,
        size: {
          height: 60,
          width: 60
        },
        top: 5,
        left: 5
      });
    } else {
      text_offset = 5;
    }
    title = Ti.UI.createLabel({
      color: '#000',
      text: splash.name,
      font: {
        fontSize: 30,
        fontWeight: 'bold'
      },
      top: 5,
      left: text_offset,
      height: 'auto',
      width: 'auto'
    });
    this.row.add(title);
    description = Ti.UI.createLabel({
      color: '#000',
      text: splash.description,
      font: {
        fontSize: 20,
        fontWeight: 'bold'
      },
      top: 45,
      left: text_offset,
      height: 'auto',
      width: 'auto'
    });
    this.row.add(description);
    return this;
  };
  __extends(SplashInfoTableViewRow, Zeebra.Object);
  Zeebra.SplashInfoTableViewRow = SplashInfoTableViewRow;
}).call(this);
