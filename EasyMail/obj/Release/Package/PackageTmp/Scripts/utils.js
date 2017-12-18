// piece of string contains  some character
String.prototype.contains = function (..._args) {
	var results = new Array();
	var _str = this.toString();
	if (_str.length < 1 && _args.length < 1) return;
	_args.forEach(char => results.push(_str.search(char) > 0))
	return results.includes(true);
}
// sentences in the line
String.prototype.sentences = function () {}
// last sentence in a line
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
		});
	return _words;
}
// capitalize the 1st letter of a word
String.prototype.capitalize = function () {
	var _str = this.toString();
	return _str.charAt(0).toUpperCase() + _str.slice(1, _str.length)
}
// remove char from a piece of string
String.prototype.remove = function (_expression) {
	return this.toString().replace(_expression);
}
// remove all matching characters
String.prototype.removeAll = function (..._exps) {
	if (_exps.length > 1) {
		var _str = this.toString();
		_exps.forEach(exp => _str = _str.replace(exp, ''))
		return _str;
	}
}
