(function() {
  var Event, EventSubscription, Observable;
  Observable = function() {};
  Observable.prototype.addEventListener = function(name, callback, scope) {
    this.eventsObserved = (typeof this.eventsObserved !== "undefined" && this.eventsObserved !== null) ? this.eventsObserved : {};
    this.eventsObserved[name] = (typeof this.eventsObserved[name] !== "undefined" && this.eventsObserved[name] !== null) ? this.eventsObserved[name] : new Observable.Event(name);
    this.eventsObserved[name].addListener({
      callback: callback,
      scope: scope
    });
    return new EventSubscription(this, name, callback, scope);
  };
  Observable.prototype.removeEventListener = function(name, callback, scope) {
    this.eventsObserved = (typeof this.eventsObserved !== "undefined" && this.eventsObserved !== null) ? this.eventsObserved : {};
    if (this.eventsObserved[name]) {
      this.eventsObserved[name].removeListener(callback, scope);
      return !this.eventsObserved[name].hasListeners() ? delete this.eventsObserved[name] : null;
    }
  };
  Observable.prototype.fireEvent = function(name, eventObject) {
    Titanium.API.debug("fireEvent#" + name);
    this.eventsObserved = (typeof this.eventsObserved !== "undefined" && this.eventsObserved !== null) ? this.eventsObserved : {};
    return this.eventsObserved[name] ? this.eventsObserved[name].fire(eventObject) : null;
  };
  Event = function(name) {
    this.name = name;
    this.listeners = [];
    this.firing = false;
    return this;
  };
  Event.prototype.fire = function(eventObject) {
    var _i, _len, _ref, _result, listener;
    if (this.listeners.length === 0) {
      return null;
    }
    try {
      this.firing = true;
      _result = []; _ref = this.listeners;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        listener = _ref[_i];
        _result.push(listener.callback.call(listener.scope || this, eventObject));
      }
      return _result;
    } finally {
      this.firing = false;
    }
  };
  Event.prototype.addListener = function(config) {
    return this.listeners.push(config);
  };
  Event.prototype.removeListener = function(callback, scope) {
    var _i, _len, _ref, listener, listenerToErase;
    listenerToErase = null;
    _ref = this.listeners;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      listener = _ref[_i];
      if (listener.callback === callback && listener.scope === scope) {
        listenerToErase = listener;
        return false;
      }
    }
    return listenerToErase !== null ? this.listeners.erase(listenerToErase) : null;
  };
  Event.prototype.hasListeners = function() {
    return this.listeners.length !== 0;
  };
  Observable.Event = Event;
  EventSubscription = function(target, name, callback, scope) {
    this.target = target;
    this.name = name;
    this.callback = callback;
    this.scope = scope;
    return this;
  };
  EventSubscription.prototype.destroy = function() {
    this.target.removeEventListener(this.name, this.callback, this.scope);
    this.target = null;
    this.callback = null;
    return (this.scope = null);
  };
  Zeebra.Observable = Observable;
  Zeebra.EventSubscription = EventSubscription;
  Zeebra.Event = Event;
}).call(this);
