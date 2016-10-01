angular.module('zone.app', ['zone.controller', 'zone.service', 'zone.directive'])
	.config(function($stateProvider, $urlRouterProvider, $httpProvider) {

		$stateProvider
			.state('mesas.zone', {
				url: '/config/zone',
				templateUrl: '/js/app/tables/zone/view/index.html'
			})
			.state('mesas.zone.active', {
				url: '/zone-active',
				templateUrl: '/js/app/tables/zone/view/zone-active.html'
			})
			.state('mesas.zone.inactive', {
				url: '/zone-inactive',
				templateUrl: '/js/app/tables/zone/view/zone-inactive.html'
			})
			.state('mesas.zone-create', {
				url: '/config/zone/new',
				templateUrl: '/js/app/tables/zone/view/zone-create.html'
			})
			.state('mesas.zone-edit', {
				url: '/config/zone/:id',
				templateUrl: '/js/app/tables/zone/view/zone-edit.html'
			})
			.state('mesas.zone-clone', {
				url: '/config/zone/:id/clone',
				templateUrl: '/js/app/tables/zone/view/zone-clone.html'
			});


	});