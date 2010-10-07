(function() {
  var CodeReaderController;
  var __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  };
  Ti.include('app/models/splash.js');
  Ti.include('app/views/code_reader/code_reader_window.js');
  Ti.include('app/controllers/splash_controller.js');
  CodeReaderController = function() {
    this.window = new Zeebra.CodeReaderWindow(this, 'Scanner', 'Scan a code!');
    this.code = null;
    return this;
  };
  __extends(CodeReaderController, Zeebra.Controller);
  CodeReaderController.prototype.focused = function(e) {
    var _ref;
    if (typeof (_ref = this.code) !== "undefined" && _ref !== null) {

    } else {
      return this.attemptScan();
    }
  };
  CodeReaderController.prototype.attemptScan = function() {
    return Titanium.TiBar.scan({
      configure: {
        classType: "ZBarReaderViewController",
        sourceType: "Camera",
        cameraMode: "Default",
        symbol: {
          "QR-Code": true
        }
      },
      success: function(data) {
        var _ref;
        if (typeof (_ref = (typeof data === "undefined" || data === null) ? undefined : data.barcode) !== "undefined" && _ref !== null) {
          Titanium.Media.vibrate();
          return new Zeebra.SplashController(data.barcode, root.accountStore);
        }
      },
      cancel: function() {
        return alert("Canceled");
      },
      error: function() {
        return alert("Error");
      }
    });
  };
  Zeebra.CodeReaderController = CodeReaderController;
}).call(this);
