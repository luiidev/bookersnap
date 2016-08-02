angular.module('turn.app', ['turn.controller','turn.service','turn.directive'])
.config(function ($stateProvider, $urlRouterProvider){
	$stateProvider
                .state ('turn', {
                        url: '/config/zone/:zone/turn',
                        templateUrl: '/js/app/tables/turn/view/index.html'
                })
                .state ('turn-create', {
                        url: '/config/zone/:zone/turn/new',
                        templateUrl: '/js/app/tables/turn/view/turn-create.html'
                })
                .state ('turn-edit', {
                        url: '/config/zone/:zone/turn/:turn/edit',
                        templateUrl: '/js/app/tables/turn/view/turn-edit.html'
                })
        
});