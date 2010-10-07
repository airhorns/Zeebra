(function() {
  var ActionTableViewRow;
  var __bind = function(func, context) {
    return function(){ return func.apply(context, arguments); };
  }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  };
  ActionTableViewRow = function(action, takeable, clicked) {
    if (!(typeof action !== "undefined" && action !== null)) {
      return false;
    }
    this.action = action;
    this.clicked = clicked;
    this.takeable = (takeable || false);
    this.row = this.getRowTemplate();
    this.state = Zeebra.ActionTableViewRow.Ready;
    this.displayPhoto();
    this.displayText();
    this.displayButton();
    return this;
  };
  __extends(ActionTableViewRow, Zeebra.Object);
  ActionTableViewRow.InProgress = 1;
  ActionTableViewRow.Error = 2;
  ActionTableViewRow.Success = 3;
  ActionTableViewRow.Ready = 4;
  ActionTableViewRow.prototype.type = "ActionTableViewRow";
  ActionTableViewRow.prototype.getRowTemplate = function() {
    var row;
    row = Titanium.UI.createTableViewRow({
      height: 41,
      className: this.action.type + this.type
    });
    row.object = this;
    return row;
  };
  ActionTableViewRow.prototype.displayButton = function(style, title) {
    var _ref, b, button, k, key, opts, shittyTI;
    style = (typeof style !== "undefined" && style !== null) ? style : Titanium.UI.iPhone.SystemButton.BORDERED;
    title = (typeof title !== "undefined" && title !== null) ? title : (_.isFunction(this.action.buttonText) ? this.action.buttonText() : this.action.buttonText);
    key = (String(style) + "style" || "nostyle");
    this.buttons = (typeof this.buttons !== "undefined" && this.buttons !== null) ? this.buttons : {};
    shittyTI = style === Titanium.UI.iPhone.SystemButton.SPINNER;
    if (!(typeof (_ref = this.buttons[key]) !== "undefined" && _ref !== null)) {
      opts = {
        right: 10,
        color: "#000",
        width: 80,
        height: 20
      };
      if (!(shittyTI)) {
        if (typeof style !== "undefined" && style !== null) {
          opts.style = style;
        }
      } else {
        opts.style = style;
        opts.enabled = true;
        opts.height = "auto";
        opts.width = "auto";
      }
      button = Ti.UI.createButton(opts);
      if (!(shittyTI)) {
        button.addEventListener("click", __bind(function(e) {
          return _.isFunction(this.clicked) ? this.clicked(this, e) : Titanium.API.error("Clicked callback can't be run because it isn't a function!");
        }, this));
      }
      this.buttons[key] = button;
      this.row.add(button);
    }
    _ref = this.buttons;
    for (k in _ref) {
      if (!__hasProp.call(_ref, k)) continue;
      b = _ref[k];
      b.hide();
    }
    this.buttons[key].title = title;
    this.buttons[key].enabled = this.takeable;
    this.buttons[key].show();
    return true;
  };
  ActionTableViewRow.prototype.displayText = function() {
    var text;
    text = Ti.UI.createLabel({
      top: 2,
      left: 40,
      color: '#000',
      text: this.text(),
      font: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    });
    return this.row.add(text);
  };
  ActionTableViewRow.prototype.displayPhoto = function() {
    var photo;
    photo = Ti.UI.createView({
      backgroundImage: this.icon(),
      top: 4,
      left: 4,
      height: 32,
      width: 32
    });
    return this.row.add(photo);
  };
  ActionTableViewRow.prototype.displayInProgress = function() {
    d("Trying to display progress");
    this.state = Zeebra.ActionTableViewRow.InProgress;
    this.takeable = false;
    return this.displayButton(Titanium.UI.iPhone.SystemButton.ACTION, " ");
  };
  ActionTableViewRow.prototype.displaySuccess = function() {
    d("Trying to display success");
    this.state = Zeebra.ActionTableViewRow.Success;
    this.takeable = false;
    this.displayButton(Titanium.UI.iPhone.SystemButton.PLAIN, "Done!");
    return d("Success displayed");
  };
  ActionTableViewRow.prototype.displayError = function(retry) {
    d("Trying to display error");
    retry = (typeof retry !== "undefined" && retry !== null) ? retry : true;
    this.state = Zeebra.ActionTableViewRow.Error;
    this.takeable = retry;
    this.displayButton(null, retry ? "Retry?" : "Error!");
    return d("Error displayed");
  };
  ActionTableViewRow.prototype.icon = function() {
    return "images/account_icons/GenericAccount_32.png";
  };
  ActionTableViewRow.prototype.buttonText = function() {
    return "Run";
  };
  ActionTableViewRow.prototype.text = function() {
    return this.action.actionName();
  };
  Zeebra.ActionRows = {};
  Zeebra.registerActionViewRow = function(klass) {
    return (Zeebra.ActionRows[klass.prototype.type] = klass);
  };
  Zeebra.ActionTableViewRow = ActionTableViewRow;
  Zeebra.registerActionViewRow(ActionTableViewRow);
}).call(this);
