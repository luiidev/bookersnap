angular.module('turn.app', ['turn.controller','turn.service','turn.directive'])
.config(function ($stateProvider, $urlRouterProvider){
	$stateProvider
                .state ('turn', {
                        url: '/config/turn',
                        templateUrl: '/js/app/tables/turn/view/index.html'
                })
                .state ('turn.active', {
                        url: '/turn-active',
                        templateUrl: '/js/app/tables/turn/view/turn-active.html'
                })
                .state ('turn.inactive', {
                        url: '/turn-inactive',
                        templateUrl: '/js/app/tables/turn/view/turn-inactive.html'
                })
                .state ('turn-create', {
                        url: '/config/turn/new',
                        templateUrl: '/js/app/tables/turn/view/turn-create.html'
                })
                .state ('turn-edit', {
                        url: '/config/turn/edit',
                        templateUrl: '/js/app/tables/turn/view/turn-edit.html'
                })
        
});