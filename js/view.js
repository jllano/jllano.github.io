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
                  zoom: 15
                });

                var infowindow = new google.maps.InfoWindow();
                var service = new google.maps.places.PlacesService(map);
                
                service.nearbySearch({
                  location: that.latLng,
                  radius: 5000,
                  type: ['Restaurants']
                }, callback);


                function callback(results, status) {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        for (var i = 0; i < results.length; i++) {
                            createMarker(results[i]);
                        }
                    }
                }

                function createMarker(place) {
                    var placeLoc = place.geometry.location;
                    var marker = new google.maps.Marker({
                    map: map,
                        position: place.geometry.location
                    });

                    google.maps.event.addListener(marker, 'click', function() {
                        infowindow.setContent(place.name);
                        infowindow.open(map, this);
                    });
                }
            }
        };

        viewCommands[viewCmd]();
    };

    
    // Export to window
    window.app = window.app || {};
    window.app.View = View;
}(window));