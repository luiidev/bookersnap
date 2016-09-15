angular.module('floor.app', ['floor.controller', 'floor.service', 'floor.directive', 'floor.filter', 'server.service'])
	.config(function($stateProvider, $urlRouterProvider, $httpProvider) {

		$stateProvider
			.state('floor', {
				url: '/floor',
				templateUrl: '/js/app/tables/floor/view/index.html',
				controller: 'FloorCtrl',
				controllerAs: 'vm'
			})
	});