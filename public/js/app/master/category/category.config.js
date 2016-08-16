angular.module('category.app', ['category.controller', 'category.service'])
    .config(function ($stateProvider) {
        $stateProvider
            .state ('category', {
                url: '/category',
                templateUrl: '/js/app/master/category/view/index.html',
                controller: 'CategoryListController',
                controllerAs: 'vm'
            })
            .state ('category-add', {
                url: '/category/add',
                templateUrl: '/js/app/master/category/view/category-create.html',
                controller: 'CategoryCreateController',
                controllerAs: 'vm'
            })
            .state ('category-update', {
                url: '/category/update/:id',
                templateUrl: '/js/app/master/category/view/category-update.html',
                controller: 'CategoryUpdateController',
                controllerAs: 'vm'
            })

    });