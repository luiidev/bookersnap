angular.module('customtag.app', ['customtag.controller', 'customtag.service'])
	.config(function($stateProvider, $urlRouterProvider) {
		$stateProvider
			.state('mesas.customtag', {
				url: '/custom-tag-guest',
				views: {
					'@': {
						templateUrl: '/js/app/tables/customtag/view/index.html',
						controller: 'CustomTagCtrl',
						controllerAs: 'vm'
					}
				}
				// templateUrl: '/js/app/tables/customtag/view/index.html'

			});
	});