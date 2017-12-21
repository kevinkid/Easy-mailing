class Editor {
	constructor() {
		this.editor = {};
		this.suggestions = {
			top: 0,
			bottom: 0,
			left: 0,
			right: 0
		};
		this.suggesting = false;
		this.suggestionCount = 0;
		this.currentWord;
		this.suggestions;
		this.suggestionPopup;
		this.spellErrors = [];
		this.suggestions = [];
		this.lastErrorRange = null;
	}

	get getValue() {
		this.editor.getValue()
	}
	set setValue(text) {
		this.editor.setValue(text)
	}

    /**
     *  @returns {Array} of editor value
     */
	getValueArray() {
		var messages = [];
		this.editor.model._lines.forEach(line => messages.push(line._text))
		return messages;
	}

	getSelection() {
		var selection = this.editor.getSelection()
		var value = this.editor.getModel().getValueInRange(selection)
		return value;
	}

	setSelection(selectionRange) {
		this.editor.setSelection(selectionRange);
		this.editor.focus();
	}

    /**
     * Initialise monaco editor
     * @param {object} config monaco editor configurations
     * @param {Function} autoSave 
     * @param {Function} xHandler external editor key handler
     * @param {Function} callback 
     */
	init(config, autoSave, xHandler, callback) {
		require.config({ paths: { 'vs': '/Content/monaco-editor/min/vs' } })
		require(['vs/editor/editor.main'], function () {
			var editor = monaco.editor.create(document.querySelector('.mailBody'), {
				value: config.value || `
Looking back on my past twenty years full of passions (1) and enthusiasm, I feel grateful and (2) to live a healthy and happy life. There are a lot of qualities I have learnt from ordinary life that guided me through. If I am asked to list the first three, I will put health, happiness of my family and enough financial support (3) as the passions I live for.
Health comes first for me. Without health, everything is meaningless. It is indispensable to everyone (4). Only when one is healthy can he start his own career, set up his own family and achieve any accomplishment (5). I always value health and regard it as the preliminary step (6) to possess a happy family and earn enough money.
Happiness of my family (7) is very important to me because I love my family wholeheartedly. I get pleasure in their joys and suffer what they suffer. Their infinite love and support motivate me to overcome any trouble or obstacle (8) I may meet. To make those I love happy is the biggest wish for me. What would millions of money (9) mean to me if I saw my family suffer from pain and agony (10)? Now that I’ve got a healthy body, I have plenty of time and opportunities to entertain my family. Then money comes third. (11)
Everyone must admit that they could never do without money (12). Money enables us to get food, a house for shelter, clothes to wear and furthermore (13) enjoyment. For example, with money, we can get a good education, travel around the world and receive fine medical treatment. Money is essential to satisfy our basic needs as well as further self-development.
As long as I am healthy, I’ll work hard to earn as much money as I can, then with it I buy substances (14) or services to make (15) my family live more comfortably. If everything goes on (16) smoothly, I’ll be absolutely the happiest girl in the world!`,
				language: 'text',
				scrollbar: {
					useShadows: false,
					verticalHasArrows: true,
					horizontalHasArrows: true,
					vertical: 'hidden',
					horizontal: 'hidden',
					verticalScrollbarSize: 0,
					horizontalScrollbarSize: 0,
					arrowSize: 0
				},
				matchBrackets: false,
				selectionHighlight: false,
				fontSize: 15,
				fontFamily: '11pt \'Segoe UI\', -apple-system, BlinkMacSystemFont, Roboto, \'Helvetica Neue\', Tahoma, sans-serif',
				lineNumbers: false,
				contextmenu: false,
				scrollBeyondLastLine: false,
				minimap: {
					enabled: false
				},
				renderLineHighlight: 'none',
				renderIndentGuides: false
			})
			// Hide search field
			editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_F, (e) => { return })
			editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_D, (e) => { return })
			editor.onKeyUp(xHandler)
			autoSave()
			callback(editor)
		})
	}

	onSuggestionClick(eve) {
		var suggestion = eve;
		var selected = eve.target.innerText;
		if (selected == undefined | null && selected == selected.null()) return;

		var line = this.cursorPosition();
		var phrase = this.currentPhrase();

		var startColumn = line.text.length - phrase.length;
		var endColumn = line.column;

		const range = new monaco.Range(
			line.number + 1,
			startColumn + 1,
			line.number + 1,
			endColumn + 1
		)
		const endingRange = new monaco.Range(
			line.number + 1,
			startColumn + selected.length + 1,
			line.number + 1,
			startColumn + selected.length + 1
		)
		this.insertSuggestion({ range: range, word: selected })
		this.setSelection(endingRange)
		this.hideSuggestions()
	}

	/**
	 * @return {object} range of the phrase being edited
	 */
	editsRange() {
		// Note that a user might be trying to edit a word from the middle.
		var line = this.cursorPosition();
		var lastPhrase = line.text.lastPhrase();
		var startingColumn = line.text.length - lastPhrase.length;
		var endingColumn = startingColumn + lastPhrase.length;
		var wordRegex = /[a-z|A-Z]/;
		var lastText = line.fullText.slice(line.column, line.fullText.length);
		var inline = wordRegex.test(lastText.charAt(1));

		//if (inline) {
		//	endingColumn += lastText.startingPhrase().length;
		//}

		return new monaco.Range(
			line.number + 1,
			startingColumn,
			line.number + 1,
			endingColumn + 1
		)
	}

    /**
     * Inserts suggestions in the current cursor position
     * @param {object} suggestion 
     */
	insertSuggestion(suggestion) {
		this.clearErrors([{ range: suggestion.range }])
		this.lastErrorRange = suggestion.range;
		this.editor.executeEdits('', [{
			range: suggestion.range,
			text: suggestion.word + ' '
		}])
	}

	cursorPosition() {
		var position = this.editor.getPosition();
		var line = this.editor.cursor._model._lines.filter((l, i) => i == position.lineNumber - 1)[0].text;
		return {
			text: line.slice(0, position.column - 1),
			fullText: line,
			number: position.lineNumber - 1,
			column: position.column - 1
		}
	}

	// Find the word phrase being edited
	currentPhrase() {
		var line = this.cursorPosition();
		var phrase = line.text.slice(0, line.column + 1);
		phrase = phrase.removeAll(
			/\n|\t/gm,
			/[\s]$/gm,
			/^.*[.|,|?|!]+[\s|a-z|A-Z|0-9]/gm,
			/^(.*)\s/gm
		)
		phrase = (phrase.length > 3) ? phrase : '';
		return phrase;
	}

	highlightSpellErrors(errors) {
		// Note this decorations migt be happening more than once .
		debugger; //<debug> Make sure the error highliting does not remove the selection highliting </debug>
		const decorationList = [];
		this.spellErrors = this.spellErrors.length > 0 ? this.spellErrors.concut(errors) : [];
		errors.forEach(function (error) {
			decorationList.push({
				range: error.range,
				options: {
					isWholeLine: false,
					className: 'monaco-editor redsquiggly'
				}
			})
		})
		this.editor.deltaDecorations([], decorationList);
	}

	highlightInfo(errors) {
		const decorationList = [];
		errors.forEach(function (error) {
			decorationList.push({
				range: new monaco.Range(4, 9, 4, 16),
				options: {
					isWholeLine: false,
					className: 'monaco-editor redsquiggly'
				}
			})
		})
		this.editor.deltaDecorations([], decorationList);
	}

	clearErrors(errors) {
		// Note after the insertion has happened remove the decoration, it might be causing the error in the cursor.
		// errors.ts:84 Uncaught Error: Cannot read property 'color' of undefined
		errors.forEach(error => {

			Object.keys(this.editor.model._decorations).forEach(id => {
				debugger; // <debug> clear errors in range  </debug>

				var decoration = this.editor.model._decorations[id];
				var decorationRange = decoration.range;

				if (decorationRange.startingColumn === error.range.startingColumn &&
					decorationRange.endColumn === error.range.endColumn) {

					editor.editor.model._decorations[id].options = { stickiness: false };
				}
			})
		})
	}

	/**
	 * Clear monaco decorations for cleared errors
	 */
	deleteClearedErrors() {

		var range = this.lastErrorRange;

		Object.keys(this.editor.model._decorations).forEach(id => {

			var decoration = this.editor.model._decorations[id];
			var decorationRange = decoration.range;

			if (decorationRange.startingColumn === range.startingColumn &&
				decorationRange.endColumn === range.endColumn) {

				delete editor.editor.model._decorations[id];
			}
		})
		this.lastErrorRange = null;
	}

	getCusorPosition(parentEl) {
		var offsetTop = parseInt($('.cursor').css('height').remove('px'));
		var pos = $('.cursor').offset();
		return {
			top: parseInt(pos.top) + offsetTop + 2.1,
			left: parseInt(pos.left) - 20
		}
	}

	activeLine() {
		var activeLines = [];
		var line = this.editor.cusor.model._lines.forEach((l, i) => l._state === "active" ?
			activeLines.push({
				state: 'active',
				text: l.text,
				number: i,
				count: i + 1
			}) : null)
		return activeLines[0]
	}

	repositionSuggestion() {
		var winWidth = window.outerWidth;
		var popupWidth = this.suggestionPopup.css('width').remove('px');
		var pos = editor.getCusorPosition();
		(parseInt(popupWidth) + pos.left) > winWidth + 200 ?
			pos.left = winWidth - (parseInt(popupWidth) - 250) : null;
		this.suggestionPopup.css('top', pos.top);
		this.suggestionPopup.css('left', pos.left + 'px');
	}

	hideSuggestions() {
		this.suggestionPopup.hide()
	}

	showSuggestions() {
		this.repositionSuggestion();
		clearTimeout(self.typingTimeout);
		self.typingTimeout = setTimeout(() => {
			this.suggestionPopup.show()
		}, 500)
	}
}
