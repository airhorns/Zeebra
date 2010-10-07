Ti.include("/app/models/observable.js")

class Object extends Zeebra.Observable
	constructor: () ->
		this.tid = hex_sha1(String(Math.random()*10))
		
	# @delegateTo: () ->
	# 	delegate = arguments[0]
	# 	if delegate and arguments.length > 1
	# 		
	# 		# For each passed method name, delegate it to the delegate
	# 		for name in arguments[1..arguments.length]
	# 			Ti.API.debug("Defining "+name+" on "+this)
	# 
	# 			this.prototype[name] = () ->
	# 				if this[delegate]?
	# 					this[delegate].apply(name, arguments)

Zeebra.Object = Object