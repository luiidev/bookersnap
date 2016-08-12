angular.module('category.app', ['category.controller', 'category.service'])
    .config(function ($stateProvider) {
        $stateProvider
            .state ('category', {
                url: '/category',
                templateUrl: '/js/app/master/category/view/index.html',
                controller: 'CategoryListController',
                controllerAs: 'vm'
            })

    });