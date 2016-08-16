angular.module('guest.app', ['guest.controller','guest.service','guest.directive'])
.config(function ($stateProvider, $urlRouterProvider){
	$stateProvider
		.state ('guest', {
			url: '/config/guest',
			templateUrl: '/js/app/tables/guest/view/index.html',
			controller: 'GuestCtrl'
		})      
})
;