(function() {
  var SplashWindow;
  var __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  };
  Ti.include("/app/views/splash/splash_info_table_view_row.js");
  Ti.include("/app/views/splash/actions/action_table_view_row.js");
  Ti.include("/app/views/splash/actions/twitter_action_table_view_row.js");
  SplashWindow = function(controller) {
    SplashWindow.__super__.constructor.apply(this, arguments);
    this.win = Ti.UI.createWindow({
      title: "Scan Results",
      backgroundColor: '#fff'
    });
    this.loadingIndicator = Titanium.UI.createActivityIndicator({
      style: Titanium.UI.iPhone.ActivityIndicatorStyle.PLAIN,
      font: {
        fontFamily: 'Helvetica Neue',
        fontSize: 20,
        fontWeight: 'bold'
      },
      color: '#000',
      message: 'Loading Scan Results ...',
      top: 100
    });
    this.win.add(this.loadingIndicator);
    return this;
  };
  __extends(SplashWindow, Zeebra.GenericWindow);
  SplashWindow.prototype.displaySplash = function(splash) {
    var _ref, rows;
    Ti.API.debug("Displaying splash \"" + splash.name + "\", tid:" + splash.tid);
    this.hideError();
    this.splash = splash;
    if (typeof (_ref = this.table) !== "undefined" && _ref !== null) {
      this.win.remove(this.table);
    }
    rows = this.getActionRows();
    rows.unshift(this.getInfoRow());
    this.table = Titanium.UI.createTableView({
      data: rows,
      editable: false,
      allowsSelection: false
    });
    this.win.add(this.table);
    return this.hideLoading();
  };
  SplashWindow.prototype.displayError = function(msg, retry, callback) {
    var _ref;
    this.hideLoading();
    this.errorLabel = (typeof this.errorLabel !== "undefined" && this.errorLabel !== null) ? this.errorLabel : Ti.UI.createLabel({
      color: '#000',
      font: {
        fontSize: 20,
        fontWeight: 'bold'
      },
      top: 100,
      height: 'auto',
      width: 300
    });
    this.errorLabel.text = msg;
    this.win.add(this.errorLabel);
    if (retry) {
      if (!(typeof (_ref = this.retryButton) !== "undefined" && _ref !== null)) {
        this.retryButton = Titanium.UI.createButton({
          title: "Retry",
          color: '#fff',
          backgroundImage: 'images/buttons/BUTT_grn_off.png',
          backgroundSelectedImage: 'images/buttons/BUTT_grn_on.png',
          backgroundDisabledImage: 'images/buttons/BUTT_drk_off.png',
          font: {
            fontSize: 20,
            fontWeight: 'bold',
            fontFamily: 'Helvetica Neue'
          },
          top: 200,
          width: 301,
          height: 57
        });
        this.retryButton.addEventListener("click", function(e) {
          return callback(e);
        });
      }
      return this.win.add(this.retryButton);
    }
  };
  SplashWindow.prototype.hideError = function() {
    var _ref;
    if (typeof (_ref = this.errorLabel) !== "undefined" && _ref !== null) {
      this.win.remove(this.errorLabel);
    }
    if (typeof (_ref = this.retryButton) !== "undefined" && _ref !== null) {
      return this.win.remove(this.retryButton);
    }
  };
  SplashWindow.prototype.getInfoRow = function() {
    var row;
    row = new Zeebra.SplashInfoTableViewRow(this.splash);
    return row.row;
  };
  SplashWindow.prototype.getActionRows = function() {
    var _i, _len, _ref, _result, action, callback, klass, row, rows, takeable;
    rows = (function() {
      _result = []; _ref = this.splash.actions;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        action = _ref[_i];
        _result.push((function() {
          takeable = this.controller.isActionTakeable(action);
          callback = this.controller.takeActionFromRow;
          klass = Zeebra.ActionRows[action.tableViewRow];
          if (typeof klass !== "undefined" && klass !== null) {
            row = new klass(action, takeable, callback);
          } else {
            Ti.API.debug("Warning: couldn't find table view row class " + action.tableViewRow + ". Instantiating generic.");
            row = new Zeebra.ActionRows.ActionTableViewRow(action, takeable, callback);
          }
          return row.row;
        }).call(this));
      }
      return _result;
    }).call(this);
    return rows;
  };
  SplashWindow.prototype.showLoading = function() {
    return this.loadingIndicator.show();
  };
  SplashWindow.prototype.hideLoading = function() {
    return this.loadingIndicator.hide();
  };
  Zeebra.SplashWindow = SplashWindow;
}).call(this);
