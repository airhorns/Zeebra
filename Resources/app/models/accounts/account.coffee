Zeebra.AccountTypes = []

class Account extends Zeebra.PersistedObject
	type: "GenericAccount"
	lastSynched: false
	refreshInterval: 1000*60*3 # 3 hours
	isAuthorized: ->
		false
		
	authorize: (callback) ->
		@_authCallback = callback
		this.fireEvent("authorization:start")
		true
	
	completeAuthorization: () ->
		@_authCallback(this) if @_authCallback?
		this.fireEvent("authorization:success")
		this.fireEvent("authorization:complete")
		true
		
Zeebra.Account = Account

Zeebra.registerAccount = (account_klass) ->
	Zeebra.AccountTypes.push account_klass
	Zeebra[account_klass::type] = account_klass
	
Ti.include("/app/models/accounts/twitter/twitter_account.js")
Ti.include("/app/models/accounts/facebook/facebook_account.js")
Ti.include("/app/models/accounts/google/google_account.js")
#Ti.include("/app/models/accounts/foursquare/foursquare_account.js")
Ti.include("/app/models/accounts/linkedin/linkedin_account.js")