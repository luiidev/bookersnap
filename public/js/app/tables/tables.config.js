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
            'customtag.app',
            'configuration.app',
            'availability.app',
            'grid.app'

        ])
        .constant("IdMicroSitio", idMicrositio)
        /*.constant("UrlServerNotify", "http://localhost:1337")
        .constant("ApiUrlMesas", 'http://localhost:3004/v1/es/microsites/' + idMicrositio)
        .constant("ApiUrlRoot", 'http://localhost:3004/v1/es')*/
        .constant("UrlServerNotify", "http://web.bookersnap.net:1337")
        .constant("ApiUrlMesas", 'http://apimesas.studework.com/v1/es/microsites/' + idMicrositio)
        .constant("ApiUrlRoot", 'http://apimesas.studework.com/v1/es')
        /*.constant("UrlServerNotify", "http://weblaravel.studework.vm:1337")
        .constant("ApiUrlMesas", 'http://apimesas.studework.vm/v1/es/microsites/' + idMicrositio)
        .constant("ApiUrlRoot", 'http://apimesas.studework.vm/v1/es')*/
        .config(function($stateProvider, $urlRouterProvider, $httpProvider) {
            $stateProvider
                .state('mesas', {
                    url: '/mesas',
                    templateUrl: ''
                });
        })
        .run(function($http, ServerNotification, IdMicroSitio) {
            //setAuthHeaders($http);
            ServerNotification.createConnection();
            ServerNotification.createRoom("microsites" + IdMicroSitio);
        });
})();