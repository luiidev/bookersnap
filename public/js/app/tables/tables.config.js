//'use strict';
var idMicrositio = obtenerIdMicrositio();
angular.module('tables.app', [
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
    .constant("ApiUrlMesas", 'http://apimesas.studework.com/v1/es/microsites/' + idMicrositio)
    .constant("ApiUrlRoot", 'http://apimesas.studework.com/v1/es')

//.constant("ApiUrlMesas", 'http://api-mesas.vh/v1/es/microsites/' + idMicrositio)
//  .constant("ApiUrlRoot", 'http://api-mesas.vh/v1/es')

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