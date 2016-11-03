angular.module('book.app', ['book.controller', 'book.service', 'book.directive'])
	.config(function($stateProvider, $urlRouterProvider) {
		$stateProvider
			.state('mesas.book', {
				url: '/book',
				templateUrl: '/js/app/tables/book/view/index.html',
				controller: 'BookCtrl'
			});
		/*
		.state ('block', {
			url: '/block/:fecha',
			templateUrl: '/js/app/tables/book/view/block.html'
		})
		*/

	});