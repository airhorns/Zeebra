class PlaceholderWindow extends Zeebra.GenericWindow
	constructor: (controller, theTitle, theText) ->
		super
		@win = Ti.UI.createWindow({title:theTitle,backgroundColor:'#fff'})
		label = Titanium.UI.createLabel({
			color: '#999',
			text: theText,
			font: {
				fontSize: 20,
				fontFamily: 'Helvetica Neue'
			},
			textAlign: 'center',
			width: 'auto'
		})
		@win.add(label);
 
Zeebra.PlaceholderWindow = PlaceholderWindow