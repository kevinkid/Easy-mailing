app.controller('composeCtrl', function ($scope) {
	$scope.suggestions = [];

	self.suggestionsTimeout;
	var autoSaveInterval;
	var observer = new MutationObserver(handleMutation);
	var mutables = { childList: true };// configure mutations 
	var zero = 0;
	var spell;

	function spellChecker(phrase, callback) {
		spell = $Spelling.AjaxSpellCheck(phrase);
		spell.onSpellCheck = function (result, suggestions) {
			if (suggestions === true) {
				callback([phrase]);
			} else {
				spell = $Spelling.SpellCheckSuggest(phrase);
				callback(spell);
			}
		}
	}

	function validateBeforeEdits(lastPhrase, { word, range }) {
		var phrase = editor.currentPhrase();
		var edits = phrase.replace(lastPhrase, word);
		spell = $spelling.AjaxSpellCheck(edits);
		spell.onSpellCheck = (result, correct) => {
			if (correct) {
				editor.insertSuggestion({ word: word, range: range })
			}
		}
	}

	function doSpellCheck(callback) {
		var line = editor.cursorPosition();
		line.text = line.text.remove(/\n/gm);
		var lastPhrase = line.text.lastPhrase();
		var sentenceTerminatorRegx = /[.|?|!].*[a-z].*$/gmi; // @BUG: This doesn't check for words that contain heiphen eg. work-out.
		var dblSpaceRegx = /\s\s/gmi;//  Note that this is not effective because of words in the middle

		if (lastPhrase.isWord()) {

			var range = editor.editsRange();

			spellChecker(lastPhrase, function (suggestions) {
				var bestMatches = suggestions.filter(s => s.contains('\'', ' ') && s.replace(/\'|\s/gm, '') === lastPhrase);
				if (bestMatches.length >= 1) {
					validateBeforeEdits(lastPhrase, { word: bestMatches[0], range: range })
				} else {
					if (suggestions[0] != lastPhrase && suggestions.length > 0) {
						if (suggestions.length > 2 && !line.text.contains(dblSpaceRegx)) {
							range.endColumn = range.endColumn - 1;
							callback({ suggestions: suggestions, range: range, text: lastPhrase })// TODO: Fix highlighting errors
						} else if (suggestions.length === 1 && (line.fullText.words().length === 1 || sentenceTerminatorRegx.test(line.text))) {
							validateBeforeEdits(lastPhrase, { word: suggestions[0].capitalize(), range: range })
						} else if (suggestions.length === 1) {
							validateBeforeEdits(lastPhrase, { word: suggestions[0], range: range })
						}
					} else {
						if (suggestions[0] === lastPhrase) {
							if (line.fullText.words().length === 1) {
								validateBeforeEdits(lastPhrase, { word: lastPhrase.capitalize(), range: range })
							} else {
								if (sentenceTerminatorRegx.test(line.text) && line.text.lastSentence().words().length === 1) {
									validateBeforeEdits(lastPhrase, { word: lastPhrase.capitalize(), range: range })
								}
							}
						} else callback(false)
					}
					if (suggestions.length < 1 && (line.fullText.words().length === 1 || sentenceTerminatorRegx.test(line.text))) {
						validateBeforeEdits(lastPhrase, { word: lastPhrase.capitalize(), range: range })
					}
				}
			})
		} else callback(false)
	}

	/**
	 * @param {object} mutation mutation object
	 * @returns {boolean} last input contains word/sentence terminating characters
	 */
	function termination(mutation) {
		if (mutation.addedNodes.length != zero) {
			var line = editor.cursorPosition();
			var lastChar = line.text.charAt(line.text.length - 1);
			if (['.', ',', '!', '?', ' '].includes(lastChar)) {
				clearTimeout(self.suggestionsTimeout);
				editor.hideSuggestions();
				if (line.text.wordTerminator()) {
					return { type: "word" }
				}
				if (line.text.sentenceTerminator()) {
					return { type: "sentence" }
				}
			} else {
				return false;
			}
		}
	}

	function handleMutation(mutations) {
		mutations.forEach(function (mutation) {
			if (mutation.type === 'childList') {
				var terminator = termination(mutation);
				if (terminator != false | null | undefined) {
					// Execute word scoped auto-correct
					if (terminator.type === "word") {
						doSpellCheck((error) => {
							if (error) {
								editor.highlightSpellErrors([error])
							}
						})
					}
					// Execute sentence scoped auto-correct
					if (terminator.type === "sentence") { }
					return;
				} else {
					var phrase = editor.currentPhrase(mutation);
					if (phrase == null | undefined | phrase.null()) { return }
					self.suggestionsTimeout = setTimeout(function () {
						spellChecker(phrase, function (suggestions) {
							if (suggestions && suggestions.length != 0) {
								$scope.suggestions = suggestions;
								$scope.$apply()
								editor.showSuggestions(phrase);
							}
						})
					}, 500)
				}
			}
		})
	}

	function autoSave() {
		return;//  COMMENT ME IN PROD //
		autoSaveInterval = setInterval(function () {
			var message = editor.getArrayValue();
			var encrypted = encryptMessage(message);
			Office.context.ui.messageParent(JSON.stringify({
				command: 'saveDirty',
				message: encrypted
			}))
		}, 1000)
	}

	function onEditorKeyUp(eve) {
		if (eve.code === 'Escape') {
			eve.preventDefault()
			editor.hideSuggestions()
		} else {
			// numeric keys
			if (eve.keyCode >= 20 && eve.keyCode <= 30) {
				var suggestionsHidden = $('.suggestionPopup').css('display') === 'none';
				if (!suggestionsHidden) {
					var range = editor.editsRange();
					var word = $scope.suggestions[parseInt(eve.browserEvent.key) - 1];
					editor.insertSuggestion({
						range: range, 
						word: word
					})
				}
			}
		}
	}

	function getEditorValue() {
		var textLines = [];
		editor.model._lines.forEach(line => textLines.push(line._text));
		return textLines;
	}

	function initAutoCorrect(editor) {
		var DOMtarget = document.getElementsByClassName('view-lines')[0];
		observer.observe(DOMtarget, mutables);
	}


	function encryptMessage(message) {
		var key = '88d59a54802873497be87668f8cfd07e';
		var encryptedMsg = CryptoJS.encrypt(key, message);
		return encryptedMsg;
	}

	function decryptMessage(encryptedMsg) {
		var key = '88d59a54802873497be87668f8cfd07e';// 'key1'
		var decryptedMsg = CryptoJS.AES.decrypt(encryptedMsg, key);
		return decryptedMsg.toString(CryptoJS.enc.Utf8);
	}

	function onMessage(eve) {
		console.log('message recieved!');
		var message = JSON.parse(eve.originalEvent.data);
		if (message.draft != undefined) {
			initEditor({ value: message.draft }, (editor) => {
				editor.editor = editor;
				initAutoCorrect()
			})
		}
	}

	function loaded() {
		$('.suggestionPopup').on('click', ev => editor.onSuggestionClick(ev));
		$(window).on('message', onMessage);
	}

	// Initialise editor
	function initEditor(config, callback) {
		var editor = new Editor();
		self.editor = editor;
		editor.init(config, autoSave, onEditorKeyUp, callback);
	}

	self.initEditor = initEditor;
	self.initAutoCorrect = initAutoCorrect;
	self.autoSave = autoSave;
	self.loaded = loaded;
	self.decryptMessage = decryptMessage;
})