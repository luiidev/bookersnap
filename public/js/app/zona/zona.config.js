angular.module('zona.app', ['zona.controller','zona.service','zona.directive'])
.config(function ($stateProvider, $urlRouterProvider){
	$stateProvider
		.state ('zona', {
			url: '/zona',
			templateUrl: '/js/app/zona/view/index.html'
		})

});