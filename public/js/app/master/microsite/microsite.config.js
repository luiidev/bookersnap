angular.module('microsite.app', ['microsite.controller', 'microsite.service'])
    .config(function ($stateProvider) {
        $stateProvider
            .state ('microsite-list', {
                url: '/microsite',
                templateUrl: '/js/app/master/microsite/view/microsite-list.html',
                controller: 'MicrositeListController',
                controllerAs: 'vm'
            })
            .state ('microsite-add', {
                url: '/microsite/add',
                templateUrl: '/js/app/master/microsite/view/microsite-create.html',
                controller: 'MicrositeCreateController',
                controllerAs: 'vm'
            })
    });