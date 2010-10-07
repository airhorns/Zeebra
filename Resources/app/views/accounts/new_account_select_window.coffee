class NewAccountSelectWindow extends Zeebra.GenericWindow
	constructor: (controller, callback) ->
		Ti.API.debug("Creating select window")
		super
		
		@win = Ti.UI.createWindow {
				title: "Add Account"
				backgroundColor: "#000000"
		}

		data = for klass in Zeebra.AccountTypes
			name = klass.prototype.type
			item = Titanium.UI.createDashboardItem {
				image: "images/account_icons/"+name+'_64.png'
				type: name
				label: name.replace("Account", "")
			}
			item
		
		@dashboard = Titanium.UI.createDashboardView({
			data:data
		})
		
		# Hack to disable editing
		@dashboard.addEventListener 'edit', (e) =>
			@dashboard.stopEditing()
		
		@dashboard.addEventListener 'click', (e) =>
			if e.item
				type = e.item.type
				callback.call(controller, type)
		
		@win.add(@dashboard)
		Ti.API.debug("Done creating select window")
		
Zeebra.NewAccountSelectWindow = NewAccountSelectWindow