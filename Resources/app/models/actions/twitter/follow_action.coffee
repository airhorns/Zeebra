class FollowAction extends Zeebra.TwitterAction
	@declares: ["followee_id"]

	type: "TwitterFollowAction"
	buttonText: "Follow"

	action: (account, success, failure) ->
		account.api.addFriend(@followee_id, success, failure)
	
	actionName: () ->
		"Follow "+@followee_id

Zeebra.Actions.Twitter.Follow = FollowAction
