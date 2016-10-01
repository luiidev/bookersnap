angular.module('reservation.app', ['reservation.controller', 'reservation.service'])
.constant("screenSize", {minSize: 740, header: 70, menu: 400})
.config(function($stateProvider) {

    $stateProvider
        .state('reservation', {
            url: '/reservation',
            templateUrl: '/js/app/tables/reservation/view/index.html',
            controller: "reservationCtrl.Index",
            // controllerAs: 'vm',
        })
        .state('reservation-new', {
            url: '/reservation/:date/new',
            templateUrl: '/js/app/tables/reservation/view/new.html',
            controller: "reservationCtrl.Store",
            // controllerAs: 'vm',
        });

});