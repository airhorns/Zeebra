class RetweetAction extends Zeebra.TwitterAction
	type: "TwitterRetweetAction"
	buttonText: "Retweet"
	@declares: ["status_id"]

	action: (account, success, failure) ->
		account.api.retweet(@status_id, success, failure)

	actionName: () ->
		"Retweet this user"
Zeebra.Actions.Twitter.Retweet = RetweetAction
