app.controller('mainCtrl', function ($scope, $http) {
	$scope.definitions = _const.definitions;
	$scope.notification;
	$scope.loading = "ms-MessageBar-Closed";

	var apiBaseUrl = _const.env === 'prod' ?
		'https://proxy-service20171106124327.herokuapp.com' :
		'http://localhost:3333';

	/**
	 * Make API request to proxy for word entities
	 * @param {object} options request configurations
	 */
	function requestDefinition(options) {
		return $http({
			url: apiBaseUrl + '/api/v1/dictionary?q=' + options.body.word,
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		})
	}

	/**
	 * More scientific definition link
	 * @param {string} word 
	 */
	function buildScientificLink(word) {
		return `https://en.wikipedia.org/wiki/${word.replace(' ', '_')}`;
	}

	function displayDefinition(definitions) {
		var word = definitions.results[0].id;
		var examples = definitions.results[0].lexicalEntries[0].entries[0].senses[0].examples;
		var scientificLink = buildScientificLink(word);

		definitions.results.scientificDefLink = scientificLink;
		$scope.definitions = definitions.results;
		self.definitions = definitions.results; // Test only //

		setTimeout(emDefinition(word), 3000);
		showNotification('success', 'Word entities found .', '#');
		hideNotification();
	}

	function handleHttpError(status) {
		showNotification('error', 'We could not find the word your looking for , please check your spelling or check for suggestions using the link below', '#');
		setTimeout(closeNotificationBar, 5000)
	}

	/**
	 * Emphasize on the word to be defined 
	 * @param {string} def definition
	 */
	function emDefinition(def) {
		jQuery('.example').map((i, ele) => {
			ele.innerHTML = ele.innerHTML.replace(` ${def}`, ` <b class="def"> ${def} </b> `);
		})
	}

	function openNotificationBar() {
		jQuery('.ms-MessageBar').addClass('ms-MessageBar-Open');
		jQuery('.ms-MessageBar').removeClass('ms-MessageBar-Closed');
	}

	function closeNotificationBar() {
		jQuery('.ms-MessageBar').addClass('ms-MessageBar-Closed');
		jQuery('.ms-MessageBar').removeClass('ms-MessageBar-Open');
	}

	function clearNotificationBar() {
		jQuery('.ms-MessageBar').removeClass('ms-MessageBar--success');
		jQuery('.ms-MessageBar').removeClass('ms-MessageBar--severeWarning');
		$scope.notification = null;
		$scope.loading = 'ms-MessageBar-Closed';
	}

	/**
	 * Hide notification after a while
	 */
	function hideNotification() {
		setTimeout(closeNotificationBar, 5000)
	}

	/**
	 * 
	 * @param {string} type type of notification
	 * @param {string} message 
	 * @param {string} helpLink string url for help content 
	 */
	function showNotification(type, message, helpLink) {
		$scope.notification = {};
		$scope.notification.message = message;
		$scope.notification.link = helpLink;

		openNotificationBar()
		// Happy route
		if (type === 'success') {
			jQuery('.ms-MessageBar').addClass('ms-MessageBar--success');
		}
		//Sad route 
		if (type === 'error') {
			jQuery('.ms-MessageBar').addClass('ms-MessageBar--severeWarning')
		}
	}


	/**
	 * @param {string} word to get synonyms 
	 */
	function requestSyms(word) {
		return requestDefinition('url', { header: 'req-header' })
	}

	$scope.pronounce = function (event) {
		var url = jQuery(event.target).attr('data-url').replace('http', 'https');
		var audio = document.createElement('audio');
		audio.src = url;
		audio.loop = false;
		audio.oncanplaythrough = (evt) => audio.play()
	};
	$scope.fetchDefinition = function (ev) {
		var word = jQuery('input[name="searchDef"]').val() || false;
		// Empty string
		if (!word) {
			return;
		}

		clearNotificationBar();
		showNotification('info', `Searching definitions of "${word}" `, '#');

		requestDefinition({
			body: {
				word: word
			}
		})
			.then((res) => displayDefinition(res.data),
			(err) => handleHttpError(err.statusText));
	};
});
