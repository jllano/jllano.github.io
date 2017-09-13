/*jshint eqeqeq:false */
(function (window) {
	'use strict';

	/**
	 * Storage api constructor
	 *
	 */
	function Store(mapContainer, latLng) {
		this.mapContainer = map;
		this.latLng = latLng;
    }

	/**
	 * Load data by making request to the server
	 *
	 * @param {integer} id The note id
	 * @param {function} callback The callback to fire after saving
	 */
	Store.prototype.loadRestaurants = function (callback) {
		var params = {};
        //callback.call(this);
         var that = this;

        var map;
        
        map = new google.maps.Map(that.mapContainer, {
          center: that.latLng,
          zoom: 13,
        });

        callback.call(this, map);
    };

	// Export to window
	window.app = window.app || {};
	window.app.Store = Store;
})(window);