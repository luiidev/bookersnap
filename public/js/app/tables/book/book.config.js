angular.module('book.app', ['book.controller', 'book.service', 'book.directive', 'book.filter'])
    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('mesas.book', {
                url: '/book?date&date_end&turns&zones&sources&search_text&sort',
                views: {
                    "@": {
                        templateUrl: '/js/app/tables/book/view/parent.html',
                        controller: 'BookNotificationCtrl'
                    },
                    'index@mesas.book': {
                        templateUrl: '/js/app/tables/book/view/index.html',
                        controller: 'BookCtrl',
                        controllerAs: 'vm'
                    },
                },
                resolve: {
                    $title: function() {
                        return 'Book';
                    }
                }
            });

    });