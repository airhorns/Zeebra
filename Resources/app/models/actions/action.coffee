class Action extends Zeebra.Object
	@declares: []
	valid: false
	icon: "images/account_icons/GenericAccount_16.png"
	
	## DECLARES ISNT ACCESSIBLE ON THE PROTOYPE, NEED REFERENCE TO CLASS. WHERE DO YOU GET IT?
	constructor: (attributes) ->
		decs = this.constructor.declares
		if (_.keys(attributes).length == decs.length)
			@valid = true
			for k, v of attributes
				if _.isFunction(this[k])
					@valid = (@valid && this[k].call(v))
				else
					this[k] = v
			
		else
			Ti.API.debug("Wrong amount of arguments passed to action constructor!")
			@valid = false
	
	readyToRun: (account) ->
		return true
		
	run: (account, success, failure) ->
		if this.readyToRun(account)
			this.action(account, success, failure)
		else
			this.failure(null, "Not ready to run!")

	action: (account, success, failure) ->
		success()

	actionName: () ->
		"An action"
	
	button: () ->
		true
		

Zeebra.Action = Action

Zeebra.Actions = {
	Twitter: {}
	Facebook: {}
	LinkedIn: {}
	Foursquare: {}
}

_.extend Zeebra.Actions, {
	newFromJSON: (passed_attributes) ->
		attributes = _.clone((passed_attributes || {}))
		type = attributes['_type']
		delete attributes['id']
		if type
			delete attributes['_type']
			types = type.split("::")
			
			# Find the action object by looping over the namespaces.	
			scope = Zeebra
			for namespace in types
				unless _.isUndefined(scope[namespace])
					scope = scope[namespace]
				else
					Ti.API.error("Unrecognized action namespace/type "+ type + ". Looked at Zeebra."+types.join("."))
					return false

			# If the action was succesfully found, initialize it and return it.
			if _.isFunction(scope)
				action = new scope(attributes)
				if action.valid
					return action
				else 
					Ti.API.error("Invalid action generated from attributes.")
					return false
			else
				Ti.API.error("Unrecognized action scope found at Zeebra."+types.join(".")+", it wasn't a function!")
				return false
		else
			Ti.API.error("Couldn't build action because no type attribute was provided.")
			return false
}

Ti.include("/app/models/actions/twitter/twitter_action.js")