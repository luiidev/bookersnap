angular.module('floor.app', ['floor.controller', 'floor.service', 'floor.directive', 'floor.filter'])
	.config(function($stateProvider, $urlRouterProvider, $httpProvider) {

		$stateProvider
			.state('floor', {
				url: '/floor',
				templateUrl: '/js/app/tables/floor/view/index.html',
				controller: 'FloorCtrl',
				controllerAs: 'vm'
			})
			.state('floor.reservation', {
				url: '/reservation',
				templateUrl: '/js/app/tables/floor/view/reservation.html',
		controller: 'reservationController',
				controllerAs: 'rm'
			})
			.state('floor.walkin', {
				url: '/walkin',
				templateUrl: '/js/app/tables/floor/view/waitlist.html',
				controller: 'waitlistController',
				controllerAs: 'wm'
			})
			.state('floor.server', {
				url: '/server',
				templateUrl: '/js/app/tables/floor/view/server.html',
				controller: 'serverController',
				controllerAs: 'sm'
			})
	});