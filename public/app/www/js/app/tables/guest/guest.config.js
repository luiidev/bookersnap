angular.module('guest.app', ['guest.controller', 'guest.service', 'guest.directive'])
	.config(function($stateProvider, $urlRouterProvider) {
		$stateProvider
			.state('mesas.guest', {
				url: '/config/guest',
				views: {
					'menuContent': {
						templateUrl: '/js/app/tables/guest/view/index.html',
						controller: 'GuestCtrl',
						controllerAs: 'vm'
					}
				}
			})
			.state('mesas.guest.create', {
				url: '/new',
				views: {
					'guestView': {
						templateUrl: '/js/app/tables/guest/view/guest-create.html',
						controller: 'GuestCreateCtrl',
						controllerAs: 'vm',
					}
				}
			})
			.state('mesas.guest.view', {
				url: '/:guest',
				views: {
					'guestView': {
						templateUrl: '/js/app/tables/guest/view/guest-view.html',
						controller: 'GuestViewCtrl',
						controllerAs: 'vm',
					}
				}
			})
			.state('mesas.guest.edit', {
				url: '/:guest/edit',
				views: {
					'guestView': {
						templateUrl: '/js/app/tables/guest/view/guest-create.html',
						controller: 'GuestCreateCtrl',
						controllerAs: 'vm',
					}
				}
			});
	});