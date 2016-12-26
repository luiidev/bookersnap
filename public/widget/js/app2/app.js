(function() {
    'use strict';

    var obtenerIdMicrositio = function() {
	    var url = location.href;
	    var pos = url.indexOf("/w/");
	    var id = url.substr(pos + 3);
	    var last_pos = id.indexOf("#/");

	    if(last_pos >= 0){
	    	id = id.substr(0, last_pos);
	    }else{
	    	id = url.substr(pos +3 , url.length);
	    }
	    
	    return id;
	};

	var idMicrositio = obtenerIdMicrositio();

	angular.module("App", ["ngLocale", "ui.bootstrap", "ngStorage"])
	    .constant("ApiUrlMesas", 'http://apimesas.studework.com/v1/es/microsites/'+idMicrositio)
	    .run(["$location" , function($location) {
	        var color = $location.search().color;
	        if (color) {
	            var style = angular.element("<style type=\"text/css\">.bs-color { color: #"+ color +" !important; } .bs-bgm { background: #"+ color +" !important;color: #fff; } </style>");
	            document.querySelector("head").appendChild(style[0]);
	        }
    }]);

})();