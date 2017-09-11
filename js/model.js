(function (window) {
	'use strict';

	/**
	 * Creates a new Model instance and hooks up the storage.
	 *
	 * @constructor
	 * @param {object} storage A reference to the client side storage class
	 */
	function Model(storage) {
		this.storage = storage;
	}

	/**
	 * Retrieve default restaurants
	 *
	 * @param {function} [callback] The callback function to fire
	 */
	Model.prototype.getRestaurants = function (callback) {
		this.storage.loadRestaurants(callback);
	};
	
	// Export to window
	window.app = window.app || {};
	window.app.Model = Model;
})(window);