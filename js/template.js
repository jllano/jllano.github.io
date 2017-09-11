/*jshint laxbreak:true */
(function (window) {
	'use strict';

	/**
	 * Sets up defaults for all the Template methods such as a default template
	 *
	 * @constructor
	 */
	function Template() {
		this.restaurantTemplate =	'';
	}	

	/**
	 * Sets up control buttons
	 *
	 */
	Template.prototype.controls = function () {
		var controls =	'';

		return controls;	
	}

	Template.prototype.show = function (data) {
		var i, l;
		var view = '';
		
		return view;
	};

	// Export to window
	window.app = window.app || {};
	window.app.Template = Template;
})(window);