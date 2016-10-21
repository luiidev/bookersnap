angular.module('microsite.app', ['microsite.controller', 'microsite.service'])
    .config(function($stateProvider) {
        $stateProvider
            .state('microsite-list', {
                url: '/microsite',
                views: {
                    '': {
                        templateUrl: '/js/app/master/microsite/view/microsite-index.html',
                    },
                    'ms@microsite-list': {
                        templateUrl: '/js/app/master/microsite/view/microsite-list.html',
                        controller: 'MicrositeListController',
                        controllerAs: 'vm',
                    },
                    'mp@microsite-list': {
                        templateUrl: '/js/app/master/microportal/view/microportal-list.html',
                        controller: 'MicroportalListController',
                        controllerAs: 'vm'
                    }
                },
                resolve: {
                    'acl': function($q, AclService, AccessService) {
                        return AccessService.check($q, AclService, 'microsites-manage');
                    }
                }
            })
            .state('microsite-add', {
                url: '/microsite/add',
                templateUrl: '/js/app/master/microsite/view/microsite-create.html',
                controller: 'MicrositeCreateController',
                controllerAs: 'vm',
                resolve: {
                    'acl': function($q, AclService, AccessService) {
                        return AccessService.check($q, AclService, 'microsites-manage');
                    }
                }
            });
    });