(function() {
  var StatusUpdateAction;
  var __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  };
  StatusUpdateAction = function() {
    return Zeebra.TwitterAction.apply(this, arguments);
  };
  __extends(StatusUpdateAction, Zeebra.TwitterAction);
  StatusUpdateAction.prototype.type = "TwitterStatusUpdateAction";
  StatusUpdateAction.prototype.buttonText = "Tweet";
  StatusUpdateAction.declares = ["text", "in_reply_to_id"];
  StatusUpdateAction.prototype.action = function(account, success, failure) {
    return account.api.update(this.text, null, this.in_reply_to_id, success, failure);
  };
  StatusUpdateAction.prototype.actionName = function() {
    return "Tweet about this";
  };
  Zeebra.Actions.Twitter.StatusUpdateAction = StatusUpdateAction;
}).call(this);
