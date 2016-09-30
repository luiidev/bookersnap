angular.module('turn.app', ['turn.controller', 'turn.service', 'turn.directive'])
        .config(function($stateProvider, $urlRouterProvider) {
                $stateProvider
                        .state('turn', {
                                url: '/config/turn',
                                templateUrl: '/js/app/tables/turn/view/index.html',
                                controller: 'TurnCtrl'
                        })
                        .state('turn-create', {
                                url: '/config/turn/new',
                                templateUrl: '/js/app/tables/turn/view/turn-create.html',
                                controller: 'TurnCreateCtrl'
                        })
                        .state('turn-edit', {
                                url: '/config/turn/:turn/edit',
                                templateUrl: '/js/app/tables/turn/view/turn-edit.html',
                                controller: 'TurnCreateCtrl'
                        });

        });