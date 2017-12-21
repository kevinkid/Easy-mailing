/**
 * @description String utility methods
 *
 */

String.prototype.contains = function (..._args) {
	var results = new Array();
	var _str = this.toString();
	if (_str.length < 1 && _args.length < 1) return;
	_args.forEach(char => results.push(_str.search(char) > 0))
	return results.includes(true);
}
String.prototype.sentences = function () {
	// what is the best way to about sentence scoped auto-correct.
}
String.prototype.lastSentence = function () {
	return /[.].*$/gm.exec(this.toString())[0]
		.replace(/^[.]\s/, '')
}
// words in a sentence
String.prototype.words = function () {
	var _words = new Array();
	this.toString().split(' ')
		.forEach(word => {
			if (word != "")
				_words.push(word.replace(/[.|,]/, ''))
		})
	return _words;
}
// capitalize the 1st letter of a word
String.prototype.capitalize = function () {
	var _str = this.toString();
	return _str.charAt(0).toUpperCase() + _str.slice(1, _str.length)
}
String.prototype.remove = function (_expression) {
	return this.toString().replace(_expression, '');
}
String.prototype.removeAll = function (..._exps) {
	if (_exps.length > 1) {
		var _str = this.toString();
		_exps.forEach(exp => _str = _str.replace(exp, ''))
		return _str;
	}
}
String.prototype.isWord = function () {
	var _str = this.toString() + ' ';
	return /^[a-z]+-[a-z]|[a-z]+\s$/gmi.test(_str);// /^[a-z]+\s$/gmi
}
// piece of string is null/empty
String.prototype.null = function () {
	return this.toString() === '' ? null : false;
}
String.prototype.startingPhrase = function () {
	return /^[a-z|A-Z]+/.exec(this.toString())[0];
}
String.prototype.lastPhrase = function () {
	var _str = this.toString();
	var _lastPhrase = /^.*[\s|,|.|!|?]$/.test(_str) ? _str.trim(0, _str.length) : _str;
	_lastPhrase = /([a-z|0-9]+-[a-z|!\s|[0-9]]+|[a-z|0-9]+$)/gmi.exec(_lastPhrase)[0];
	return _lastPhrase;
}
// piece of string contains sentence terminating character
String.prototype.sentenceTerminator = function () {
	return /([a-z]+\-[a-z|!\s]+|[a-z]+)[.|!|?][\s]$/gmi.test(this.toString());
}
// piece of string contains a word terminating character
String.prototype.wordTerminator = function () {
	return /[a-z]+-[a-z|!\s]+|[a-z]+[\s]$/gmi.test(this.toString());
}