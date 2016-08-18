angular.module('flyer.app', ['flyer.controller','flyer.service','flyer.directive'])
.config(function ($stateProvider, $urlRouterProvider, $httpProvider){

    $stateProvider
	.state ('flyer', {
	    url: '/promotion/:id/flyer',
        templateUrl: '/js/app/reservation/flyer/view/flyer.html',
        controller: 'FlyerAddCtrl',
	}); 

});