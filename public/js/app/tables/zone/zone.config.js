angular.module('zone.app', ['zone.controller','zone.service','zone.directive'])
.config(function ($stateProvider, $urlRouterProvider){
	$stateProvider
		.state ('zone', {
			url: '/zone',
			templateUrl: '/js/app/tables/zone/view/index.html'
		})
		.state ('zone.active', {
			url: '/zone-active',
			templateUrl: '/js/app/tables/zone/view/zone-active.html'
		})
		.state ('zone.inactive', {
			url: '/zone-inactive',
			templateUrl: '/js/app/tables/zone/view/zone-inactive.html'
		})
});