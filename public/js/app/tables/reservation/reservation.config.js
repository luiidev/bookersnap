angular.module('reservation.app', ['reservation.controller', 'reservation.service'])
.constant("screenSize", {minSize: 740, header: 110, menu: 400})
.constant("quantityGuest", 100)
.config(function($stateProvider) {

    $stateProvider
        .state('mesas.reservation', {
            url: '/reservation',
            templateUrl: '/js/app/tables/reservation/view/index.html',
            controller: "reservationCtrl.Index",
            // controllerAs: 'vm',
        })
        .state('mesas.reservation-new', {
            url: '/reservation/:date/new',
            templateUrl: '/js/app/tables/reservation/view/new.html',
            controller: "reservationCtrl.Store",
            // controllerAs: 'vm',
        });

});