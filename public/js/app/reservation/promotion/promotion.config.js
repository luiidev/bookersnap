angular.module('promotion.app', ['promotion.controller','promotion.service','promotion.directive','promotion.filter'])
.config(function ($stateProvider, $urlRouterProvider, $httpProvider){

    $stateProvider
	.state ('promotion', {
	    url: '/promotion',
        templateUrl: '/js/app/reservation/promotion/view/index.html',
        controller: 'PromotionCtrl',
	}) 
    .state ('promotion-list', {
        url: '/promotion/list',
        templateUrl: '/js/app/reservation/promotion/view/promotion-list.html',
        controller: 'PromotionListCtrl',
    })
	.state ('add', {
		url: '/promotion/add',
		views: {
			'': { templateUrl: '/js/app/reservation/promotion/view/add.html' },
    		'promotion@add': {
        		templateUrl: '/js/app/reservation/promotion/view/promotion-add.html',
                controller: 'PromotionAddCtrl',
      		},
      		'flyer@add': {
        		templateUrl: '/js/app/reservation/promotion/view/flyer-add.html',
                controller: 'FlyerAddCtrl',
            }
        }
    });

    


});