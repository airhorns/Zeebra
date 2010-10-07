class AccountTableViewRow extends Zeebra.Object
	constructor: (account) ->
		@account = account
		@row = this.getTableViewRowTemplate()
		@row.className = account.type+"Row"

	getTableViewRowTemplate: ->
		row = Ti.UI.createTableViewRow()
		row.height = 60
		row.wrapper = this
		# Add image
		photo = Ti.UI.createView {
			backgroundImage: 'images/account_icons/'+@account.type+'_64.png'
			top:10
			left:15
			height: 40
			width: 40
		}
		
		row.add(photo)
		# image = Ti.UI.createImageView {
		# 	image: '../../../images/account_icons/Twitter.png'
		# 	top: 5
		# 	left: 5
		# 	height: 50
		# 	width: 50 }
		# row.add(image)
		return row

Zeebra.AccountTableViewRow = AccountTableViewRow

Ti.include("/app/views/accounts/twitter_account_table_view_row.js")