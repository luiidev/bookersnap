angular.module('turno.app', ['turno.controller','turno.service','turno.directive'])
.config(function ($stateProvider, $urlRouterProvider){
	$stateProvider
		.state ('turno', {
			url: '/turno',
			templateUrl: 'js/app/turno/view/index.html'
		})
		.state ('turno.activo', {
                url: '/turno-activo',
                templateUrl: 'js/app/turno/view/turno-activo.html'
        })
        .state ('turno.inactivo', {
                url: '/turno-inactivo',
                templateUrl: 'js/app/turno/view/turno-inactivo.html'
        })

});