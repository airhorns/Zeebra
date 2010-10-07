(function() {
  var LinkedInAccount;
  var __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  };
  LinkedInAccount = function() {
    return Zeebra.Account.apply(this, arguments);
  };
  __extends(LinkedInAccount, Zeebra.Account);
  LinkedInAccount.prototype.type = "LinkedInAccount";
  Zeebra.registerAccount(LinkedInAccount);
}).call(this);
