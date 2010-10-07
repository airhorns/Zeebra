Ti.include("/app/views/splash/splash_info_table_view_row.js")
Ti.include("/app/views/splash/actions/action_table_view_row.js")
Ti.include("/app/views/splash/actions/twitter_action_table_view_row.js")

class SplashWindow extends Zeebra.GenericWindow
	# Sets up the loading indicator
	constructor: (controller) ->
		super
		@win = Ti.UI.createWindow({title: "Scan Results",backgroundColor:'#fff'})

		@loadingIndicator = Titanium.UI.createActivityIndicator {
			style: Titanium.UI.iPhone.ActivityIndicatorStyle.PLAIN
			font: {
				fontFamily: 'Helvetica Neue'
				fontSize: 20
				fontWeight: 'bold' }
			color: '#000'
			message: 'Loading Scan Results ...'
			top: 100
		}
		@win.add(@loadingIndicator)

	# Once a splash has been successfully displayed, this displays it
	displaySplash: (splash) ->
		Ti.API.debug("Displaying splash \""+splash.name+"\", tid:"+splash.tid)
		this.hideError()

		@splash = splash
		@win.remove(@table) if @table?
		rows = this.getActionRows()
		rows.unshift this.getInfoRow()
		@table = Titanium.UI.createTableView({
			data: rows
			editable: false
			allowsSelection: false
		})

		@win.add(@table)
		this.hideLoading()

	# If a splash couldn't be fetched, this displays the notification and an optional retry button
	displayError: (msg, retry, callback) ->
		this.hideLoading()
		@errorLabel ?= Ti.UI.createLabel {
			color:'#000'
			font:{fontSize:20, fontWeight:'bold'}
			top:100
			height:'auto'
			width:300
		}
		@errorLabel.text = msg

		@win.add @errorLabel
		if retry
			unless @retryButton?
				@retryButton = Titanium.UI.createButton {
					title: "Retry"
					color:'#fff'
					backgroundImage:'images/buttons/BUTT_grn_off.png'
					backgroundSelectedImage:'images/buttons/BUTT_grn_on.png'
					backgroundDisabledImage: 'images/buttons/BUTT_drk_off.png'
					font:{fontSize:20,fontWeight:'bold',fontFamily:'Helvetica Neue'},
					top: 200
					width: 301
					height:57
				}
				@retryButton.addEventListener "click", (e) ->
					callback(e)

			@win.add @retryButton

	# Hides the error label and retry button.
	hideError: () ->
		@win.remove @errorLabel if @errorLabel?
		@win.remove @retryButton if @retryButton?


	getInfoRow: () ->
		row = new Zeebra.SplashInfoTableViewRow(@splash)
		return row.row

	# Gets all the TableViewRow objects corresponding to the splash's actions.
	getActionRows: () ->
		rows = for action in @splash.actions
			takeable = @controller.isActionTakeable(action)
			callback = @controller.takeActionFromRow
			klass = Zeebra.ActionRows[action.tableViewRow]
			if klass?
				row = new klass(action, takeable, callback)
			else
				Ti.API.debug("Warning: couldn't find table view row class "+action.tableViewRow+". Instantiating generic.")
				row = new Zeebra.ActionRows.ActionTableViewRow(action, takeable, callback)

			row.row
		rows

	showLoading: () ->
		@loadingIndicator.show()

	hideLoading: () ->
		@loadingIndicator.hide()

Zeebra.SplashWindow = SplashWindow
