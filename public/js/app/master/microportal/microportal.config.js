angular.module('microportal.app', ['microportal.controller', 'microportal.service'])
    .config(function ($stateProvider) {
        $stateProvider
            .state ('microportal-add', {
                url: '/microportal/add',
                templateUrl: '/js/app/master/microportal/view/microportal-create.html',
                controller: 'MicroportalCreateController',
                controllerAs: 'vm'
            })
    });