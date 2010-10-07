Ti.include("/app/models/actions/action.js")

class Splash extends Zeebra.Object
	@shortcodeRE: /\/s\/([a-zA-Z0-9]+)/m
	@backendURL: "http://localhost:3000/s/"

	@newFromDecodedData: (data, success, error) ->
		matches = @shortcodeRE.exec(data)

		if matches? && matches.length > 1
			shortcode = matches[1]

			data.replace(/\.(html|xml|json)/, ".json")
			unless data.match(".json")
				data += ".json"

			Titanium.ajax({
				url: data
				dataType: "json"
				success: (attributes, status, xhr) ->
					Ti.API.debug("Success fetching splash!")
					splash = new Zeebra.Splash(attributes)
					success(splash) if _.isFunction(success)
				error: (xhr, status, e) ->
					Ti.API.error("Error retrieving splash data. Status:"+status+", code:"+xhr.status)
					error(xhr, status, e)
			})
		else
			return false

	name: ""
	description: ""
	photo: ""
	text: ""
	constructor: (attributes) ->
		super()
		@actions = []
		for k,v of attributes
			if _.isFunction(this[k])
				this[k].call(v)
			else if k == "actions"
				this.setActions(v)
			else
				this[k] = v

	setActions: (passed_actions) ->
		for attrs in passed_actions
			action = Zeebra.Actions.newFromJSON(attrs)

			# newFromJSON will return false if the action attributes aren't valid
			if action != false
				@actions.push action

			else
				Ti.API.error("Invalid/Unknown action! Attributes were:")
				Ti.API.debug(attrs)

Zeebra.Splash = Splash
