(function() {
  var PersistedObject;
  var __hasProp = Object.prototype.hasOwnProperty, __bind = function(func, context) {
    return function(){ return func.apply(context, arguments); };
  }, __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  };
  PersistedObject = function(params) {
    var _ref, k, v;
    PersistedObject.__super__.constructor.call(this);
    _ref = params;
    for (k in _ref) {
      if (!__hasProp.call(_ref, k)) continue;
      v = _ref[k];
      if (_.isFunction(this[k])) {
        this[k].call(v);
      } else if (k === "lastSynched") {
        this.lastSynched = new Date(v);
      } else {
        this[k] = v;
      }
    }
    this.constructedWith = params;
    if (this.outOfSynch()) {
      this.markForSynching();
    }
    root.addEventListener("synch:start", __bind(function(e) {
      return _.isFunction(this.synch) && this.markedToSynch ? this.synch() : null;
    }, this));
    return this;
  };
  __extends(PersistedObject, Zeebra.Object);
  PersistedObject.prototype.refreshInterval = 1000;
  PersistedObject.prototype.markedToSynch = false;
  PersistedObject.loadFromPersistable = function(persisted) {
    var obj;
    if (_.isFunction(Zeebra[persisted.type])) {
      obj = new Zeebra[persisted.type](persisted);
      return obj;
    } else {
      Ti.API.error("Unrecognized persisted type " + persisted.type + ". Persistable is :");
      Ti.API.error(persisted);
      return false;
    }
  };
  PersistedObject.prototype.persistable = function() {
    var _i, _len, _ref, val, values;
    values = {
      type: this.type,
      lastSynched: _.isDate(this.lastSynched) ? this.lastSynched.getTime() : false
    };
    _ref = this.persistableAttributes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      val = _ref[_i];
      values[val] = this[val];
    }
    return values;
  };
  PersistedObject.prototype.newRecord = function() {
    var _ref;
    return !(typeof (_ref = this.persisted) !== "undefined" && _ref !== null);
  };
  PersistedObject.prototype.changed = function() {
    if (this.newRecord()) {
      return true;
    }
    return this.constructedWith === this.persistable();
  };
  PersistedObject.prototype.markAsSynched = function() {
    this.lastSynched = new Date();
    return (this.markedToSynch = false);
  };
  PersistedObject.prototype.markForSynching = function() {
    return (this.markedToSynch = true);
  };
  PersistedObject.prototype.outOfSynch = function() {
    if (!(_.isDate(this.lastSynched))) {
      return true;
    }
    return (((new Date()).getTime() - this.refreshInterval) < this.lastSynched.getTime());
  };
  Zeebra.PersistedObject = PersistedObject;
}).call(this);
