angular.module('configuration.app', ['configuration.controller', 'configuration.service'])
	.config(function($stateProvider, $urlRouterProvider) {
		$stateProvider
			.state('mesas.configuration', {
				url: '/configuration-reservation',
				views: {
					'@': {
						templateUrl: '/js/app/tables/configuration/view/index.html',
						controller: 'ConfigurationCtrl',
						controllerAs: 'vm',
						cache: false
					}
				}
			});
	});