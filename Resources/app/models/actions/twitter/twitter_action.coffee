class TwitterAction extends Zeebra.Action
	@declares: ["TESTING123"]
	type: "TwitterAction"
	buttonText: "TwitterAction"
	accountType: "TwitterAccount"
	tableViewRow: "TwitterActionTableViewRow"
	
	readyToRun: (account) ->
		unless account.isAuthorized()
			Ti.API.debug("Trying to run action on non authorized account!")
			return false
		else
			return true

		
Zeebra.TwitterAction = TwitterAction

Ti.include("/app/models/actions/twitter/follow_action.js")
Ti.include("/app/models/actions/twitter/retweet_action.js")
Ti.include("/app/models/actions/twitter/status_update_action.js")