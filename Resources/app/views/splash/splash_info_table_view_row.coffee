class SplashInfoTableViewRow extends Zeebra.Object
	constructor: (splash) ->
		@row = Titanium.UI.createTableViewRow {
			height: 80
			className: "codeInfoRow"
		}

		@splash = splash
		@row.object = this
		
		if splash.photo?
			text_offset = 70
			photo = Ti.UI.createImageView {
				image: splash.photo
				size: {height: 60, width: 60}
				top: 5
				left: 5
			}
		else
			text_offset = 5
		
		title = Ti.UI.createLabel {
			color:'#000'
			text: splash.name
			font:{fontSize:30, fontWeight:'bold'}
			top:5
			left:text_offset
			height:'auto'
			width:'auto'
		}
		
		@row.add(title)
		
		description = Ti.UI.createLabel {
			color:'#000'
			text: splash.description
			font:{fontSize:20, fontWeight:'bold'}
			top:45
			left: text_offset
			height:'auto'
			width:'auto'
		}
		
		@row.add(description)
		
		# if @account.name?
		#		realName = Ti.UI.createLabel {
		#			color:'#333'
		#			text: @account.name
		#			font:{fontSize:15, fontWeight:'bold'}
		#			top:30
		#			left:70
		#			height:'auto'
		#			width:'auto'
		#		}
		#		@row.add(realName)
	
Zeebra.SplashInfoTableViewRow = SplashInfoTableViewRow
	