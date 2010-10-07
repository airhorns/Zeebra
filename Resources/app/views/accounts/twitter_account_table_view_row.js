(function() {
  var TwitterAccountTableViewRow;
  var __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  };
  TwitterAccountTableViewRow = function(account) {
    var _ref, realName, screenName;
    TwitterAccountTableViewRow.__super__.constructor.apply(this, arguments);
    screenName = Ti.UI.createLabel({
      color: '#000',
      text: "@" + this.account.screenName,
      font: {
        fontSize: 20,
        fontWeight: 'bold'
      },
      top: 5,
      left: 70,
      height: 'auto',
      width: 'auto'
    });
    this.row.add(screenName);
    if (typeof (_ref = this.account.name) !== "undefined" && _ref !== null) {
      realName = Ti.UI.createLabel({
        color: '#333',
        text: this.account.name,
        font: {
          fontSize: 15,
          fontWeight: 'bold'
        },
        top: 30,
        left: 70,
        height: 'auto',
        width: 'auto'
      });
      this.row.add(realName);
    }
    return this;
  };
  __extends(TwitterAccountTableViewRow, Zeebra.AccountTableViewRow);
  Zeebra.TwitterAccountTableViewRow = TwitterAccountTableViewRow;
}).call(this);
