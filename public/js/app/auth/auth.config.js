angular.module('auth.app', ['auth.controller', 'auth.service'])


.config(function($stateProvider, $urlRouterProvider) {
	$stateProvider
		.state('auth', {
			url: '/auth',

			templateUrl: '/js/app/auth/view/index.html',
			controller: 'AuthCtrl',
			controllerAs: 'vm',

			resolve: {
				$title: function() {
					return 'Login';
				}
			}

		});
});