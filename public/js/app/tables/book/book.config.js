angular.module('book.app', ['book.controller', 'book.service', 'book.directive', 'book.filter'])
    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('mesas.book', {
                url: '/book',
                views: {
                    "@": {
                        templateUrl: '/js/app/tables/book/view/index.html',
                        controller: 'BookCtrl',
                        controllerAs: 'vm'
                    }
                }

            });

    });