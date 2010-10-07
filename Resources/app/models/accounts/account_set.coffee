class AccountSet extends Zeebra.Object
	
	constructor: () ->
		@accounts = []
		
		this.load()
  
	# Loads the account set from the app properties
	load: ->
		# Ti.API.debug("Loading accounts from : ")
		# Ti.API.debug(Ti.App.Properties.getString("ZeebraAccounts"))
		
		return [] unless Ti.App.Properties.hasProperty(this.key())
		try
			datas = JSON.parse(Ti.App.Properties.getString(this.key()))
		catch e
			Ti.API.error("Error parsing account set JSON from properties: ")
			Ti.API.error(e)
			return false
			
		datas ?= []
		accounts = []
		for datum in datas
			account = Zeebra.PersistedObject.loadFromPersistable(datum)
			if account
				Ti.API.info("Loaded "+account.type+" from persistable.")
				accounts.push account
				
		@accounts = accounts
		return @accounts
		
	# Persists the account set so the app can be closed. Works by serializing the accounts
	# to JSON and then saving in the app properties.
	save: -> 
		Ti.API.debug("Saving accounts store.")
		persistable_accounts = []
		for account in @accounts
			persistable_accounts.push(account.persistable())
		
		
		return Ti.App.Properties.setString(this.key(), JSON.stringify(persistable_accounts))
		
	key: ->
		return "ZeebraAccounts"

	addAccount: (account) ->
		Ti.API.debug("Account Added to store.")
		@accounts.push account
		this.save()
		
	removeAccount: (account) ->
		@accounts = _.without(@accounts, account)
		this.save()
		
Zeebra.AccountSet = AccountSet