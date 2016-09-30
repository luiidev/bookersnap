angular.module('book.app', ['book.controller','book.service','book.directive'])
.config(function ($stateProvider, $urlRouterProvider){
	$stateProvider
		.state ('book', {
			url: '/book',
			templateUrl: '/js/app/tables/book/view/index.html'
		})
		/*
		.state ('block', {
			url: '/block/:fecha',
			templateUrl: '/js/app/tables/book/view/block.html'
		})
		*/
    
});