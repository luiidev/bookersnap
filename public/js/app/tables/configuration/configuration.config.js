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
			})
			.state('mesas.configuration.basic', {
				url: '/configuration-reservation-basic',
				templateUrl: '/js/app/tables/configuration/view/configuration-basic.html',
				resolve: {
					$title: function() {
						return 'Configuración basica';
					}
				}
			})
			.state('mesas.configuration.reserve', {
				url: '/configuration-reservation-code',
				templateUrl: '/js/app/tables/configuration/view/configuration-code.html',
				resolve: {
					$title: function() {
						return 'Configuración código';
					}
				}
			})
			.state('mesas.configuration.user', {
				url: 'configuration-reservation-user',
				templateUrl: '/js/app/tables/configuration/view/configuration-user.html',
				resolve: {
					$title: function() {
						return '_Configuración usuario';
					}
				}
			});
	});