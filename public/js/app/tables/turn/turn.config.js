angular.module('turn.app', ['turn.controller', 'turn.service', 'turn.directive'])
        .config(function($stateProvider, $urlRouterProvider) {
                $stateProvider
                        .state('mesas.turn', {
                                url: '/config/turn',
                                views: {
                                        '@': {
                                                templateUrl: '/js/app/tables/turn/view/index.html',
                                                controller: 'TurnCtrl',
                                        }
                                },
                                resolve: {
                                        $title: function() {
                                                return 'Lista de turnos';
                                        }
                                }
                        })
                        .state('mesas.turn.active', {
                                url: '/turn-active',
                                templateUrl: '/js/app/tables/turn/view/turn-active.html',
                                resolve: {
                                        $title: function() {
                                                return 'Lista de turnos activos';
                                        }
                                }
                        })
                        .state('mesas.turn.inactive', {
                                url: '/turn-inactive',
                                templateUrl: '/js/app/tables/turn/view/turn-inactive.html',
                                resolve: {
                                        $title: function() {
                                                return 'Lista de turnos inactivos';
                                        }
                                }
                        })
                        .state('mesas.turn.create', {
                                url: '/new',
                                views: {
                                        '@': {
                                                templateUrl: '/js/app/tables/turn/view/turn-create.html',
                                                controller: 'TurnCreateCtrl',
                                        }
                                },
                                resolve: {
                                        $title: function() {
                                                return 'Crear turno';
                                        }
                                }
                        })
                        .state('mesas.turn.edit', {
                                url: '/:turn/edit',
                                views: {
                                        '@': {
                                                templateUrl: '/js/app/tables/turn/view/turn-edit.html',
                                                controller: 'TurnCreateCtrl',
                                        }
                                },
                                resolve: {
                                        $title: function() {
                                                return 'Editar turno';
                                        }
                                }
                        });

        });