angular.module('grid.app', ['grid.controller', 'grid.service', 'grid.directive'])
    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('mesas.grid', {
                url: '/grid',
                views: {
                    "@": {
                        templateUrl: '/js/app/tables/grid/view/parent.html',
                        controller: 'GridNotificationCtrl'
                    },
                    'index@mesas.grid': {
                        templateUrl: '/js/app/tables/grid/view/index.html',
                        controller: 'GridCtrl',
                        controllerAs: 'vm'
                    },
                },
                resolve: {
                    $title: function() {
                        return 'Grid';
                    }
                }
            });

    });