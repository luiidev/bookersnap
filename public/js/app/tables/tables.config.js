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
            "configuration.app",
            'availability.app'
        ])
        .constant("IdMicroSitio", idMicrositio)
//        .constant("UrlServerNotify", "http://localhost:1337")
//        .constant("ApiUrlMesas", 'http://api-mesas.vh/v1/es/microsites/' + idMicrositio)
//        .constant("ApiUrlRoot", 'http://api-mesas.vh/v1/es')
        .constant("UrlServerNotify", "http://weblaravel.studework.com:1337")
                .constant("ApiUrlMesas", 'http://apimesas.studework.com/v1/es/microsites/' + idMicrositio)
                .constant("ApiUrlRoot", 'http://apimesas.studework.com/v1/es')
        .config(function($stateProvider, $urlRouterProvider, $httpProvider) {
            $stateProvider
                .state('mesas', {
                    url: '/mesas',
                    templateUrl: ''
                });
        })
        .run(function($http, ServerNotification, IdMicroSitio) {
            setAuthHeaders($http);
            ServerNotification.createConnection();
            ServerNotification.createRoom("microsites" + IdMicroSitio);
        });
})();