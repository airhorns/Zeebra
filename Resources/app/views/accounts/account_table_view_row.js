(function() {
  var AccountTableViewRow;
  var __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  };
  AccountTableViewRow = function(account) {
    this.account = account;
    this.row = this.getTableViewRowTemplate();
    this.row.className = account.type + "Row";
    return this;
  };
  __extends(AccountTableViewRow, Zeebra.Object);
  AccountTableViewRow.prototype.getTableViewRowTemplate = function() {
    var photo, row;
    row = Ti.UI.createTableViewRow();
    row.height = 60;
    row.wrapper = this;
    photo = Ti.UI.createView({
      backgroundImage: 'images/account_icons/' + this.account.type + '_64.png',
      top: 10,
      left: 15,
      height: 40,
      width: 40
    });
    row.add(photo);
    return row;
  };
  Zeebra.AccountTableViewRow = AccountTableViewRow;
  Ti.include("/app/views/accounts/twitter_account_table_view_row.js");
}).call(this);
