Jester.singleOrigin = false

Jester.AjaxHandler = (url, options) ->
	options.complete = options.onComplete
	options.url = url
	options.async = options.asynchronous
	return Titanium.ajax(options)

Jester.defaultPrefix = "http://localhost/"

	