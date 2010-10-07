(function() {
  var GoogleAccount;
  var __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  };
  GoogleAccount = function() {
    return Zeebra.Account.apply(this, arguments);
  };
  __extends(GoogleAccount, Zeebra.Account);
  GoogleAccount.prototype.type = "GoogleAccount";
  Zeebra.registerAccount(GoogleAccount);
}).call(this);
