Ti.include('vendor/sha1.js')
Ti.include('vendor/oauth.js')

ZEEBRA_CONSUMER_SECRET = '1NrCi94u62mwaAvZyDjdznOVUN0vQdfsyLpiy2O4'
class TwitterOAuthAdapter extends Zeebra.Account

	# ZEEBRA SPECIFIC SETTINGS
	consumerSecret: ZEEBRA_CONSUMER_SECRET
	consumerKey: 'at0rryC4zHWNcIRhbIW0Fw'
	signatureMethod: 'HMAC-SHA1' #standard
	# the pin or oauth_verifier returned by the authorization process window
	pin: null
	# will hold the request token and access token returned by the service
	requestToken: null
	requestTokenSecret: null
	accessToken: null
	accessTokenSecret: null

	# the accessor is used when communicating with the OAuth libraries to sign the messages
	accessor: {
		consumerSecret: ZEEBRA_CONSUMER_SECRET,
		tokenSecret: ''
	}

	# will hold UI components
	authorizationWindow: null
	authorizationView: null
	authorizationWebView: null

	#	will tell if the consumer is authorized
	isAuthorized: ->
		return this.accessToken? && this.accessTokenSecret?

	# creates a message to send to the service
	createMessage: (url) ->
		message = {
			action: url,
			method: 'POST',
			parameters: [] 
		}
		message.parameters.push(['oauth_consumer_key', this.consumerKey])
		message.parameters.push(['oauth_signature_method', this.signatureMethod])
		return message

	# requests a requet token with the given Url
	getRequestToken: (url) ->
		this.accessor.tokenSecret = ''
		message = this.createMessage(url)
		OAuth.setTimestampAndNonce(message)

		OAuth.SignatureMethod.sign(message, this.accessor)

		parameterMap = OAuth.getParameterMap(message.parameters)
				
		xhr = Titanium.ajax {
			url: url
			type: "POST"
			data: parameterMap
			async: false
		}
		
		responseParams = OAuth.getParameterMap(xhr.responseText)
		
		this.requestToken = responseParams['oauth_token']
		this.requestTokenSecret = responseParams['oauth_token_secret']
		
		Ti.API.debug(xhr.responseText)
		return xhr.responseText

	# unloads the UI used to have the user authorize the application
	destroyAuthorizeUI: ->
		Ti.API.debug('destroyAuthorizeUI')
		# if the window doesn't exist, exit
		# return true if !this.authorizationWindow?
		# remove the UI
		try
			Ti.API.debug('destroyAuthorizeUI:webView.removeEventListener')
			this.authorizationWebView.removeEventListener('load', this.authorizeUICallback)
			Ti.API.debug('destroyAuthorizeUI:window.close()')
			this.authorizationWindow.close()
		catch ex
				Ti.API.debug(ex)
				Ti.API.debug('Cannot destroy the authorize UI. Ignoring.')

	# looks for the PIN everytime the user clicks on the WebView to authorize the APP
	# currently works with TWITTER
	authorizeUICallback: (e) ->
		xmlDocument = Ti.XML.parseString(e.source.html)
		nodeList = xmlDocument.getElementsByTagName('div')
		
		i = 0
		while i < nodeList.length
				node = nodeList.item(i)
				id = node.attributes.getNamedItem('id')
				if (id && id.nodeValue == 'oauth_pin')
						this.pin = node.text

						setTimeout((=> this.receivePinCallback()), 100) if (this.receivePinCallback?)

						id = null
						node = null

						this.destroyAuthorizeUI()

						break
				i++
		nodeList = null
		xmlDocument = null

	# this function will be called as soon as the application is authorized
	receivePin: ->
		# get the access token with the provided pin/oauth_verifier
		this.getAccessToken('https://api.twitter.com/oauth/access_token')
		# save the access token
		Ti.API.debug(this.accessToken)
		Ti.API.debug(this.accessTokenSecret)
		# Call callback once connected.
		this.connected() if this.connected?
	
	# shows the authorization UI
	showAuthorizeUI: (url) ->
		this.receivePinCallback = this.receivePin

		this.authorizationWindow = Ti.UI.createWindow({
				modal: true
				navBarHidden: true
		})
		
		transform = Ti.UI.create2DMatrix().scale(0)
		this.authorizationView = Ti.UI.createView({
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
		})
		
		# closeButton = Titanium.UI.createButton {
		# 	systemButton:Titanium.UI.iPhone.SystemButton.STOP
		# 	top: 15
		# 	right: 15
		# 	height: 30
		# 	width: 30
		# }
		
		closeLabel = Ti.UI.createLabel({
				textAlign: 'right'
				font: {
						fontWeight: 'bold'
						fontSize: '15pt'
				}
				text: '[X]'
				top: 0
				right: 12
				width: 20
		})
		
		this.authorizationWindow.open()

		this.authorizationWebView = Ti.UI.createWebView({
				autoDetect:[Ti.UI.AUTODETECT_NONE]
		})
		
		this.authorizationWebView.addEventListener('load', (e) => this.authorizeUICallback(e))
		this.authorizationView.add(this.authorizationWebView)
		this.authorizationWindow.add(this.authorizationView)
		
		closeLabel.addEventListener('click', => this.destroyAuthorizeUI())
		this.authorizationView.add(closeLabel)

		# closeButton.addEventListener('click', => this.destroyAuthorizeUI())
		# this.authorizationWindow.add(closeButton)

		animation = Ti.UI.createAnimation()
		animation.transform = Ti.UI.create2DMatrix()
		animation.duration = 500
		this.authorizationView.animate(animation)
	
	requestAccessWithUI:  (url) ->
		this.authorizationWebView.url = url
		this.authorizationWebView.reload()
	
	getAccessToken: (url) ->
		this.accessor.tokenSecret = this.requestTokenSecret

		message = this.createMessage(url)
		message.parameters.push(['oauth_token', this.requestToken])
		message.parameters.push(['oauth_verifier', this.pin])

		OAuth.setTimestampAndNonce(message)
		OAuth.SignatureMethod.sign(message, this.accessor)

		parameterMap = OAuth.getParameterMap(message.parameters)

		for p in parameterMap
			Ti.API.debug(p + ': ' + parameterMap[p])

		xhr = Titanium.ajax {
			url: url
			type: "POST"
			data: parameterMap
			async: false
		}
			
		responseParams = OAuth.getParameterMap(client.responseText)
		this.accessToken = responseParams['oauth_token']
		this.accessTokenSecret = responseParams['oauth_token_secret']

		Ti.API.debug('*** get access token, Response: ' + client.responseText)

		return client.responseText

	# TODO: remove this on a separate Twitter library
	send: (url, parameters, method, successCallback, errorCallback) ->
		method ?= 'GET'
		successCallback ?= (e) ->
		errorCallback ?= (e) ->

		Ti.API.debug('Sending a '+method+' message to the service at [' + url + '] with the following params: ' + JSON.stringify(parameters))
				
		if !this.accessToken? || !this.accessTokenSecret?
				Ti.API.debug('The send cannot be processed as the client doesn\'t have an access token.')
				return false

		this.accessor.tokenSecret = this.accessTokenSecret

		# Get message object
		message = this.createMessage(url)
		message.parameters.push(['oauth_token', this.accessToken])
		OAuth.setTimestampAndNonce(message)
		OAuth.SignatureMethod.sign(message, this.accessor)

		# Add non OAuth stuff to it (actual twitter interactions)
		for k, v of parameters
			message.parameters.push([k, v])
		message.method = method

		Ti.API.debug("Sending message: "+JSON.stringify(message))
		
		parameterMap = OAuth.getParameterMap(message.parameters)

		xhr = Titanium.ajax {
			url: url
			type: method
			data: parameterMap
			error: errorCallback
			success: successCallback
		}
		
		return client
		
	# Authorize: sets up the whole thing.
	authorizeWithTwitter: ->
		# show the authorization UI and call back the receive PIN function	
		this.showAuthorizeUI()
		
		Ti.API.debug("Getting Request token")
		token = this.getRequestToken('https://api.twitter.com/oauth/request_token')
		Ti.API.debug(token)
		if !token?
			Ti.API.debug("Token is null!")
			this.destroyAuthorizeUI()
			alert("There was an error getting authorization started with Twitter! Please try again.")
			return false

		this.requestAccessWithUI('https://api.twitter.com/oauth/authorize?' + token)
		
Zeebra.TwitterOAuthAdapter = TwitterOAuthAdapter