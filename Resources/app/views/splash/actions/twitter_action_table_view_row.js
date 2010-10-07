(function() {
  var TwitterActionTableViewRow;
  var __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  };
  TwitterActionTableViewRow = function() {
    return Zeebra.ActionRows.ActionTableViewRow.apply(this, arguments);
  };
  __extends(TwitterActionTableViewRow, Zeebra.ActionRows.ActionTableViewRow);
  TwitterActionTableViewRow.prototype.type = "TwitterActionTableViewRow";
  TwitterActionTableViewRow.prototype.icon = function() {
    return "images/account_icons/TwitterAccount_32.png";
  };
  TwitterActionTableViewRow.prototype.buttonText = function() {
    return this.action.buttonText;
  };
  Zeebra.registerActionViewRow(TwitterActionTableViewRow);
}).call(this);
