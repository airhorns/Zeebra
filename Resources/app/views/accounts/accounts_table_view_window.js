(function() {
  var AccountsTableViewWindow;
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
  AccountsTableViewWindow = function(controller, initialAccounts) {
    var _i, _len, _ref, _result, a, rows;
    AccountsTableViewWindow.__super__.constructor.apply(this, arguments);
    this.win = Ti.UI.createWindow({
      title: "Accounts",
      backgroundColor: '#fff'
    });
    this.addButton = Titanium.UI.createButton({
      systemButton: Titanium.UI.iPhone.SystemButton.ADD
    });
    this.addButton.addEventListener('click', __bind(function() {
      return controller.addNewAccount();
    }, this));
    rows = (function() {
      _result = []; _ref = initialAccounts;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        a = _ref[_i];
        _result.push((function() {
          a.displayed = true;
          return this._getTableRowFromAccount(a);
        }).call(this));
      }
      return _result;
    }).call(this);
    this.table = Titanium.UI.createTableView({
      data: rows,
      rowHeight: 60,
      editable: true
    });
    this.win.add(this.table);
    this.win.rightNavButton = this.addButton;
    this.loading_indicator = Titanium.UI.createActivityIndicator();
    this.loading_indicator.style = Titanium.UI.iPhone.ActivityIndicatorStyle.PLAIN;
    this.loading_indicator.font = {
      fontFamily: 'Helvetica Neue',
      fontSize: 15,
      fontWeight: 'bold'
    };
    this.loading_indicator.color = 'white';
    this.loading_indicator.message = 'Loading...';
    this.table.addEventListener("delete", function(e) {
      var _ref2;
      return (typeof (_ref2 = e.row.wrapper) !== "undefined" && _ref2 !== null) ? e.row.wrapper.account.fireEvent("state:deleted", e) : null;
    });
    return this;
  };
  __extends(AccountsTableViewWindow, Zeebra.GenericWindow);
  AccountsTableViewWindow.prototype.showLoading = function() {
    this.win.setToolbar([this.loading_indicator], {
      animated: true
    });
    this.loading_indicator.show();
    return setTimeout(__bind(function() {
      return this.hideLoading();
    }, this), 3000);
  };
  AccountsTableViewWindow.prototype.hideLoading = function() {
    this.loading_indicator.hide();
    return this.win.setToolbar(null, {
      animated: true
    });
  };
  AccountsTableViewWindow.prototype.displayAccount = function(account) {
    account.displayed = true;
    return this._addAccountToTable(account);
  };
  AccountsTableViewWindow.prototype.updateAccountDisplay = function(account) {
    return Ti.API.error("Updating account display -> NOT IMPLEMENTED");
  };
  AccountsTableViewWindow.prototype._addAccountToTable = function(account) {
    var row;
    row = this._getTableRowFromAccount(account);
    return this.table.appendRow(row, {
      animated: true
    });
  };
  AccountsTableViewWindow.prototype._getTableRowFromAccount = function(account) {
    var klass, rowView;
    klass = Zeebra[account.type + "TableViewRow"];
    if (typeof klass !== "undefined" && klass !== null) {
      rowView = new klass(account);
      return rowView.row;
    } else {
      return false;
    }
  };
  Zeebra.AccountsTableViewWindow = AccountsTableViewWindow;
}).call(this);
