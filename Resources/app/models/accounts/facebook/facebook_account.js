(function() {
  var FacebookAccount;
  var __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  };
  FacebookAccount = function() {
    return Zeebra.Account.apply(this, arguments);
  };
  __extends(FacebookAccount, Zeebra.Account);
  FacebookAccount.prototype.type = "FacebookAccount";
  Zeebra.registerAccount(FacebookAccount);
}).call(this);
