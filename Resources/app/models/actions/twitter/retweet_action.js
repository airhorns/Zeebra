(function() {
  var RetweetAction;
  var __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  };
  RetweetAction = function() {
    return Zeebra.TwitterAction.apply(this, arguments);
  };
  __extends(RetweetAction, Zeebra.TwitterAction);
  RetweetAction.prototype.type = "TwitterRetweetAction";
  RetweetAction.prototype.buttonText = "Retweet";
  RetweetAction.declares = ["status_id"];
  RetweetAction.prototype.action = function(account, success, failure) {
    return account.api.retweet(this.status_id, success, failure);
  };
  RetweetAction.prototype.actionName = function() {
    return "Retweet this user";
  };
  Zeebra.Actions.Twitter.Retweet = RetweetAction;
}).call(this);
