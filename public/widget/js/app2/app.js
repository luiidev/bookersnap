angular.module("App", ["ngLocale", "ui.bootstrap", "ngStorage"])
    .constant("ApiUrlMesas", 'http://localhost:3004/v1/es/microsites/1')
    .run(["$location" , function($location) {
        var color = $location.search().color;
        if (color) {
            var style = angular.element("<style type=\"text/css\">.bs-color { color: #"+ color +" !important; } .bs-bgm { background: #"+ color +" !important;color: #fff; } </style>");
            document.querySelector("head").appendChild(style[0]);
        }
    }]);