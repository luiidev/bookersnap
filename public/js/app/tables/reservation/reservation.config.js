angular.module('reservation.app', ['reservation.controller', 'reservation.service', 'reservation.filter'])
    .constant("screenSize", {
        minSize: 400,
        header: 120,
        menu: 400
    })
    .constant("quantityGuest", 100)
    .config(function($stateProvider) {
        $stateProvider
            .state('mesas.floor.reservation.add', {
                url: '/:date/add',
                params: {
                    tables: null,
                    hour: null
                },
                views: {
                    '@': {
                        templateUrl: '/js/app/tables/reservation/view/index.html',
                        controller: "reservationCtrl.StoreUpdate",
                        controllerAs: 'rc',
                    }
                },
            })
            .state('mesas.book-reservation-add', {
                url: '/book/reservation/:date/add',
                params: {
                    tables: null,
                    hour: null
                },
                views: {
                    '@': {
                        templateUrl: '/js/app/tables/reservation/view/index.html',
                        controller: "reservationCtrl.StoreUpdate",
                        controllerAs: 'rc',
                    }
                },
            }).state('mesas.book-reservation-add-params', {
                url: '/book/reservation/:date/add/:hour/:guest',
                params: {
                    tables: null,
                },
                views: {
                    '@': {
                        templateUrl: '/js/app/tables/reservation/view/index.html',
                        controller: "reservationCtrl.StoreUpdate",
                        controllerAs: 'rc',
                    }
                },
            }).state('mesas.floor.reservation.edit', {
                url: '/:date/edit/:id',
                views: {
                    '@': {
                        templateUrl: '/js/app/tables/reservation/view/index.html',
                        controller: "reservationCtrl.StoreUpdate",
                        controllerAs: 'rc',
                    }
                },
            })
            .state('mesas.book-reservation-edit', {
                url: '/book/reservation/:date/edit/:id',
                views: {
                    '@': {
                        templateUrl: '/js/app/tables/reservation/view/index.html',
                        controller: "reservationCtrl.StoreUpdate",
                        controllerAs: 'rc',
                    }
                },
            });
    });