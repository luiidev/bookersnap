angular.module('reservation.app', ['reservation.controller', 'reservation.service'])
    .constant("screenSize", {
        minSize: 400,
        header: 120,
        menu: 400
    })
    .constant("quantityGuest", 100)
    .config(function($stateProvider) {
        var previousState = {
            PreviousState: [
                "$state",
                function($state) {
                    var currentStateData = {
                        name: $state.current.name,
                        params: $state.params,
                        url: $state.href($state.current.name, $state.params)
                    };
                    return currentStateData;
                }
            ]
        };

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
                    }
                },
                resolve: previousState
            }).state('mesas.reservation-edit', {
                url: '/floor/reservation/:date/edit/:id',
                views: {
                    '@': {
                        templateUrl: '/js/app/tables/reservation/view/index.html',
                        controller: "reservationCtrl.StoreUpdate",
                        controllerAs: 'rc',
                    }
                },
                resolve: previousState
            })
            .state('mesas.reservation-book-new', {
                url: '/book/reservation/:date/add',
                params: {
                    tables: null
                },
                views: {
                    '@': {
                        templateUrl: '/js/app/tables/reservation/view/index.html',
                        controller: "reservationCtrl.StoreUpdate",
                        controllerAs: 'rc',
                    }
                },
                resolve: previousState
            });
    });