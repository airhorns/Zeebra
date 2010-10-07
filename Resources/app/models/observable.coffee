# Taken from http://developer.appcelerator.com/question/24501/event-model-for-any-object#question
# Thankyou internet, oh so much.

class Observable
	addEventListener: (name, callback, scope) ->
		@eventsObserved ?= {}
 
		@eventsObserved[name] ?= new Observable.Event(name)
		@eventsObserved[name].addListener { callback: callback, scope : scope }
 
		return new EventSubscription(this, name, callback, scope)

	removeEventListener: (name, callback, scope) ->
		@eventsObserved ?= {}
 
		if @eventsObserved[name]
			@eventsObserved[name].removeListener(callback, scope)
 
			if ! @eventsObserved[name].hasListeners()
				delete @eventsObserved[name]
 
	fireEvent: (name, eventObject) ->
		Titanium.API.debug "fireEvent#" + name
		@eventsObserved ?= {}
 
		if @eventsObserved[name] 
			@eventsObserved[name].fire(eventObject)

class Event
	constructor: (name) ->
		@name = name
		@listeners = []
		@firing = false
 
	fire: (eventObject) ->
		if @listeners.length == 0
			return
 
		try
			@firing = true
			for listener in @listeners
				listener.callback.call( listener.scope || this, eventObject )

		finally
			@firing = false
 
	addListener: (config) ->
		@listeners.push(config)
 
	removeListener: (callback, scope) ->
		listenerToErase = null

		for listener in @listeners
			if listener.callback == callback && listener.scope == scope
				listenerToErase = listener
				return false
 
		if listenerToErase != null
			@listeners.erase(listenerToErase)
 
	hasListeners: () ->
		return @listeners.length != 0

Observable.Event = Event

class EventSubscription
	constructor: (target, name, callback, scope) ->
		@target		= target
		@name			= name
		@callback = callback
		@scope		= scope
 
	destroy: () ->
		@target.removeEventListener(@name, @callback, @scope)
		@target		= null
		@callback = null
		@scope		= null
		
Zeebra.Observable = Observable
Zeebra.EventSubscription = EventSubscription
Zeebra.Event = Event