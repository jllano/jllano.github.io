/*jshint laxbreak:true */
(function (window) {
	'use strict';
	
	String.prototype.replaceAll = function(search, replacement) {
	    var target = this;
	    return target.replace(new RegExp(search, 'g'), replacement);
	};

	/**
	 * Sets up defaults for all the Template methods such as a default template
	 *
	 * @constructor
	 */
	function Template() {
		this.infoTemplate 
		=	'<div class="panel panel-default"><div class="panel-heading"><h3 class="panel-title">{{place.name}}</h3></div>'
		+ 	'<div class="panel-body"><table class="table table-bordered">'
		+   '	<tr id="iw-url-row" class="iw_table_row">'
		+	'		<th id="iw-icon" class="iw_table_icon"><img class="restaurantIcon" src="{{place.icon}}"/></th>'
		+	'		<td id="iw-url" align="left"><b><a href="{{place.url}}">{{place.name}}</a></b></td>'
		+	'	</tr>'
		+	'	<tr id="iw-address-row" class="iw_table_row">'
		+	'		<th class="iw_attribute_name">Address:</th>'
		+	'		<td align="left" id="iw-address">{{place.vicinity}}</td>'
		+	'	</tr>'
		+	'	<tr id="iw-phone-row" class="iw_table_row" {{style_phone_row}}>'
		+	'		<th class="iw_attribute_name">Telephone:</th>'
        +	'		<td align="left" id="iw-phone">{{place.formatted_phone_number}}</td>'
        +	'	</tr>'
        +	'	<tr id="iw-rating-row" class="iw_table_row" {{style_rating_row}}>'
        +	'		<th class="iw_attribute_name">Rating:</th>'
        +	'		<td id="iw-rating" align="left">{{rating}}</td>'
        +	'	</tr>'
        +	'	<tr id="iw-website-row" class="iw_table_row" {{style_website_row}}>'
        +	'		<th class="iw_attribute_name">Website:</th>'
        +	'		<td align="left" id="iw-website">{{website}}</td>'
        +	'	</tr>'
        +	'</table></div></div>';

        this.resultTemplate
        = 	'<tr>'
        +	'	<td>'
		+	'		<img src="{{marker_icon}}" class="placeIcon" classname="placeIcon">'
        +	'	</td>'
        +	'	<td>{{place.name}}</td>'
        +	'</tr>';

	}	

	/**
	 * Sets up control buttons
	 *
	 */
	Template.prototype.controls = function () {
		var controls =	'';

		return controls;	
	}

	Template.prototype.showResults = function (result, i) {
		var i, l;
		var MARKER_PATH = 'https://developers.google.com/maps/documentation/javascript/images/marker_green';
		var template = this.resultTemplate;

		var results = document.getElementById('results');
        var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
        var markerIcon = MARKER_PATH + markerLetter + '.png';

        var photos = result.photos;
        
        if (!photos) {
            photos = "";
        } else {
            photos = photos[0].getUrl({'maxWidth': 100, 'maxHeight': 100});
        }

        template = template.replace('{{marker_icon}}', photos);
        template = template.replace('{{place.name}}', result.name);

        return template;
    }

	Template.prototype.showInfo = function (place) {
		var i, l;
		var view = '';
		var hostnameRegexp = new RegExp('^https?://.+?/');
		
		var template = this.infoTemplate;

		var photos = place.photos;
		
		if (!photos) {
    		photos = "";
  		} else {
            photos = photos[0].getUrl({'maxWidth': 300, 'maxHeight': 300});
        }

        template = template.replace('{{place.icon}}', photos);
		template = template.replace('{{place.url}}', place.url);
		template = template.replaceAll('{{place.name}}', place.name);
		template = template.replace('{{place.vicinity}}', place.vicinity);
		
		if (place.formatted_phone_number) {
          template = template.replace('{{style_phone_row}}', '');
          template = template.replace('{{place.formatted_phone_number}}', place.formatted_phone_number);
        } else {
          template = template.replace('{{style_phone_row}}', 'style="display:none;"');
        }

        if (place.rating) {
          var ratingHtml = '';
          for (var i = 0; i < 5; i++) {
            if (place.rating < (i + 0.5)) {
              ratingHtml += '&#10025;';
            } else {
              ratingHtml += '&#10029;';
            }
          }
          template = template.replace('{{style_rating_row}}', '');
          template = template.replace('{{rating}}', ratingHtml);
        } else {
          template = template.replace('{{style_rating_row}}', 'style="display:none;"');
        }

        if (place.website) {
          var fullUrl = place.website;
          var website = hostnameRegexp.exec(place.website);
          if (website === null) {
            website = 'http://' + place.website + '/';
            fullUrl = website;
          }
          template = template.replace('{{style_website_row}}', '');
          template = template.replace('{{website}}', website);

        } else {
          template = template.replace('{{style_website_row}}', 'style="display:none;"');
        }

		return template;
	};

	// Export to window
	window.app = window.app || {};
	window.app.Template = Template;
})(window);