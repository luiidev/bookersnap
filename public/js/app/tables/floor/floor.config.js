angular.module('floor.app', ['floor.controller', 'floor.service', 'floor.directive', 'floor.filter', 'server.service'])
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
                controllerAs: 'rm'
            })
            .state('mesas.floor.walkin', {
                url: '/walkin',
                templateUrl: '/js/app/tables/floor/view/waitlist.html',
                controller: 'waitlistController',
                controllerAs: 'wm'
            })
            .state('mesas.floor.server', {
                url: '/server',
                templateUrl: '/js/app/tables/floor/view/server.html',
                controller: 'serverController',
                controllerAs: 'sm'
            })
            .state('mesas.floor.server.create', {
                url: '/create',
                views: {
                    'principal@mesas.floor': {
                        templateUrl: '/js/app/tables/floor/view/serverCreate.html',
                        controller: 'serverTablesController',
                        controllerAs: 'se'
                    },
                },
            })
            .state('mesas.floor.server.edit', {
                url: '/edit/:server_id',
                views: {
                    'principal@mesas.floor': {
                        templateUrl: '/js/app/tables/floor/view/serverEdit.html',
                        controller: 'serverTablesController',
                        controllerAs: 'se'
                    },
                },
            });
    });