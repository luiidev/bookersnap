angular.module('turn.app', ['turn.controller', 'turn.service', 'turn.directive'])
        .config(function($stateProvider, $urlRouterProvider) {
                $stateProvider
                        .state('mesas.turn', {
                                url: '/config/turn',
                                views: {
                                        'menuContent': {
                                                templateUrl: '/js/app/tables/turn/view/index.html',
                                                controller: 'TurnCtrl'
                                        }
                                }

                        })
                        .state('mesas.turn-create', {
                                url: '/config/turn/new',
                                views: {
                                        'menuContent': {
                                                templateUrl: '/js/app/tables/turn/view/turn-create.html',
                                                controller: 'TurnCreateCtrl'
                                        }
                                }
                        })
                        .state('mesas.turn-edit', {
                                url: '/config/turn/:turn/edit',
                                views: {
                                        'menuContent': {
                                                templateUrl: '/js/app/tables/turn/view/turn-edit.html',
                                                controller: 'TurnCreateCtrl'
                                        }
                                }
                        });

        });