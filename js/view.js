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
        this.filters = [];
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
                
                var resultsFound = 0;
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

                map.controls[google.maps.ControlPosition.TOP_CENTER].push(document.getElementById('locationField'));

                autocomplete.bindTo('bounds', map);

                places = new google.maps.places.PlacesService(map);
                
                autocomplete.addListener('place_changed', onPlaceChanged);
                nearbySearch();
                that.bindFilters(request, places, map, textSearch);
                that.bindDrawingManager(map);

                var directionsService = new google.maps.DirectionsService;
                var directionsDisplay = new google.maps.DirectionsRenderer;
                directionsDisplay.setMap(map);
                directionsDisplay.setPanel(document.getElementById('right-panel'));

                var directionPanel = document.getElementById('floating-panel');
                directionPanel.style.display = 'block';
                map.controls[google.maps.ControlPosition.TOP_RIGHT].push(directionPanel);

                /*
                var stats = $('#legend');
                stats.show();
                stats.css({'border':'3px solid #000'});
                */
                //map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(document.getElementById('legend'));

                map.controls[google.maps.ControlPosition.TOP_RIGHT].push(document.getElementById('filters'));

                function onPlaceChanged() {
                    var place = autocomplete.getPlace();
                    var newRequest = {
                        location: request.location,
                        bounds: map.getBounds(),
                        //type: ['restaurant'],
                        radius: request.radius,
                        query: place.name
                    };

                    if (place.geometry) {
                        map.panTo(place.geometry.location);
                        map.setZoom(13);
                        places.textSearch(newRequest, textSearch);
                    } else {
                      document.getElementById('autocomplete').placeholder = 'Enter a restaurant in Cebu';
                    }
                }

                function textSearch(results, status) {
                    processSearch(results, status);
                }

                function nearbySearch() {
                    //append new element bounds
                    //bound to current map only
                    request.bounds = map.getBounds();
                    places.nearbySearch(request, function(results, status) {
                        processSearch(results, status);
                    });
                }

                function processSearch(results, status){
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

                        map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(document.getElementById('listing'));
                        //stats.html('<h3>Stats</h3><div id="stats">Number of restaurant: <b>' + markers.length + '</b></div>');
                    }
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

                            directionsService.route({
                                origin: that.currentLoc,
                                destination: place.formatted_address,
                                travelMode: 'DRIVING'
                            }, function(response, status) {
                                if (status === 'OK') {
                                    directionsDisplay.setDirections(response);
                                    infoWindow.open(map, marker);
                                    $("#info-content").html(that.template.showInfo(place));

                                } else {
                                    window.alert('Directions request failed due to ' + status);
                                }
                            });
                        }
                    );
                }
            }
        };

        viewCommands[viewCmd]();
    };

    View.prototype.bindFilters = function (request, places, map, textSearch) {
        var that = this;    

        var filters = $( "#filters input:checkbox" );

        $(filters).click(function() {
            
            if ($(this).is(':checked')) {
                that.filters.unshift($(this).val());
            } else {
                that.filters.splice( $.inArray($(this).val(), that.filters), 1 );
            }
            
            var newRequest = {
                location: request.location,
                bounds: map.getBounds(),
                type: request.type,
                radius: request.radius,
                query: 'restaurant, ' + that.filters.toString(),
                keyword: that.filters.toString()
            };

            places.textSearch(newRequest, textSearch);    
            
        });

        
    };

    View.prototype.bindDrawingManager = function (map) {
        var drawingManager = new google.maps.drawing.DrawingManager({
            //drawingMode: google.maps.drawing.OverlayType.MARKER,
            drawingControl: true,
            drawingControlOptions: {
              position: google.maps.ControlPosition.BOTTOM_CENTER,
              drawingModes: ['circle', 'rectangle']
            },
            markerOptions: {icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'},
            circleOptions: {
              fillColor: '#ffff00',
              fillOpacity: 1,
              strokeWeight: 5,
              clickable: false,
              editable: true,
              zIndex: 1
            }
        });
        
        drawingManager.setMap(map);

        drawingManager.setOptions({
            drawingControl: true
        });

        /*
        google.maps.event.addListener(drawingManager, 'circlecomplete', function(circle) {
          var radius = circle.getRadius();
        });
        */
       
        google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {

          if (event.type == 'circle') {
            //var radius = event.overlay.getRadius();
          }
          if (event.type == 'rectangle') {
            //var radius = event.overlay.getRadius();
          }

          console.log(event.overlay);

        });

    };

    // Export to window
    window.app = window.app || {};
    window.app.View = View;
}(window));