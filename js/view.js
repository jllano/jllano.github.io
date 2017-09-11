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
    function View(template) {
        this.template = template;
        this.map = $('#map');
    }

    View.prototype.render = function (viewCmd, parameter) {
        
        var that = this;

        var viewCommands = {
            showRestaurants: function () {
                //that.map.html(that.template.show(parameter.restaurants));
            }
        };

        viewCommands[viewCmd]();
    };

    
    // Export to window
    window.app = window.app || {};
    window.app.View = View;
}(window));