angular.module('promotion.app', ['promotion.controller', 'promotionList.controller', 'promotion.service', 'promotion.directive', 'promotion.filter'])
    .config(function($stateProvider, $urlRouterProvider, $httpProvider) {

        $stateProvider
            .state('reservation.promotion', {
                url: '/promotion',
                views: {
                    'menuContent': {
                        templateUrl: '/js/app/reservation/promotion/view/index.html',
                        controller: 'PromotionCtrl',
                    }
                }
            })
            .state('reservation.promotion-list', {
                url: '/promotion/list',
                views: {
                    'menuContent': {
                        templateUrl: '/js/app/reservation/list-promo/promotion-list.html',
                        controller: 'PromotionListCtrl',
                    }
                }

            })
            .state('reservation.add', {
                url: '/promotion/add',
                views: {
                    'menuContent': {
                        templateUrl: '/js/app/reservation/promotion/view/promotion-add.html',
                        controller: 'PromotionAddCtrl',
                    }
                }
            })
            .state('reservation.edit', {
                url: '/promotion/:id/edit',
                views: {
                    'menuContent': {
                        templateUrl: '/js/app/reservation/promotion/view/promotion-edit.html',
                        controller: 'PromotionAddCtrl',
                    }
                }

            });



    });
