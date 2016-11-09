angular.module('floor.app', ['floor.controller', 'floor.service', 'floor.directive', 'floor.filter', 'server.service', 'floor.notify.controller']).constant("screenSizeFloor", {
        minSize: 675,
        header: 185,
        menu: 400
    })
    .config(function($stateProvider, $urlRouterProvider, $httpProvider) {
        $stateProvider.state('mesas.floor', {
                url: '/floor',
                views: {
                    '@': {
                        templateUrl: '/js/app/tables/floor/view/parent.html',
                        controller: 'FloorMainCtrl',
                        controllerAs: 'vm',
                        cache: true,
                    },
                    'index@mesas.floor': {
                        templateUrl: '/js/app/tables/floor/view/index.html',
                        controller: 'FloorCtrl',
                        controllerAs: 'vm'
                    },
                    'principal@mesas.floor': {
                        templateUrl: '/js/app/tables/floor/view/principal.html'
                    },
                    'tabReservaciones@mesas.floor': {
                        templateUrl: '/js/app/tables/floor/view/tabReservaciones.html'
                    },
                    // 'reservations@mesas.floor.reservation': {
                    //     url: '/reservation/:date/add',
                    //     templateUrl: '/js/app/tables/reservation/view/index.html',
                    //     controller: 'reservationCtrl.StoreUpdate',
                    //     controllerAs: 'rc',
                    //     parent: 'mesas.floor'
                    // },
                    // 'reservations@mesas.floor.reservation-edit': {
                    //     url: '/reservation/:date/edit/:id',
                    //     templateUrl: '/js/app/tables/reservation/view/index.html',
                    //     controller: 'reservationCtrl.StoreUpdate',
                    //     controllerAs: 'rc'
                    // }
                },
            }).state('mesas.floor.reservation', {
                url: '/reservation',
                views: {
                    "": {
                        templateUrl: '/js/app/tables/floor/view/reservation.html',
                        controller: 'reservationController',
                        controllerAs: 'rm'
                    }
                }
            }).state('mesas.floor.walkin', {
                url: '/walkin',
                templateUrl: '/js/app/tables/floor/view/waitlist.html',
                controller: 'WaitListCtrl',
                controllerAs: 'wm',
            }).state('mesas.floor.server', {
                url: '/server',
                templateUrl: '/js/app/tables/floor/view/server.html',
                controller: 'serverController',
                controllerAs: 'sm',
            })
            // .state('mesas.floor.reservation', {
            //     url: '/reservation/:date/add',
            //     templateUrl: '/js/app/tables/reservation/view/index.html',
            //     controller: 'reservationCtrl.StoreUpdate',
            //     controllerAs: 'rc',
            //     parent: 'mesas.floor'
            // })
            // .state('mesas.floor.reservation-edit', {
            //     url: '/reservation/:date/edit/:id',
            //     templateUrl: '/js/app/tables/reservation/view/index.html',
            //     controller: 'reservationCtrl.StoreUpdate',
            //     controllerAs: 'rc',
            //     parent: 'mesas.floor'
            // });
    });