angular.module('floor.app', ['floor.controller', 'floor.service', 'floor.directive', 'floor.filter'])
	.config(function($stateProvider, $urlRouterProvider, $httpProvider) {

		$stateProvider
			.state('floor', {
				url: '/floor',
				templateUrl: '/js/app/reservation/floor/view/index.html',
				controller: 'FloorCtrl',
				controllerAs: 'vm'
			})
	});