(function() {
  var AccountSet;
  var __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  };
  AccountSet = function() {
    this.accounts = [];
    this.load();
    return this;
  };
  __extends(AccountSet, Zeebra.Object);
  AccountSet.prototype.load = function() {
    var _i, _len, _ref, account, accounts, datas, datum;
    if (!(Ti.App.Properties.hasProperty(this.key()))) {
      return [];
    }
    try {
      datas = JSON.parse(Ti.App.Properties.getString(this.key()));
    } catch (e) {
      Ti.API.error("Error parsing account set JSON from properties: ");
      Ti.API.error(e);
      return false;
    }
    datas = (typeof datas !== "undefined" && datas !== null) ? datas : [];
    accounts = [];
    _ref = datas;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      datum = _ref[_i];
      account = Zeebra.PersistedObject.loadFromPersistable(datum);
      if (account) {
        Ti.API.info("Loaded " + account.type + " from persistable.");
        accounts.push(account);
      }
    }
    this.accounts = accounts;
    return this.accounts;
  };
  AccountSet.prototype.save = function() {
    var _i, _len, _ref, account, persistable_accounts;
    Ti.API.debug("Saving accounts store.");
    persistable_accounts = [];
    _ref = this.accounts;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      account = _ref[_i];
      persistable_accounts.push(account.persistable());
    }
    return Ti.App.Properties.setString(this.key(), JSON.stringify(persistable_accounts));
  };
  AccountSet.prototype.key = function() {
    return "ZeebraAccounts";
  };
  AccountSet.prototype.addAccount = function(account) {
    Ti.API.debug("Account Added to store.");
    this.accounts.push(account);
    return this.save();
  };
  AccountSet.prototype.removeAccount = function(account) {
    this.accounts = _.without(this.accounts, account);
    return this.save();
  };
  Zeebra.AccountSet = AccountSet;
}).call(this);
