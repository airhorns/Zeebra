(function() {
  var FoursquareAccount;
  var __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  };
  FoursquareAccount = function() {
    return Zeebra.Account.apply(this, arguments);
  };
  __extends(FoursquareAccount, Zeebra.Account);
  FoursquareAccount.prototype.type = "FoursquareAccount";
  Zeebra.registerAccount(FoursquareAccount);
}).call(this);
