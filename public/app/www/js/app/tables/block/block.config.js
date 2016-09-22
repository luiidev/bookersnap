angular.module('block.app', ['block.controller', 'block.service', 'block.directive'])
    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('mesas.block', {
                url: '/block/:date',
                views: {
                    'menuContent': {
                        templateUrl: '/js/app/tables/block/view/create.html',
                    }
                }
            })
            .state('mesas.blockEdit', {
                url: '/block/:date/:block_id',
                views: {
                    'menuContent': {
                        templateUrl: '/js/app/tables/block/view/edit.html'
                    }
                }
            });

    });
