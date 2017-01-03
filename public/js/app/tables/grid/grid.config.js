angular.module('grid.app', ['grid.controller', 'grid.service', 'grid.directive'])
    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('mesas.grid', {
                url: '/grid',
                views: {
                    "@": {
                        controller: 'GridCtrl',
                        controllerAs: 'vm',
                    }
                },
                resolve: {
                    $title: function() {
                        return 'Grid';
                    }
                }
            })
            .state('mesas.grid.index', {
                url: '/:date/:shift',
                views: {
                    "@": {
                        templateUrl: '/js/app/tables/grid/view/parent.html',
                        controller: 'GridNotificationCtrl'
                    },
                    'index@mesas.grid.index': {
                        templateUrl: '/js/app/tables/grid/view/index.html',
                        controller: 'GridMainCtrl',
                        controllerAs: 'vm'
                    },
                }
            });

    });