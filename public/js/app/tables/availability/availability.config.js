angular.module('availability.app', ['availability.controller', 'availability.service'])
    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('mesas.availability', {
                url: '/availability-search',
                views: {
                    '@': {
                        templateUrl: '/js/app/tables/availability/view/index.html',
                        controller: 'AvailabilityController',
                        controllerAs: 'vm',
                    }
                }
            });
    });