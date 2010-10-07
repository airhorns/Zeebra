class TwitterActionTableViewRow extends Zeebra.ActionRows.ActionTableViewRow
	type: "TwitterActionTableViewRow"
	icon: ->
		"images/account_icons/TwitterAccount_32.png"
	buttonText: ->
		@action.buttonText

Zeebra.registerActionViewRow TwitterActionTableViewRow