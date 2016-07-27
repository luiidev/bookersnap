angular.module('zone.app', ['zone.controller','zone.service','zone.directive'])
.config(function ($stateProvider, $urlRouterProvider){
	$stateProvider
		.state ('zone', {
			url: '/config/zone',
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
		.state ('zone-create', {
			url: '/config/zone/new',
			templateUrl: '/js/app/tables/zone/view/zone-create.html'
		})
		.state ('zone-edit', {
			url: '/config/zone/:id',
			templateUrl: '/js/app/tables/zone/view/zone-edit.html'
		})
		.state ('zone-clone', {
			url: '/config/zone/:id/clone',
			templateUrl: '/js/app/tables/zone/view/zone-clone.html'
		})

});
