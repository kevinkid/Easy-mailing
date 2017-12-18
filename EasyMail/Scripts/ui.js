var app = angular.module('app', []);

//Office.initialize = function (reason) {
//	jQuery(document).ready(function () {
//		console.log('document ready')
//		jQuery(document).on('keypress', onEnterKeydown);
//	})
//}


/**
 * Automatic trigger search keyboard shortcut
 * @param {object} eve 
 */
function onEnterKeydown(eve) {
	var isFocused = $('input[name="searchDef"]').is(':focus');
	// $('input[name="searchDef"]').blur();
	if (isFocused && eve.keyCode === 13) {
		$('#searchDef').click();
	} else if (!isFocused) {
		$('input[name="searchDef"]').focus();
	}
}

function giveLove() {
	jQuery('.ms-Icon--Heart').toggleClass('ms-Icon--HeartFill');
}
