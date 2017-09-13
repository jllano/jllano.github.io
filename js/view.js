/*global qs, qsa, $on, $parent, $live */

(function (window) {
    'use strict';

    /**
     * View that abstracts away the browser's DOM completely.
     * It has two simple entry points:
     *
     *   - bind(eventName, handler)
     *     Takes a map application event and registers the handler
     *   - render(command, parameterObject)
     *     Renders the given command with the options
     */
    function View(template) {
        this.template = template;
    }

    View.prototype.render = function (viewCmd, map, request) {
        
        var that = this;

        var viewCommands = {
            showRestaurants: function () {
                
                var places, infoWindow;
                var markers = [];
                var autocomplete;
                var MARKER_PATH = 'https://developers.google.com/maps/documentation/javascript/images/marker_green';
                
                infoWindow = new google.maps.InfoWindow({
                    content: document.getElementById('info-content')
                });

                autocomplete = new google.maps.places.Autocomplete((
                    document.getElementById('autocomplete')), {
                        types: ['establishment'],
                });

                autocomplete.bindTo('bounds', map);

                places = new google.maps.places.PlacesService(map);

                autocomplete.addListener('place_changed', onPlaceChanged);
                search();

                function onPlaceChanged() {
                    var place = autocomplete.getPlace();

                    if (place.geometry) {
                      map.panTo(place.geometry.location);
                      map.setZoom(15);
                      search();
                    } else {
                      document.getElementById('autocomplete').placeholder = 'Enter a restaurant in Cebu';
                    }
                }

                function search() {
                    
                    //append new element bound
                    //bound to current map only
                    request.bounds = map.getBounds();

                    places.nearbySearch(request, function(results, status) {
                      if (status === google.maps.places.PlacesServiceStatus.OK) {
                        clearResults();
                        clearMarkers();
                        
                        for (var i = 0; i < results.length; i++) {
                          var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
                          var markerIcon = MARKER_PATH + markerLetter + '.png';
                          
                          markers[i] = new google.maps.Marker({
                            position: results[i].geometry.location,
                            animation: google.maps.Animation.DROP,
                            icon: markerIcon
                          });
                          
                          markers[i].placeResult = results[i];
                          google.maps.event.addListener(markers[i], 'click', showInfoWindow);
                          setTimeout(dropMarker(i), i * 100);
                          addResult(results[i], i);
                        }
                      }
                    });
                }

                function clearMarkers() {
                    for (var i = 0; i < markers.length; i++) {
                      if (markers[i]) {
                        markers[i].setMap(null);
                      }
                    }
                    markers = [];
                }

                function dropMarker(i) {
                    return function() {
                      markers[i].setMap(map);
                    };
                }

                function addResult(result, i) {
                    var tr = $(that.template.showResults(result, i));

                    $("#results").append(tr);

                    tr.bind("click", function() {
                      google.maps.event.trigger(markers[i], 'click');
                    });
                }

                function clearResults() {
                    $("#results").children().remove();
                }

                function showInfoWindow() {
                    var marker = this;
                    places.getDetails({placeId: marker.placeResult.place_id},
                        function(place, status) {
                          if (status !== google.maps.places.PlacesServiceStatus.OK) {
                            return;
                          }

                          infoWindow.open(map, marker);
                          $("#info-content").html(that.template.showInfo(place));
                        }
                    );
                }
            }
        };

        viewCommands[viewCmd]();
    };

    
    // Export to window
    window.app = window.app || {};
    window.app.View = View;
}(window));