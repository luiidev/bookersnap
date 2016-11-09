angular.module('guest.app', ['guest.controller', 'guest.service', 'guest.directive'])
    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('mesas.guest', {
                url: '/config/guest',
                views: {
                    '@': {
                        templateUrl: '/js/app/tables/guest/view/index.html',
                        controller: 'GuestCtrl',
                        controllerAs: 'vm'
                    }
                },
                resolve: {
                    $title: function() {
                        return 'Lista de invitados';
                    }
                }

            })
            .state('mesas.guest.create', {
                url: '/new',
                templateUrl: '/js/app/tables/guest/view/guest-create.html',
                controller: 'GuestCreateCtrl',
                controllerAs: 'vm',
                resolve: {
                    $title: function() {
                        return 'Registrar Invitado';
                    }
                }
            })
            .state('mesas.guest.view', {
                url: '/:guest',
                templateUrl: '/js/app/tables/guest/view/guest-view.html',
                controller: 'GuestViewCtrl',
                controllerAs: 'vm',
                resolve: {
                    $title: function() {
                        return 'Perfil invitado';
                    }
                }
            })
            .state('mesas.guest.edit', {
                url: '/:guest/edit',
                templateUrl: '/js/app/tables/guest/view/guest-create.html',
                controller: 'GuestCreateCtrl',
                controllerAs: 'vm',
                resolve: {
                    $title: function() {
                        return 'Editar Invitado';
                    }
                }
            });
    });