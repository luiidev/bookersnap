angular.module('reservation.app', ['reservation.controller', 'reservation.service'])
    .constant("screenSize", {
        minSize: 400,
        header: 185,
        menu: 400
    })
    .constant("quantityGuest", 100)
    .config(function($stateProvider) {

        $stateProvider
            .state('mesas.reservation-new', {
                url: '/floor/reservation/:date/add',
                params: {
                    tables: null
                },
                views: {
                    '@': {
                        templateUrl: '/js/app/tables/reservation/view/index.html',
                        controller: "reservationCtrl.StoreUpdate",
                        controllerAs: 'rc',
                        reloadOnSearch: false,
                    }
                },
            })
            .state('mesas.reservation-edit', {
                url: '/floor/reservation/:date/edit/:id',
                views: {
                    '@': {
                        templateUrl: '/js/app/tables/reservation/view/index.html',
                        controller: "reservationCtrl.StoreUpdate",
                        controllerAs: 'rc',
                    }
                },
            });

    });