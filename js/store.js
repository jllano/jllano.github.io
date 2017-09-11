/*jshint eqeqeq:false */
(function (window) {
	'use strict';

	/**
	 * Storage REST api constructor
	 *
	 * @param {function} callback Our fake DB uses callbacks because in
	 * real life you probably would be making AJAX calls
	 */
	function Store(callback) {
		callback = callback || function () {};
	}

	/**
	 * Load data by making request to the server
	 *
	 * @param {integer} id The note id
	 * @param {function} callback The callback to fire after saving
	 */
	Store.prototype.loadRestaurants = function (callback) {
		var params = {};
        
        var loadRequest = $.getJSON('', params, function (data) {});

		loadRequest.done(function(data){
			callback.call(this, data)
		});        
	};

	// Export to window
	window.app = window.app || {};
	window.app.Store = Store;
})(window);