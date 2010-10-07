class ActionTableViewRow extends Zeebra.Object
	@InProgress: 1
	@Error: 2
	@Success: 3
	@Ready: 4
	type: "ActionTableViewRow"

	constructor: (action, takeable, clicked) ->
		return false unless action?
		@action = action
		@clicked = clicked
		@takeable = (takeable || false)
		@row =  this.getRowTemplate()
		@state = Zeebra.ActionTableViewRow.Ready

		this.displayPhoto()
		this.displayText()
		this.displayButton()

	getRowTemplate: ->
		row =  Titanium.UI.createTableViewRow {
			height: 41
			className: @action.type + @type
		}
		row.object = this
		return row

	displayButton: (style, title) ->
		style ?= Titanium.UI.iPhone.SystemButton.BORDERED
		title ?= if _.isFunction(@action.buttonText) then @action.buttonText() else @action.buttonText

		key = (String(style)+"style" || "nostyle")
		@buttons ?= {} # Keep an array to hold the different styled buttons since changing styles is apparently devastating to the Ti runtime
		shittyTI = style == Titanium.UI.iPhone.SystemButton.SPINNER
		unless @buttons[key]?
			# Set up opts. Get around Titanium bugs by not setting the enabled or title attributes if 
			# the style is the spinner type (which is proxied by a different object in titanium which
			# barfs when it gets these option)
			opts = {
				right:10
				color: "#000"
				width: 80
				height: 20
			}
			unless shittyTI
				opts.style = style if style?
			else
				opts.style = style
				opts.enabled = true
				opts.height = "auto"
				opts.width = "auto"

			button = Ti.UI.createButton opts

			unless shittyTI
				button.addEventListener "click", (e) =>
					if _.isFunction(@clicked)
						@clicked(this, e)
					else
						Titanium.API.error("Clicked callback can't be run because it isn't a function!")

			@buttons[key] = button
			@row.add(button)

		for k, b of @buttons
			b.hide()
		@buttons[key].title = title
		@buttons[key].enabled = @takeable
		@buttons[key].show()
		true

	displayText: ->
		text = Ti.UI.createLabel {
			top: 2
			left: 40
			color:'#000'
			text: this.text()
			font:{fontSize:16, fontWeight:'bold'}
		}
		@row.add(text)

	displayPhoto: ->
		photo = Ti.UI.createView {
			backgroundImage: this.icon()
			top: 4
			left: 4
			height: 32
			width: 32
		}
		@row.add(photo)

	# Updates the row to show the user it's currently running its action
	displayInProgress: ->
		d("Trying to display progress")
		@state = Zeebra.ActionTableViewRow.InProgress
		@takeable = false
		this.displayButton(Titanium.UI.iPhone.SystemButton.ACTION, " ")

	# Updates the row to show the user it's done running its action and it worked!
	displaySuccess: ->
		d("Trying to display success")
		@state = Zeebra.ActionTableViewRow.Success
		@takeable = false
		this.displayButton(Titanium.UI.iPhone.SystemButton.PLAIN, "Done!")
		d("Success displayed")

	# Updates the row to show that the action failed.
	displayError: (retry) ->
		d("Trying to display error")
		retry ?= true
		@state = Zeebra.ActionTableViewRow.Error
		@takeable = retry
		this.displayButton(null, if retry then "Retry?" else "Error!")
		d("Error displayed")

	icon: ->
		return "images/account_icons/GenericAccount_32.png"

	buttonText: ->
		return "Run"

	text: ->
		@action.actionName()

Zeebra.ActionRows = {}
Zeebra.registerActionViewRow = (klass) ->
	Zeebra.ActionRows[klass::type] = klass

Zeebra.ActionTableViewRow = ActionTableViewRow
Zeebra.registerActionViewRow ActionTableViewRow
