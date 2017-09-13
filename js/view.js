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
        this.currentLoc = "";
    }

    View.prototype.getMyCurrentLocation = function(infoWindow, map){

        var that = this;

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            that.currentLoc = pos
            infoWindow.setPosition(pos);
            
            var userMarker = new google.maps.Marker({
                position: that.currentLoc,
                map: map,
                icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'
            });

          }, function() {
            that.handleLocationError(true, infoWindow, map.getCenter(), map);
          });
        } else {
          // Browser doesn't support Geolocation
          that.handleLocationError(false, infoWindow, map.getCenter(), map);
        }
    } 


    View.prototype.handleLocationError = function(browserHasGeolocation, infoWindow, pos, map) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
                              'Error: The Geolocation service failed.' :
                              'Error: Your browser doesn\'t support geolocation.');
        infoWindow.open(map);
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

                that.getMyCurrentLocation(infoWindow, map);

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
                      map.setZoom(13);
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