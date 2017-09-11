(function (window) {
	'use strict';

	/**
	 * Takes a model and view and acts as the controller between them
	 *
	 * @constructor
	 * @param {object} model The model instance
	 * @param {object} view The view instance
	 */
	function Controller(model, view) {
		var that = this;
		
		that.model = model;
		that.view = view;

	}

	/**
	 * An event to fire to load default Restaurants
	 */
	Controller.prototype.loadRestaurants = function () {
		var that = this;

		that.model.getRestaurants(function (data) {
			that.view.render('showRestaurants', data);
		});

	};

	// Export to window
	window.app = window.app || {};
	window.app.Controller = Controller;
})(window);