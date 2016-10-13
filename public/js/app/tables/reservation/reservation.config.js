angular.module('reservation.app', ['reservation.controller', 'reservation.service'])
    .constant("screenSize", {
        minSize: 675,
        header: 185,
        menu: 400
    })
    .constant("quantityGuest", 100)
    .config(function($stateProvider) {

        $stateProvider
            .state('mesas.reservation-new', {
                url: '/reservation/:date/new',
                views: {
                    '@': {
                        templateUrl: '/js/app/tables/reservation/view/new.html',
                        controller: "reservationCtrl.Store",
                        // controllerAs: 'vm',
                    }
                },
            })
            .state('mesas.reservation-edit', {
                url: '/reservation/:date/edit/:id',
                views: {
                    '@': {
                        templateUrl: '/js/app/tables/reservation/view/new.html',
                        controller: "reservationCtrl.Store",
                        // controllerAs: 'vm',
                    }
                },
            });

    });