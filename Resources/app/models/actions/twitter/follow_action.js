(function() {
  var FollowAction;
  var __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  };
  FollowAction = function() {
    return Zeebra.TwitterAction.apply(this, arguments);
  };
  __extends(FollowAction, Zeebra.TwitterAction);
  FollowAction.declares = ["followee_id"];
  FollowAction.prototype.type = "TwitterFollowAction";
  FollowAction.prototype.buttonText = "Follow";
  FollowAction.prototype.action = function(account, success, failure) {
    return account.api.addFriend(this.followee_id, success, failure);
  };
  FollowAction.prototype.actionName = function() {
    return "Follow " + this.followee_id;
  };
  Zeebra.Actions.Twitter.Follow = FollowAction;
}).call(this);
