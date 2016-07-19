angular.module('turn.app', ['turn.controller','turn.service','turn.directive'])
.config(function ($stateProvider, $urlRouterProvider){
	$stateProvider
		.state ('turn', {
			url: '/turn',
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

});