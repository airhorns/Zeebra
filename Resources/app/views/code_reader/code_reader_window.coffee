class CodeReaderWindow extends Zeebra.PlaceholderWindow
	constructor: (controller, theTitle, theText) ->
		super
		@win.addEventListener("focus", (e) => @controller.focused(e))

Zeebra.CodeReaderWindow = CodeReaderWindow