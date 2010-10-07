class AuthorizationWebViewWindow extends Zeebra.GenericWindow
	constructor: (controller) ->
		super
		
		@win = Ti.UI.createWindow {
				modal: true
				navBarHidden: true
		}
				
		transform = Ti.UI.create2DMatrix().scale(0)
		
		@authorizationView = Ti.UI.createView {
				top: 5,
				width: 310,
				height: 450,
				border: 10,
				backgroundColor: 'white',
				borderColor: '#aaa',
				borderRadius: 20,
				borderWidth: 5,
				zIndex: -1,
				transform: transform
		}
		
		@closeLabel = Ti.UI.createLabel {
				textAlign: 'right'
				font: {
						fontWeight: 'bold'
						fontSize: '15pt'
				}
				text: '[X]'
				top: 0
				right: 12
				width: 20
		}
	
		@win.open()

		this.authorizationWebView = Ti.UI.createWebView({
				autoDetect:[Ti.UI.AUTODETECT_NONE]
		})
	
		@authorizationWebView.addEventListener('load', (e) => this.fireEvent("load", e))
		@authorizationView.add(@authorizationWebView)
		@win.add(@authorizationView)
	
		@loadCallback = => this.destroyAuthorizeUI()
		@closeLabel.addEventListener('click', @loadCallback)
		@authorizationView.add(@closeLabel)

		animation = Ti.UI.createAnimation()
		animation.transform = Ti.UI.create2DMatrix()
		animation.duration = 500
		@authorizationView.animate(animation)

	loadURL: (url) ->
		@authorizationWebView.url = url
		@authorizationWebView.reload()
		
	# unloads the UI used to have the user authorize the application
	destroyAuthorizeUI: ->
		Ti.API.debug('Destroying Authorize UI')
		# if the window doesn't exist, exit
		return true unless @win?
		# remove the UI
		try
			@authorizationWebView.removeEventListener('load', @loadCallback)
			@win.close()

		catch ex
			Ti.API.debug('Cannot destroy the authorize UI. Ignoring. Error:')
			Ti.API.error(ex)

Zeebra.AuthorizationWebViewWindow = AuthorizationWebViewWindow