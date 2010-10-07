class PersistedObject extends Zeebra.Object
	# refresh interval in milliseconds
	refreshInterval: 1000
	markedToSynch: false
	
	constructor: (params) ->
		super()
		for k,v of params
			if _.isFunction(this[k])
				this[k].call(v)
			else if k == "lastSynched"
				this.lastSynched = new Date(v)
			else
				this[k] = v
		this.constructedWith = params
		
		this.markForSynching() if this.outOfSynch()
		
		root.addEventListener "synch:start", (e) =>
			if _.isFunction(this.synch) && @markedToSynch
				this.synch()

	@loadFromPersistable: (persisted) ->
		if _.isFunction(Zeebra[persisted.type])
			obj = new Zeebra[persisted.type](persisted)
			return obj
		else
			Ti.API.error("Unrecognized persisted type " + persisted.type + ". Persistable is :")
			Ti.API.error(persisted)
			return false

	persistable: () ->
		values = {
			type: @type
			lastSynched: if _.isDate(@lastSynched) then @lastSynched.getTime() else false
		}
		for val in this.persistableAttributes
			values[val] = this[val]

		return values

	newRecord: ->
		return ! this.persisted?
	
	changed: ->
		return true if this.newRecord()
		return @constructedWith == this.persistable()
	
	markAsSynched: ->
		@lastSynched = new Date()
		@markedToSynch = false
		
	markForSynching: ->
		@markedToSynch = true
			
	outOfSynch: ->
		return true unless _.isDate(@lastSynched)
		return (((new Date).getTime() - @refreshInterval) < @lastSynched.getTime())
		
Zeebra.PersistedObject = PersistedObject