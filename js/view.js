/*global qs, qsa, $on, $parent, $live */

(function (window) {
    'use strict';

    /**
     * View that abstracts away the browser's DOM completely.
     * It has two simple entry points:
     *
     *   - bind(eventName, handler)
     *     Takes a helpdesk application event and registers the handler
     *   - render(command, parameterObject)
     *     Renders the given command with the options
     */
    function View(template, map) {
        this.template = template;
        this.map = map;
        this.latLng = {lat: 10.3157, lng: 123.8854}; //cebu
    }

    View.prototype.render = function (viewCmd, parameter) {
        
        var that = this;

        var viewCommands = {
            showRestaurants: function () {
                var map = new google.maps.Map(that.map, {
                  center: that.latLng,
                  zoom: 14
                });
            }
        };

        viewCommands[viewCmd]();
    };

    
    // Export to window
    window.app = window.app || {};
    window.app.View = View;
}(window));