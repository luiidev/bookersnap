angular.module('zona.app', ['zona.controller','zona.service','zona.directive'])
.config(function ($stateProvider, $urlRouterProvider){
	$stateProvider
		.state ('zona', {
			url: '/zona',
			templateUrl: '/js/app/zona/view/index.html'
		})
		.state ('zona.activo', {
			url: '/zona-activo',
			templateUrl: '/js/app/zona/view/zona-activo.html'
		})
		.state ('zona.inactivo', {
			url: '/zona-inactivo',
			templateUrl: '/js/app/zona/view/zona-inactivo.html'
		})
});