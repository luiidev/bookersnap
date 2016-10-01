angular.module('promotion.app', ['promotion.controller', 'promotionList.controller', 'promotion.service', 'promotion.directive', 'promotion.filter'])
    .config(function($stateProvider, $urlRouterProvider, $httpProvider) {

        $stateProvider
            .state('reservation.promotion', {
                url: '/promotion',
                templateUrl: '/js/app/reservation/promotion/view/index.html',
                controller: 'PromotionCtrl',
            })
            .state('reservation.promotion-list', {
                url: '/promotion/list',
                templateUrl: '/js/app/reservation/list-promo/promotion-list.html',
                controller: 'PromotionListCtrl',
            })
            .state('reservation.add', {
                url: '/promotion/add',
                templateUrl: '/js/app/reservation/promotion/view/promotion-add.html',
                controller: 'PromotionAddCtrl',
                /*views: {
			'': { templateUrl: '/js/app/reservation/promotion/view/add.html' },
    		'promotion@add': {
        		templateUrl: '/js/app/reservation/promotion/view/promotion-add.html',
                controller: 'PromotionAddCtrl',
      		},
      		'flyer@add': {
        		templateUrl: '/js/app/reservation/promotion/view/flyer-add.html',
                controller: 'FlyerAddCtrl',
            }
        }*/
            })
            .state('reservation.edit', {
                url: '/promotion/:id/edit',
                templateUrl: '/js/app/reservation/promotion/view/promotion-edit.html',
                controller: 'PromotionAddCtrl',
            });



    });