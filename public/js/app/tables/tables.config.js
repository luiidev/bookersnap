(function() {
'use strict';
var idMicrositio = obtenerIdMicrositio();
angular.module('tables.app', [
        //'auth.app',//proximanente
        'turn.app',
        'zone.app',
        'book.app',
        'block.app',
        'guest.app',
        'calendar.app',
        'floor.app',
        'reservation.app',
        'bookersnap.services',
        "customtag.app",
        "configuration.app"
    ])
    .constant("IdMicroSitio", idMicrositio)
    /*
    .constant("ApiUrlMesas", 'http://api-mesas.vh:3004/v1/es/microsites/' + idMicrositio)
    .constant("ApiUrlRoot", 'http://api-mesas.vh:3004/v1/es')
    */
    .constant("ApiUrlMesas", 'http://192.168.0.104/v1/es/microsites/' + idMicrositio)
    .constant("ApiUrlRoot", 'http://192.168.0.104/v1/es')
    .config(function($stateProvider, $urlRouterProvider, $httpProvider) {
        $stateProvider
            .state('mesas', {
                url: '/mesas',
                templateUrl: ''
            });
    })
    .run(function($http) {
        //console.log($http);
        //setAuthHeaders($http);
    });
})();