angular.module('block.app', ['block.controller', 'block.service', 'block.directive'])
	.config(function($stateProvider, $urlRouterProvider) {
		$stateProvider
			.state('block', {
				url: '/block/:date',
				templateUrl: '/js/app/tables/block/view/create.html'
			})
			.state('blockEdit', {
				url: '/block/:date/:block_id',
				templateUrl: '/js/app/tables/block/view/edit.html'
			})
	});