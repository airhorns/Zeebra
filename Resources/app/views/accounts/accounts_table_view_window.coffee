class AccountsTableViewWindow extends Zeebra.GenericWindow
	constructor: (controller, initialAccounts) ->
		super
		@win = Ti.UI.createWindow({title:"Accounts",backgroundColor:'#fff'})
		# Add new account button
		@addButton = Titanium.UI.createButton({
			systemButton:Titanium.UI.iPhone.SystemButton.ADD,
		})
		
		@addButton.addEventListener 'click', =>
			controller.addNewAccount()
		
		rows = for a in initialAccounts
			a.displayed = true
			this._getTableRowFromAccount(a)
		
		@table = Titanium.UI.createTableView({
			data: rows
			rowHeight: 60
			editable: true
		})
		
		@win.add(@table)
		@win.rightNavButton = @addButton
		
		@loading_indicator = Titanium.UI.createActivityIndicator()
		@loading_indicator.style = Titanium.UI.iPhone.ActivityIndicatorStyle.PLAIN
		@loading_indicator.font = {
			fontFamily: 'Helvetica Neue'
			fontSize: 15
			fontWeight: 'bold'
		}
		
		@loading_indicator.color = 'white'
		@loading_indicator.message = 'Loading...'
		
		@table.addEventListener "delete", (e) ->
			if e.row.wrapper?
				e.row.wrapper.account.fireEvent("state:deleted", e)
		
	showLoading: ->
		@win.setToolbar([@loading_indicator],{animated:true})
		@loading_indicator.show()
		setTimeout( => 
			this.hideLoading()
		, 3000)

	hideLoading: ->
		@loading_indicator.hide();
		@win.setToolbar(null,{animated:true})
	
	# Adds and registers a displayable account 
	displayAccount: (account) ->
		account.displayed = true
		this._addAccountToTable(account)

	updateAccountDisplay: (account) ->
		Ti.API.error("Updating account display -> NOT IMPLEMENTED")

	# Adds a displayable account to the tableview
	_addAccountToTable: (account) ->
		row = this._getTableRowFromAccount(account)
		@table.appendRow(row, {animated:true})

	_getTableRowFromAccount: (account) ->
		klass = Zeebra[account.type+"TableViewRow"]

		if klass?
			rowView = new klass(account)
			return rowView.row
		else
			return false

Zeebra.AccountsTableViewWindow = AccountsTableViewWindow