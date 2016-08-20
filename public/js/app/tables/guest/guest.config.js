angular.module('guest.app', ['guest.controller','guest.service','guest.directive'])
.config(function ($stateProvider, $urlRouterProvider){
	$stateProvider
		.state ('guest', {
			url: '/config/guest',
			templateUrl: '/js/app/tables/guest/view/index.html',
			controller: 'GuestCtrl',
			controllerAs: 'vm'
		}) 
		.state ('guest.create', {
			url: '/new',
			templateUrl: '/js/app/tables/guest/view/guest-create.html',
			controller: 'GuestCreateCtrl',
			controllerAs: 'vm'
		}) 
		.state ('guest.view', {
			url: '/:guest',
			templateUrl: '/js/app/tables/guest/view/guest-view.html',
			controller: 'GuestViewCtrl',
			controllerAs: 'vm'
		})
		.state ('guest.edit', {
			url: '/:guest/edit',
			templateUrl: '/js/app/tables/guest/view/guest-create.html',
			controller: 'GuestCreateCtrl',
			controllerAs: 'vm'
		})   
})
;