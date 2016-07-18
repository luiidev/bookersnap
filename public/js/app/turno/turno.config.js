angular.module('turno.app', ['turno.controller','turno.service','turno.directive'])
.config(function ($stateProvider, $urlRouterProvider){
	$stateProvider
		.state ('turno', {
			url: '/turno',
			templateUrl: 'js/app/turno/view/index.html'
		})

});