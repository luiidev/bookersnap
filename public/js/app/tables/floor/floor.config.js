angular.module('floor.app', ['floor.controller', 'floor.service', 'floor.directive', 'floor.filter', 'server.service', 'floor.notify.controller'])
    .constant("screenSizeFloor", {
        minSize: 675,
        header: 185,
        menu: 400
    })
    .config(function($stateProvider, $urlRouterProvider, $httpProvider) {
        $stateProvider
            .state('mesas.floor', {
                url: '/floor',
                views: {
                    '@': {
                        templateUrl: '/js/app/tables/floor/view/parent.html',
                        controller: 'FloorMainCtrl',
                        controllerAs: 'vm'
                    },
                    'index@mesas.floor': {
                        templateUrl: '/js/app/tables/floor/view/index.html',
                        controller: 'FloorCtrl',
                        controllerAs: 'vm'
                    },
                    'principal@mesas.floor': {
                        templateUrl: '/js/app/tables/floor/view/principal.html',

                    },
                    'tabReservaciones@mesas.floor': {
                        templateUrl: '/js/app/tables/floor/view/tabReservaciones.html',
                    },
                },
            })
            .state('mesas.floor.reservation', {
                url: '/reservation',
                templateUrl: '/js/app/tables/floor/view/reservation.html',
                controller: 'reservationController',
                controllerAs: 'rm',
            })
            .state('mesas.floor.walkin', {
                url: '/walkin',
                templateUrl: '/js/app/tables/floor/view/waitlist.html',
                controller: 'WaitListCtrl',
                controllerAs: 'wm',
            })
            .state('mesas.floor.server', {
                url: '/server',
                templateUrl: '/js/app/tables/floor/view/server.html',
                controller: 'serverController',
                controllerAs: 'sm',
            });
    });